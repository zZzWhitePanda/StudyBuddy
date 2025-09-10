// /api/ask.js
import Groq from "groq-sdk";

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY // <- server-side only
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "No prompt provided" });

  try {
    const response = await client.chat.completions.create({
      model: "llama3-13b",
      messages: [{ role: "user", content: prompt }]
    });

    res.status(200).json({ reply: response.choices[0]?.message?.content || "" });
  } catch (err) {
    console.error("❌ Groq request failed:", err);
    res.status(500).json({ error: "AI request failed" });
  }
}
