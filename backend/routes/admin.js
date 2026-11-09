const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const db = require("../db");
const fs = require("fs");
const path = require("path");
const { authenticate, isAdmin } = require("../middleware/auth");
const {
  DEFAULT_TICKET_PRICES_CENTS,
  SHOW_PRICE_COLUMNS,
} = require("../ticketPrices");
const { getVenue, getVenueCapacity } = require("../venues");

const uploadDirectory = path.join(__dirname, "..", "uploads");

function validateMovie(body) {
  if (!body || typeof body !== "object") {
    return { error: "Invalid movie details" };
  }
  const { img, name, genre, description, rating } = body;
  if (
    typeof img !== "string" ||
    !img.trim() ||
    img.length > 255 ||
    typeof name !== "string" ||
    !name.trim() ||
    typeof genre !== "string" ||
    !genre.trim() ||
    typeof description !== "string" ||
    !description.trim() ||
    description.length > 1000 ||
    !Number.isInteger(Number(rating)) ||
    Number(rating) < 0 ||
    Number(rating) > 100
  ) {
    return { error: "Invalid movie details" };
  }

  return {
    value: {
      img: img.trim(),
      name: name.trim(),
      genre: genre.trim(),
      description: description.trim(),
      rating: Number(rating),
    },
  };
}

function movieValues(movie) {
  return [
    movie.img,
    movie.name,
    movie.genre,
    movie.description,
    movie.rating,
  ];
}

function imageType(buffer) {
  if (
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff
  ) {
    return "jpg";
  }
  if (
    buffer.length >= 8 &&
    buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
  ) {
    return "png";
  }
  if (
    buffer.length >= 12 &&
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "webp";
  }
  return null;
}

function uploadedImagePath(img) {
  if (typeof img !== "string") return null;
  let pathname;
  try {
    pathname = new URL(img, "http://localhost").pathname;
  } catch {
    return null;
  }
  const match = /^\/uploads\/([0-9a-f-]{36}\.(?:jpg|png|webp))$/i.exec(pathname);
  return match ? path.join(uploadDirectory, match[1]) : null;
}

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
    const validation = validateMovie(req.body);
    if (validation.error) {
      return res.status(400).json({ error: validation.error });
    }
    const [result] = await db.execute(
      "INSERT INTO movies (img, name, genre, description, rating) VALUES (?, ?, ?, ?, ?)",
      movieValues(validation.value)
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/movies/:id", authenticate, isAdmin, async (req, res) => {
  try {
    const validation = validateMovie(req.body);
    if (validation.error) {
      return res.status(400).json({ error: validation.error });
    }
    const assignments = [
      "img = ?",
      "name = ?",
      "genre = ?",
      "description = ?",
      "rating = ?",
    ];
    const [result] = await db.execute(
      `UPDATE movies SET ${assignments.join(", ")} WHERE id = ?`,
      [...movieValues(validation.value), req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Movie not found" });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post(
  "/movies/poster",
  authenticate,
  isAdmin,
  express.raw({
    type: ["image/jpeg", "image/png", "image/webp"],
    limit: "5mb",
  }),
  async (req, res) => {
    const extension = Buffer.isBuffer(req.body) ? imageType(req.body) : null;
    if (!extension) {
      return res.status(400).json({ error: "Choose a valid JPEG, PNG, or WebP image" });
    }

    const fileName = `${crypto.randomUUID()}.${extension}`;
    try {
      await fs.promises.mkdir(uploadDirectory, { recursive: true });
      await fs.promises.writeFile(path.join(uploadDirectory, fileName), req.body, {
        flag: "wx",
      });
      res.status(201).json({
        img: `${req.protocol}://${req.get("host")}/uploads/${fileName}`,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// Create new show
router.post("/shows", authenticate, isAdmin, async (req, res) => {
  try {
    const { movieId, cinemaId, venueId, date, time } = req.body;
    const venue = getVenue(venueId);
    if (
      !Number.isInteger(Number(movieId)) ||
      Number(movieId) <= 0 ||
      !Number.isInteger(Number(cinemaId)) ||
      Number(cinemaId) <= 0 ||
      !venue ||
      venue.cinemaId !== Number(cinemaId) ||
      typeof date !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
      typeof time !== "string" ||
      !/^\d{2}:\d{2}$/.test(time)
    ) {
      return res.status(400).json({ error: "Invalid show details" });
    }
    const prices = {};
    for (const [type, column] of Object.entries(SHOW_PRICE_COLUMNS)) {
      const price = Number(req.body[column] ?? DEFAULT_TICKET_PRICES_CENTS[type]);
      if (!Number.isInteger(price) || price < 0 || price > 100000) {
        return res.status(400).json({ error: `Invalid ${type.toLowerCase()} ticket price` });
      }
      prices[column] = price;
    }
    const priceColumns = Object.values(SHOW_PRICE_COLUMNS);
    const [result] = await db.execute(
      `INSERT INTO shows (movie, cinema, venue_id, date, time, seats, ${priceColumns.join(", ")})
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        Number(movieId),
        Number(cinemaId),
        venue.id,
        date,
        time,
        getVenueCapacity(venue),
        ...Object.values(prices),
      ]
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
router.delete("/movies/poster", authenticate, isAdmin, async (req, res) => {
  const imagePath = uploadedImagePath(req.body?.img);
  if (!imagePath) {
    return res.status(400).json({ error: "Invalid uploaded image path" });
  }
  try {
    const [movies] = await db.execute("SELECT id FROM movies WHERE img = ? LIMIT 1", [
      req.body.img,
    ]);
    if (movies.length > 0) {
      return res.status(409).json({ error: "This poster is still assigned to a movie" });
    }
    await fs.promises.unlink(imagePath);
    res.json({ success: true });
  } catch (err) {
    if (err.code === "ENOENT") {
      return res.json({ success: true });
    }
    res.status(500).json({ error: err.message });
  }
});

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
