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
    return "⚠️ Could not contact AI service.";
  }
}
