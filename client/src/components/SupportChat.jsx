import { useState, useEffect, useRef, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import './SupportChat.css';

export default function SupportChat({ isOpen, setIsOpen }) {
    const [messages, setMessages] = useState([
        { role: 'ai', content: 'Hi! I am your AI Hub Assistant. How can I help you today? 👋' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    const { user } = useContext(AuthContext);
    const chatEndRef = useRef(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMsg = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.post('http://localhost:5000/api/support',
                { prompt: input },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setMessages(prev => [...prev, { role: 'ai', content: data.answer }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'ai', content: "Sorry, I'm having trouble connecting. Please try again later." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`support-wrapper ${isOpen ? 'open' : ''}`}>
            {isOpen && <div className="chat-overlay" onClick={() => setIsOpen(false)} />}

            <div className="support-window">
                <div className="support-chat-inner">
                    <div className="support-header">
                        <div className="bot-info">
                            <span className="bot-status">●</span>
                            <h3>Hub Assistant</h3>
                        </div>
                        <button className="close-chat-btn" onClick={() => setIsOpen(false)}>✕</button>
                    </div>

                    <div className="support-messages">
                        {messages.map((msg, i) => (
                            <div key={i} className={`support-msg ${msg.role}`}>
                                <div className="bubble">{msg.content}</div>
                            </div>
                        ))}
                        {loading && (
                            <div className="support-msg ai">
                                <div className="bubble typing">
                                    <span></span><span></span><span></span>
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    <div className="support-input">
                        <input
                            type="text"
                            placeholder="Ask me anything..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        />
                        <button onClick={handleSend} disabled={loading} className="send-btn">
                            <i className="arrow-icon">➤</i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
