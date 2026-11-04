const express = require("express");
const crypto = require("crypto");
const router = express.Router();
const db = require("../db");

const HOLD_MINUTES = 10;
const MAX_SEATS = 10;
const SEAT_RE = /^[A-Za-z0-9-]{1,10}$/;
const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const KINDS = new Set(["show", "event"]);

const TICKET_PRICES_CENTS = {
  Adult: 1060,
  Student: 838,
  Senior: 645,
  Child: 645,
};

const FAKE_FAILURES = {
  "0002": "Your bank declined this card. Try a different card.",
  "9995": "This card has insufficient funds.",
};

function makeCode() {
  let out = "";
  for (let i = 0; i < 8; i++) out += CODE_CHARS[crypto.randomInt(CODE_CHARS.length)];
  return `${out.slice(0, 4)}-${out.slice(4)}`;
}

router.post("/", async (req, res) => {
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
        Object.hasOwn(TICKET_PRICES_CENTS, t.type)
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

    if (kind === "show") {
      const [shows] = await conn.execute("SELECT id FROM shows WHERE id = ?", [itemId]);
      if (shows.length === 0) {
        return res.status(404).json({ error: "Show not found" });
      }
    }

    await conn.beginTransaction();

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

    const totalCents = tickets.reduce((sum, t) => sum + TICKET_PRICES_CENTS[t.type], 0);
    const id = crypto.randomUUID();

    await conn.execute(
      `INSERT INTO orders (id, kind, item_id, total_cents, expires_at)
       VALUES (?, ?, ?, ?, NOW() + INTERVAL ${HOLD_MINUTES} MINUTE)`,
      [id, kind, itemId, totalCents]
    );
    for (const t of tickets) {
      await conn.execute(
        "INSERT INTO order_seats (order_id, seat, ticket_type, price_cents) VALUES (?, ?, ?, ?)",
        [id, t.seat, t.type, TICKET_PRICES_CENTS[t.type]]
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