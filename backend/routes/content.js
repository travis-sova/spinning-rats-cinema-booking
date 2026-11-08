const express = require("express");
const router = express.Router();
const db = require("../db");
const { VENUES, venueResponse } = require("../venues");

router.get("/venues", (req, res) => {
  const cinemaId = Number(req.query.cinemaId);
  const venues = Number.isInteger(cinemaId)
    ? VENUES.filter((venue) => venue.cinemaId === cinemaId)
    : VENUES;
  res.json(venues.map(venueResponse));
});

router.get("/movies", async (req, res) => {
  try {
    const [movies] = await db.execute("SELECT * FROM movies");
    res.json(movies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/shows", async (req, res) => {
  try {
    const [shows] = await db.execute(`
      SELECT s.id, s.movie, s.cinema, s.venue_id, s.date, s.time,
        GREATEST(s.seats - (
          SELECT COUNT(*)
            FROM order_seats os
            JOIN orders o ON o.id = os.order_id
           WHERE o.kind = 'show' AND o.item_id = s.id
             AND (o.status = 'paid' OR (o.status = 'pending' AND o.expires_at > NOW()))
        ), 0) AS seats,
        DATE_FORMAT(s.date, '%Y-%m-%d') AS date,
        m.name as movie_name,
        m.img as movie_img,
        s.adult_price_cents,
        s.student_price_cents,
        s.senior_price_cents,
        s.child_price_cents,
        c.name as cinema_name
      FROM shows s
      JOIN movies m ON s.movie = m.id
      JOIN cinema c ON s.cinema = c.id
    `);
    res.json(shows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/cinemas", async (req, res) => {
  try {
    const [cinemas] = await db.execute("SELECT * FROM cinema");
    res.json(cinemas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
