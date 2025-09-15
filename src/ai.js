// src/ai.js
import Groq from "groq-sdk";

const client = new Groq({
  apiKey: process.env.REACT_APP_GROQ_API_KEY,
  dangerouslyAllowBrowser: true,
});

export async function askAI(prompt) {
  try {
    const response = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
    });

    return response.choices[0]?.message?.content || "⚠️ No response from AI";
  } catch (err) {
    console.error("❌ Groq request failed:", err);
    return "⚠️ Could not contact AI service.";
  }
}
