console.log("Loaded GROQ key?", process.env.GROQ_API_KEY ? "✅ Yes" : "❌ No");

// /api/ask.js
import Groq from "groq-sdk";

// Initialize Groq client server-side only
const client = new Groq({
  apiKey: process.env.GROQ_API_KEY // must be set in Vercel Environment Variables
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "No prompt provided" });
  }

  // Debug logging to check environment and request
  console.log("Received prompt:", prompt);
  console.log("GROQ_API_KEY present?", !!process.env.GROQ_API_KEY);

  try {
    const response = await client.chat.completions.create({
      model: "llama3-13b", // replace with any currently supported model from Groq
      messages: [{ role: "user", content: prompt }]
    });

    console.log("Groq response:", response);

    const reply = response.choices?.[0]?.message?.content || "⚠️ No reply from AI";

    res.status(200).json({ reply });
  } catch (err) {
    console.error("❌ Groq request failed full:", err);
    res.status(500).json({
      error: "AI request failed",
      details: err.message || "Unknown error"
    });
  }
}
