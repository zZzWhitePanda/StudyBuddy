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
      model: "llama3-8b-8192", 
      messages: [{ role: "user", content: prompt }],
    });

    return response.choices[0]?.message?.content || "⚠️ No response from AI";
  } catch (err) {
    console.error("❌ Groq request failed:", err);
    return "⚠️ Could not contact AI service.";
  }
}
