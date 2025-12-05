import React, { useState, useEffect, useRef } from "react";

const BOT_AVATAR =
  "https://avatars.githubusercontent.com/u/98718579?s=64&v=4";
const USER_AVATAR =
  "https://ui-avatars.com/api/?name=You&background=0D8ABC&color=fff&size=64";

function getMemories() {
  try {
    return JSON.parse(localStorage.getItem("chat-memories") || "[]");
  } catch {
    return [];
  }
}

function setMemories(memories) {
  localStorage.setItem("chat-memories", JSON.stringify(memories));
}

export default function App() {
  const [prompt, setPrompt] = useState("");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState(() => getMemories());
  const [loading, setLoading] = useState(false);
  const chatRef = useRef(null);

  // Read prompt.txt on load
  useEffect(() => {
    fetch("/prompt.txt")
      .then((res) => res.text())
      .then((txt) => setPrompt(txt));
  }, []);

  // Save memories after each message
  useEffect(() => {
    setMemories(messages);
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // Demo: Simulate bot response (replace this with real API in production)
  function getBotResponse(userMsg) {
    // Use prompt.txt + last N messages for context
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(
          `🤖 (Demo) ${prompt}\nYou said: "${userMsg}"`
        );
      }, 1200);
    });
  }

  async function onSubmit(e) {
    e.preventDefault();
    const userMsg = input.trim();
    if (!userMsg) return;
    setLoading(true);
    const next = [...messages, { by: "user", text: userMsg, ts: Date.now() }];
    setMessages(next);
    setInput("");
    const botText = await getBotResponse(userMsg);
    setMessages([
      ...next,
      { by: "bot", text: botText, ts: Date.now() }
    ]);
    setLoading(false);
  }

  function onSaveConversation() {
    const data = JSON.stringify(messages, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const el = document.createElement("a");
    el.href = url;
    el.download = `chat-conversation-${Date.now()}.json`;
    el.click();
    URL.revokeObjectURL(url);
  }

  function onClearConversation() {
    if (window.confirm("Clear all chat history?")) {
      setMessages([]);
      setMemories([]);
    }
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <header className="bg-white shadow-sm p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img src={BOT_AVATAR} className="w-8 h-8 rounded-full" alt="Bot" />
          <span className="text-xl font-bold tracking-tight">Chatbot</span>
        </div>
        <div className="space-x-2">
          <button
            className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded"
            onClick={onSaveConversation}
            aria-label="Save conversation"
          >Save</button>
          <button
            className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded"
            onClick={onClearConversation}
            aria-label="Clear"
          >Clear</button>
        </div>
      </header>
      <main className="flex-1 overflow-hidden">
        <div
          ref={chatRef}
          className="px-2 py-4 overflow-y-auto h-full flex flex-col space-y-2"
          style={{ maxHeight: "calc(100vh - 120px)" }}
        >
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.by === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`flex items-end gap-2 max-w-[75%]`}>
                {msg.by === "bot" && (
                  <img
                    src={BOT_AVATAR}
                    className="w-8 h-8 rounded-full border"
                    title="Bot"
                    alt="Bot"
                  />
                )}
                <div
                  className={`px-3 py-2 rounded-lg shadow ${
                    msg.by === "bot"
                      ? "bg-white text-gray-800"
                      : "bg-blue-600 text-white"
                  }`}
                >
                  <pre className="whitespace-pre-wrap font-sans text-base">{msg.text}</pre>
                </div>
                {msg.by === "user" && (
                  <img
                    src={USER_AVATAR}
                    className="w-8 h-8 rounded-full border"
                    title="You"
                    alt="You"
                  />
                )}
              </div>
            </div>
          ))}
          {messages.length === 0 && (
            <div className="text-gray-500 text-center mt-10">
              <img
                src={BOT_AVATAR}
                className="w-20 h-20 mx-auto mb-4 rounded-full"
                alt="Bot"
              />
              <h2 className="text-xl font-semibold mb-1">Hello! I'm aaron-o1.</h2>
              <p>Start a conversation below.</p>
            </div>
          )}
        </div>
      </main>
      <footer className="bg-white p-4 border-t shadow-sm">
        <form onSubmit={onSubmit} className="flex items-center gap-2">
          <input
            className="flex-1 px-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring focus:border-blue-400"
            placeholder="Type a message..."
            value={input}
            autoFocus
            disabled={loading}
            onChange={e => setInput(e.target.value)}
            aria-label="Type a message..."
            maxLength={1000}
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "..." : "Send"}
          </button>
        </form>
      </footer>
    </div>
  );
}
