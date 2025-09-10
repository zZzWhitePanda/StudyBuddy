import { useState } from "react";
import { askAI } from "./ai";

function AIAssistant({ darkMode }) {
  const [input, setInput] = useState("");
  const [reply, setReply] = useState("");

  async function handleAsk() {
    const res = await askAI(input);
    setReply(res);
  }

  const bgClass = darkMode ? "bg-gray-800 text-white" : "bg-white text-black";
  const replyClass = darkMode ? "bg-gray-700 text-white" : "bg-slate-100 text-black";

  return (
    <div className={`p-4 rounded-lg border ${darkMode ? "border-gray-600" : "border-gray-300"}`}>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className={`w-full p-2 border rounded mb-2 ${bgClass}`}
        placeholder="Ask Study Buddy AI..."
      />
      <button
        onClick={handleAsk}
        className="px-3 py-1 bg-purple-600 text-white rounded"
      >
        Ask AI
      </button>
      {reply && <div className={`mt-2 p-2 border rounded ${replyClass}`}>{reply}</div>}
    </div>
  );
}

export default AIAssistant;
