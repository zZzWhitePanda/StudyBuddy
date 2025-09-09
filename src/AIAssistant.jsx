import { useState } from "react";
import { askAI } from "./ai";

<<<<<<< HEAD
function AIAssistant({ darkMode }) {
=======
function AIAssistant() {
>>>>>>> 93d03f0a6fafb2fb3638759387c8daf85513c0ce
  const [input, setInput] = useState("");
  const [reply, setReply] = useState("");

  async function handleAsk() {
    const res = await askAI(input);
    setReply(res);
  }

<<<<<<< HEAD
  // Conditional classes based on darkMode
  const bgClass = darkMode ? "bg-gray-800 text-white" : "bg-white text-black";
  const replyClass = darkMode ? "bg-gray-700 text-white" : "bg-slate-100 text-black";

  return (
    <div className={`p-4 rounded-lg border ${darkMode ? "border-gray-600" : "border-gray-300"}`}>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className={`w-full p-2 border rounded mb-2 ${bgClass}`}
=======
  return (
    <div className="p-4 rounded-lg border">
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="w-full p-2 border rounded mb-2"
>>>>>>> 93d03f0a6fafb2fb3638759387c8daf85513c0ce
        placeholder="Ask Study Buddy AI..."
      />
      <button
        onClick={handleAsk}
        className="px-3 py-1 bg-purple-600 text-white rounded"
      >
        Ask AI
      </button>
<<<<<<< HEAD
      {reply && <div className={`mt-2 p-2 border rounded ${replyClass}`}>{reply}</div>}
=======
      {reply && <div className="mt-2 p-2 border rounded bg-slate-100">{reply}</div>}
>>>>>>> 93d03f0a6fafb2fb3638759387c8daf85513c0ce
    </div>
  );
}

export default AIAssistant;
