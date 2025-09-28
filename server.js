const express = require("express");
const fetch = require("node-fetch");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

// OpenAI API key from Railway
const OPENAI_KEY = process.env.OPENAI_API_KEY;

// Shared secret for Roblox
const SHARED_SECRET = "abc123supersecret!!";

if (!OPENAI_KEY) {
  console.error("Missing OPENAI_API_KEY environment variable");
  process.exit(1);
}

// Root endpoint to test server
app.get("/", (req, res) => res.send("Server is running!"));

// ✅ Proper /llm endpoint
app.post("/llm", async (req, res) => {
  try {
    const token = req.headers["x-internal-token"];
    if (!token || token !== SHARED_SECRET) {
      return res.status(401).json({ text: "unauthorized" });
    }

    const { username, prompt } = req.body || {};
    if (!prompt) return res.status(400).json({ text: "no prompt" });

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a friendly Roblox AI helper. Keep answers short and family-friendly." },
          { role: "user", content: `Player ${username} asks: ${prompt}` }
        ],
        max_tokens: 400,
        temperature: 0.6
      })
    });

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content?.trim() || "Sorry, I couldn’t find an answer.";

    res.json({ text });

  } catch (err) {
    console.error(err);
    res.status(500).json({ text: "server error" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port", PORT));
