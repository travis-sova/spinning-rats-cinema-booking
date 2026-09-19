const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/movies", require("./routes/movies"));
app.use("/api/cinemas", require("./routes/cinemas"));
app.use("/api/shows", require("./routes/shows"));
app.use("/api/users", require("./routes/users"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/content", require("./routes/content"));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`${new Date().toLocaleTimeString()} Server running on port ${PORT}`);
});