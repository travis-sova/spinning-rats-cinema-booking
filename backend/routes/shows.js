const express = require("express");
const router = express.Router();
const db = require("../db");
const {
  getSeatLayoutCount,
  getBaselineReservedSeats,
} = require("../showSeats");
const { getVenue, getSeatRows } = require("../venues");

router.get("/show/:showId/seats", async (req, res) => {
  try {
    const [shows] = await db.execute(
      "SELECT seats AS capacity, venue_id FROM shows WHERE id = ?",
      [req.params.showId]
    );
    if (shows.length === 0) {
      return res.status(404).json({ error: "Show not found" });
    }

    const [rows] = await db.execute(
      `SELECT os.seat
         FROM order_seats os
         JOIN orders o ON o.id = os.order_id
        WHERE o.kind = 'show' AND o.item_id = ?
          AND (o.status = 'paid' OR (o.status = 'pending' AND o.expires_at > NOW()))`,
      [req.params.showId]
    );
    const capacity = Number(shows[0].capacity);
    const layout = getSeatRows(getVenue(shows[0].venue_id));
    const validSeats = layout ? new Set(layout.flatMap((row) => row.seats)) : null;
    const reserved = new Set(layout ? [] : getBaselineReservedSeats(capacity));
    rows.forEach(({ seat }) => {
      const match = /^S([1-9]\d*)$/.exec(seat);
      if (
        (validSeats && validSeats.has(seat)) ||
        (!validSeats && match && Number(match[1]) <= getSeatLayoutCount(capacity))
      ) {
        reserved.add(seat);
      }
    });

    res.json({
      availableSeats: Math.max(0, capacity - rows.length),
      totalSeats: validSeats?.size ?? getSeatLayoutCount(capacity),
      rows: layout,
      reservedSeats: [...reserved],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get shows for a specific movie
router.get("/movie/:movieId", async (req, res) => {
  try {
    const [shows] = await db.execute(
      `
            SELECT s.id, s.movie, s.cinema, s.venue_id, s.date, s.time, s.seats AS capacity,
              GREATEST(s.seats - (
                SELECT COUNT(*)
                  FROM order_seats os
                  JOIN orders o ON o.id = os.order_id
                 WHERE o.kind = 'show' AND o.item_id = s.id
                   AND (o.status = 'paid' OR (o.status = 'pending' AND o.expires_at > NOW()))
              ), 0) AS seats,
              c.name as cinema_name,
              s.adult_price_cents, s.student_price_cents,
              s.senior_price_cents, s.child_price_cents
            FROM shows s
            JOIN cinema c ON s.cinema = c.id
            JOIN movies m ON s.movie = m.id
            WHERE s.movie = ?
        `,
      [req.params.movieId]
    );
    res.json(shows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/show/:showId", async (req, res) => {
  try {
    const [show] = await db.execute(
      `
            SELECT s.id, s.movie, s.cinema, s.venue_id, s.date, s.time, s.seats AS capacity,
              GREATEST(s.seats - (
                SELECT COUNT(*)
                  FROM order_seats os
                  JOIN orders o ON o.id = os.order_id
                 WHERE o.kind = 'show' AND o.item_id = s.id
                   AND (o.status = 'paid' OR (o.status = 'pending' AND o.expires_at > NOW()))
              ), 0) AS seats,
              c.name as cinema_name, m.name as movie_name,
              m.description as description,
              s.adult_price_cents, s.student_price_cents,
              s.senior_price_cents, s.child_price_cents
            FROM shows s
            JOIN cinema c ON s.cinema = c.id
            JOIN movies m ON s.movie = m.id
            WHERE s.id = ?
        `,
      [req.params.showId]
    );
    res.json(show[0] || null);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
