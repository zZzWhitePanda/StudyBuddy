// api/ask.js
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // stored safely on Vercel
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { prompt } = req.body;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    const reply = response.choices[0].message.content;
    return res.status(200).json({ reply });
  } catch (err) {
    console.error("AI error:", err);
    return res.status(500).json({ error: "AI request failed" });
  }
}
