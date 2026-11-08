const express = require("express");
const crypto = require("crypto");
const router = express.Router();
const db = require("../db");
const {
  DEFAULT_TICKET_PRICES_CENTS,
  SHOW_PRICE_COLUMNS,
} = require("../ticketPrices");
const {
  getSeatLayoutCount,
  getBaselineReservedSeats,
} = require("../showSeats");
const { authenticate, authenticateOptional } = require("../middleware/auth");
const { getVenue, getSeatRows, getVenueCapacity } = require("../venues");

const HOLD_MINUTES = 10;
const MAX_SEATS = 10;
const SEAT_RE = /^[A-Za-z0-9-]{1,10}$/;
const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const KINDS = new Set(["show", "event"]);

const FAKE_FAILURES = {
  "0002": "Your bank declined this card. Try a different card.",
  "9995": "This card has insufficient funds.",
};

function makeCode() {
  let out = "";
  for (let i = 0; i < 8; i++) out += CODE_CHARS[crypto.randomInt(CODE_CHARS.length)];
  return `${out.slice(0, 4)}-${out.slice(4)}`;
}

router.post("/", authenticateOptional, async (req, res) => {
  const { kind, tickets } = req.body;
  const itemId = Number(req.body.itemId);

  const valid =
    KINDS.has(kind) &&
    Number.isInteger(itemId) &&
    itemId > 0 &&
    Array.isArray(tickets) &&
    tickets.length >= 1 &&
    tickets.length <= MAX_SEATS &&
    tickets.every(
      (t) =>
        t &&
        typeof t.seat === "string" &&
        SEAT_RE.test(t.seat) &&
        Object.hasOwn(DEFAULT_TICKET_PRICES_CENTS, t.type)
    ) &&
    new Set(tickets.map((t) => t.seat)).size === tickets.length;

  if (!valid) {
    return res.status(400).json({ error: "Invalid tickets" });
  }

  const conn = await db.getConnection();
  const lockName = `order:${kind}:${itemId}`;
  let locked = false;

  try {
    const [[lock]] = await conn.execute("SELECT GET_LOCK(?, 5) AS got", [lockName]);
    if (lock.got !== 1) {
      return res.status(503).json({ error: "Busy, please try again" });
    }
    locked = true;

    let ticketPrices = DEFAULT_TICKET_PRICES_CENTS;
    let showCapacity;
    let seatLayoutCount;
    let venueSeatSet;
    let baselineReserved = new Set();
    if (kind === "show") {
      const columns = Object.values(SHOW_PRICE_COLUMNS).map((column) => `s.${column}`);
      const [shows] = await conn.execute(
        `SELECT s.seats AS seat_capacity, s.venue_id, ${columns.join(", ")}
           FROM shows s
          WHERE s.id = ?`,
        [itemId]
      );
      if (shows.length === 0) {
        return res.status(404).json({ error: "Show not found" });
      }
      const venue = getVenue(shows[0].venue_id);
      const layout = getSeatRows(venue);
      venueSeatSet = layout ? new Set(layout.flatMap((row) => row.seats)) : undefined;
      showCapacity = venue ? getVenueCapacity(venue) : Number(shows[0].seat_capacity);
      seatLayoutCount = venueSeatSet?.size ?? getSeatLayoutCount(showCapacity);
      baselineReserved = new Set(venueSeatSet ? [] : getBaselineReservedSeats(showCapacity));
      ticketPrices = Object.fromEntries(
        Object.entries(SHOW_PRICE_COLUMNS).map(([type, column]) => [
          type,
          shows[0][column],
        ])
      );
    }

    await conn.beginTransaction();

    if (kind === "show") {
      const requestedSeats = tickets.map((ticket) => {
        const match = /^S([1-9]\d*)$/.exec(ticket.seat);
        return match ? Number(match[1]) : NaN;
      });
      if (
        requestedSeats.some(
          (seatNumber, index) =>
            (venueSeatSet
              ? !venueSeatSet.has(tickets[index].seat)
              : !Number.isInteger(seatNumber) || seatNumber > seatLayoutCount) ||
            baselineReserved.has(tickets[index].seat)
        )
      ) {
        await conn.rollback();
        return res.status(400).json({ error: "One or more seats are not available" });
      }

      const [active] = await conn.execute(
        `SELECT COUNT(*) AS count
           FROM order_seats os
           JOIN orders o ON o.id = os.order_id
          WHERE o.kind = 'show' AND o.item_id = ?
            AND (o.status = 'paid' OR (o.status = 'pending' AND o.expires_at > NOW()))`,
        [itemId]
      );
      if (tickets.length > Math.max(0, showCapacity - active[0].count)) {
        await conn.rollback();
        return res.status(409).json({ error: "Not enough seats are available" });
      }
    }

    const seats = tickets.map((t) => t.seat);
    const placeholders = seats.map(() => "?").join(",");
    const [taken] = await conn.execute(
      `SELECT os.seat
         FROM order_seats os
         JOIN orders o ON o.id = os.order_id
        WHERE o.kind = ? AND o.item_id = ?
          AND os.seat IN (${placeholders})
          AND (o.status = 'paid' OR (o.status = 'pending' AND o.expires_at > NOW()))`,
      [kind, itemId, ...seats]
    );
    if (taken.length > 0) {
      await conn.rollback();
      return res.status(409).json({
        error: `Seats already taken: ${taken.map((t) => t.seat).join(", ")}`,
      });
    }

    const totalCents = tickets.reduce((sum, t) => sum + ticketPrices[t.type], 0);
    const id = crypto.randomUUID();

    await conn.execute(
      `INSERT INTO orders (id, kind, item_id, user_id, total_cents, expires_at)
       VALUES (?, ?, ?, ?, ?, NOW() + INTERVAL ${HOLD_MINUTES} MINUTE)`,
      [id, kind, itemId, req.user?.id ?? null, totalCents]
    );
    for (const t of tickets) {
      await conn.execute(
        "INSERT INTO order_seats (order_id, seat, ticket_type, price_cents) VALUES (?, ?, ?, ?)",
        [id, t.seat, t.type, ticketPrices[t.type]]
      );
    }

    await conn.commit();
    res.status(201).json({ id });
  } catch (err) {
    await conn.rollback().catch(() => {});
    res.status(500).json({ error: err.message });
  } finally {
    if (locked) await conn.execute("SELECT RELEASE_LOCK(?)", [lockName]).catch(() => {});
    conn.release();
  }
});

router.get("/mine", authenticate, async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT o.id, o.kind, o.item_id, o.total_cents,
              DATE_FORMAT(o.paid_at, '%Y-%m-%d %H:%i') AS purchased_at,
              os.seat, os.ticket_type, os.price_cents, os.ticket_code,
              m.name AS movie_name, c.name AS cinema_name,
              s.venue_id,
              DATE_FORMAT(s.date, '%Y-%m-%d') AS show_date, s.time AS show_time
         FROM orders o
         JOIN order_seats os ON os.order_id = o.id
         LEFT JOIN shows s ON o.kind = 'show' AND s.id = o.item_id
         LEFT JOIN movies m ON m.id = s.movie
         LEFT JOIN cinema c ON c.id = s.cinema
        WHERE o.user_id = ? AND o.status = 'paid'
        ORDER BY o.paid_at DESC, os.id`,
      [req.user.id]
    );

    const orders = new Map();
    for (const row of rows) {
      if (!orders.has(row.id)) {
        orders.set(row.id, {
          id: row.id,
          kind: row.kind,
          itemId: row.item_id,
          total: row.total_cents / 100,
          purchasedAt: row.purchased_at,
          movieName: row.movie_name,
          cinemaName: row.cinema_name,
          venueId: row.venue_id,
          showDate: row.show_date,
          showTime: row.show_time,
          tickets: [],
        });
      }
      orders.get(row.id).tickets.push({
        seat: row.seat,
        type: row.ticket_type,
        price: row.price_cents / 100,
        code: row.ticket_code,
      });
    }

    res.json([...orders.values()]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT id, kind, item_id, total_cents, card_last4,
              IF(status = 'pending' AND expires_at <= NOW(), 'expired', status) AS status
         FROM orders WHERE id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }
    const order = rows[0];

    const [seatRows] = await db.execute(
      `SELECT seat, ticket_type, price_cents, ticket_code
         FROM order_seats WHERE order_id = ? ORDER BY id`,
      [order.id]
    );

    res.json({
      id: order.id,
      kind: order.kind,
      itemId: order.item_id,
      status: order.status,
      total: order.total_cents / 100,
      cardLast4: order.card_last4,
      tickets: seatRows.map((s) => ({
        seat: s.seat,
        type: s.ticket_type,
        price: s.price_cents / 100,
        code: order.status === "paid" ? s.ticket_code : null,
      })),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/:id/pay", async (req, res) => {
  const last4 = String(req.body.last4 ?? "");
  if (!/^\d{4}$/.test(last4)) {
    return res.status(400).json({ error: "Invalid card" });
  }

  await new Promise((resolve) => setTimeout(resolve, 1500));

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [rows] = await conn.execute(
      "SELECT status, expires_at <= NOW() AS expired FROM orders WHERE id = ? FOR UPDATE",
      [req.params.id]
    );
    if (rows.length === 0) {
      await conn.rollback();
      return res.status(404).json({ error: "Order not found" });
    }
    if (rows[0].status === "paid") {
      await conn.rollback();
      return res.json({ status: "paid" });
    }
    if (rows[0].expired) {
      await conn.rollback();
      return res.status(410).json({ error: "This order has expired" });
    }

    const failure = FAKE_FAILURES[last4];
    if (failure) {
      await conn.rollback();
      return res.status(402).json({ error: failure });
    }

    const [seatRows] = await conn.execute(
      "SELECT id FROM order_seats WHERE order_id = ?",
      [req.params.id]
    );
    for (const seat of seatRows) {
      await conn.execute("UPDATE order_seats SET ticket_code = ? WHERE id = ?", [
        makeCode(),
        seat.id,
      ]);
    }
    await conn.execute(
      "UPDATE orders SET status = 'paid', paid_at = NOW(), card_last4 = ? WHERE id = ?",
      [last4, req.params.id]
    );

    await conn.commit();
    res.json({ status: "paid" });
  } catch (err) {
    await conn.rollback().catch(() => {});
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

module.exports = router;