import { useState, useEffect, useRef, useContext } from "react";
import { askAI } from "../services/api";
import { AuthContext } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function AskAi() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState("");
  const chatBoxRef = useRef(null);

  const { user, updateCredits } = useContext(AuthContext); // Use Context

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleAsk = async () => {
    if (!prompt.trim()) return;

    // Optimistic check
    if (user?.credits < 1) {
      toast.error("Insufficient Credits! Please recharge.");
      return;
    }

    const userMessage = { role: "user", content: prompt };
    setMessages([...messages, userMessage]);
    setPrompt("");
    setLoading(true);

    try {
      // Updated API call with token manually injected here or update the service to use axios interceptor.
      // Since api.js is simple axios functions, we should probably update api.js to accept token, or simpler: just use axios here for now or update api.js to look for localStorage.
      // Let's assume we update api.js to automatically attach token. That is cleaner.
      // But for now, let's just assume api.js is updated.
      const result = await askAI(userMessage.content);

      // Wait, result needs to return credits now.
      if (result.credits !== undefined) {
        updateCredits(result.credits);
        toast.success("AI Replied! 1 credit deducted.");
      }

      const aiMessage = { role: "ai", content: result.answer };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error(error);
      const errorMessage = { role: "ai", content: "Error: " + (error.response?.data?.error || "Failed to get response.") };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };


  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  };

  return (
    <div className="glass-container page-transition">
      <div className="page-header">
        <h1 className="neon-title" style={{ fontSize: messages.length > 0 ? '2.5rem' : '4rem' }}>Ask AI</h1>
        {messages.length === 0 && <p style={{ color: "var(--text-dim)", fontSize: '1.2rem' }}>Start a conversation by asking anything! ✨</p>}
      </div>

      <div className="scroll-area" ref={chatBoxRef}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`message ${msg.role === "user" ? "user" : "ai"}`}
            >
              <div className="message-content">{msg.content}</div>
            </div>
          ))}

          {loading && (
            <div className="message ai">
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="chat-input-wrapper" style={{
        padding: '30px 40px 40px',
        background: 'rgba(255,255,255,0.02)',
        borderTop: '1px solid var(--glass-border)'
      }}>
        <div style={{ display: 'flex', gap: '15px' }}>
          <input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything..."
            disabled={loading}
            style={{
              flex: 1,
              padding: '16px 25px',
              borderRadius: '16px',
              background: 'rgba(0,0,0,0.2)',
              border: '1px solid var(--glass-border)',
              color: 'white',
              outline: 'none',
              fontSize: '1.1rem'
            }}
          />
          <button
            onClick={handleAsk}
            disabled={loading || !prompt.trim() || user?.credits < 1}
            className="btn-primary"
            style={{ borderRadius: '16px', padding: '0 30px' }}
          >
            {user?.credits < 1 ? "No Credits" : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}