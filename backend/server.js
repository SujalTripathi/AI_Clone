const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch").default;
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Serve frontend files
app.use(express.static(path.join(__dirname, "../public")));

const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.API_KEY}`;

app.post("/api/gemini", async (req, res) => {
  const userInput = req.body.message;

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: userInput }] }],
      }),
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("API call failed:", error);
    res.status(500).json({ error: "Failed to fetch from Gemini API" });
  }
});

// Serve index.html on root
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
