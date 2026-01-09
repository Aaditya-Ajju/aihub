import { useState, useEffect, useRef, useContext } from "react";
import { generateImage } from "../services/api";
import { AuthContext } from "../context/AuthContext";
import toast from "react-hot-toast";
import SocialShare from "../components/SocialShare";

export default function ImageGen() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState("");
  const chatBoxRef = useRef(null);

  const { user, updateCredits } = useContext(AuthContext);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleGenerate = async () => {
    if (user?.credits < 1) {
      toast.error("Insufficient credits! Please recharge.");
      return;
    }

    const userMessage = { role: "user", content: prompt };
    setMessages((prev) => [...prev, userMessage]);
    const currentPrompt = prompt;
    setPrompt("");
    setLoading(true);

    try {
      const data = await generateImage(currentPrompt);
      if (data.credits !== undefined) {
        updateCredits(data.credits);
        toast.success("Image generated! 1 credit deducted.");
      }
      const aiMessage = {
        role: "assistant",
        content: (
          <div>
            <p>Here is your generated image:</p>
            <div style={{ position: "relative", display: "inline-block" }}>
              <img
                src={data.imageUrl}
                alt="Generated"
                style={{ maxWidth: '450px', maxHeight: '450px', width: '100%', objectFit: 'contain', borderRadius: '12px', marginTop: '10px' }}
                onLoad={() => chatBoxRef.current?.scrollTo({ top: chatBoxRef.current.scrollHeight, behavior: 'smooth' })}
              />
              <br />
              <a
                href={data.imageUrl}
                download={`image-${Date.now()}.png`}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "inline-block",
                  marginTop: "10px",
                  padding: "10px 20px",
                  background: "#00ffff",
                  color: "#000",
                  textDecoration: "none",
                  fontWeight: "bold",
                  borderRadius: "20px",
                  fontSize: "0.9rem"
                }}
              >
                ⬇ Download
              </a>
              <SocialShare url={data.imageUrl} title="Look at this AI image I made on AI Hub!" />
            </div>
          </div>
        )
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Error: Failed to generate image. Please checking API key." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  return (
    <div className="glass-container page-transition">
      <div className="page-header">
        <h1 className="neon-title" style={{ fontSize: messages.length > 0 ? '2.5rem' : '4rem' }}>Image Generator</h1>
        {messages.length === 0 && <p style={{ color: "var(--text-dim)", fontSize: '1.2rem' }}>Describe an image and I'll create it for you! 🎨</p>}
      </div>

      <div className="scroll-area" ref={chatBoxRef}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
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
            placeholder="Describe the image..."
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
            onClick={handleGenerate}
            disabled={loading || !prompt.trim() || user?.credits < 1}
            className="btn-primary"
            style={{ borderRadius: '16px', padding: '0 30px' }}
          >
            {user?.credits < 1 ? "No Credits" : "Generate"}
          </button>
        </div>
      </div>
    </div>
  );
}