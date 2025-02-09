const express = require("express");
const fs = require("fs");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 5000;
const LINKS_FILE = path.join(__dirname, "links.json");

// Middleware
app.use(cors());
app.use(express.json());

// Load links from file
app.get("/links", (req, res) => {
  fs.readFile(LINKS_FILE, "utf8", (err, data) => {
    if (err) return res.status(500).json({ error: "Could not read file" });

    try {
      const links = JSON.parse(data);
      res.json(links);
    } catch (err) {
      res.status(500).json({ error: "Invalid JSON format" });
    }
  });
});

// Save links to file
app.post("/save-links", (req, res) => {
  const links = req.body;

  fs.writeFile(LINKS_FILE, JSON.stringify(links, null, 2), "utf8", (err) => {
    if (err) return res.status(500).json({ error: "Failed to save links" });

    res.json({ message: "Links saved successfully" });
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
