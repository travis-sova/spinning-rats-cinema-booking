const express = require("express");
const router = express.Router();
const db = require("../db");

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
      SELECT s.*,
        DATE_FORMAT(s.date, '%Y-%m-%d') AS date,
        m.name as movie_name,
        m.img as movie_img,
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
