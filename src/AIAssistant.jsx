import { useState } from "react";
import { askAI } from "./ai";

function AIAssistant() {
  const [input, setInput] = useState("");
  const [reply, setReply] = useState("");

  async function handleAsk() {
    const res = await askAI(input);
    setReply(res);
  }

  return (
    <div className="p-4 rounded-lg border">
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="w-full p-2 border rounded mb-2"
        placeholder="Ask Study Buddy AI..."
      />
      <button
        onClick={handleAsk}
        className="px-3 py-1 bg-purple-600 text-white rounded"
      >
        Ask AI
      </button>
      {reply && <div className="mt-2 p-2 border rounded bg-slate-100">{reply}</div>}
    </div>
  );
}

export default AIAssistant;
