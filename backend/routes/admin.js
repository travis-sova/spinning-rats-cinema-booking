const express = require("express");
const router = express.Router();
const db = require("../db");
const { authenticate, isAdmin } = require("../middleware/auth");

// Admin dashboard stats
router.get("/stats", authenticate, isAdmin, async (req, res) => {
  try {
    const [moviesCount] = await db.execute(
      "SELECT COUNT(*) as count FROM movies"
    );
    const [showsCount] = await db.execute("SELECT COUNT(*) as count FROM shows");
    const [usersCount] = await db.execute("SELECT COUNT(*) as count FROM user");

    res.json({
      movies: moviesCount[0].count,
      shows: showsCount[0].count,
      users: usersCount[0].count,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add new movie
router.post("/movies", authenticate, isAdmin, async (req, res) => {
  try {
    const { img, name, genre, description, rating } = req.body;
    const [result] = await db.execute(
      "INSERT INTO movies (img, name, genre, description, rating) VALUES (?, ?, ?, ?, ?)",
      [img, name, genre, description, rating]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new show
router.post("/shows", authenticate, isAdmin, async (req, res) => {
  try {
    const { movieId, cinemaId, date, time, seats } = req.body;
    const [result] = await db.execute(
      "INSERT INTO shows (movie, cinema, date, time, seats) VALUES (?, ?, ?, ?, ?)",
      [movieId, cinemaId, date, time, seats]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all users (admin only)
router.get("/users", authenticate, isAdmin, async (req, res) => {
  try {
    const [users] = await db.execute(
      "SELECT id, username, email, perms FROM user"
    );
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update user permissions
router.patch(
  "/users/:id/permissions",
  authenticate,
  isAdmin,
  async (req, res) => {
    try {
      const { perms } = req.body;
      if (perms !== 0 && perms !== 1) {
        return res.status(400).json({ error: "Invalid permission level" });
      }

      await db.execute("UPDATE user SET perms = ? WHERE id = ?", [
        perms,
        req.params.id,
      ]);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// Delete a user
router.delete("/users/:id", authenticate, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await db.execute("DELETE FROM user WHERE id = ?", [id]);
    res.json({ success: true, message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a movie
router.delete("/movies/:id", authenticate, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await db.execute("DELETE FROM movies WHERE id = ?", [id]);
    res.json({ success: true, message: "Movie deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a show
router.delete("/shows/:id", authenticate, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await db.execute("DELETE FROM shows WHERE id = ?", [id]);
    res.json({ success: true, message: "Show deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
