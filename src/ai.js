<<<<<<< HEAD
import Groq from "groq-sdk";

const client = new Groq({
  apiKey: process.env.REACT_APP_GROQ_API_KEY, 
});

export async function askAI(prompt) {
  if (!process.env.REACT_APP_GROQ_API_KEY) {
    return "⚠️ No API key found. Did you set it in Vercel / .env?";
  }

  try {
    const response = await client.chat.completions.create({
      model: "llama3-8b-8192", // Groq’s fast LLaMA model
      messages: [{ role: "user", content: prompt }],
    });

    return response.choices[0]?.message?.content || "⚠️ No response from AI";
  } catch (err) {
    console.error("❌ Groq request failed:", err);
=======
export async function askAI(prompt) {
  try {
    const res = await fetch("/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    const data = await res.json();
    if (data.reply) return data.reply;
    return "⚠️ Error from AI service: " + (data.error || "unknown");
  } catch (err) {
    console.error(err);
>>>>>>> 93d03f0a6fafb2fb3638759387c8daf85513c0ce
    return "⚠️ Could not contact AI service.";
  }
}
