import { useState, useContext } from "react";
import { getGiftIdeas } from "../services/api";
import toast from 'react-hot-toast';
import { AuthContext } from "../context/AuthContext";

export default function GiftIdeas() {
    const [formData, setFormData] = useState({
        relation: "",
        age: "",
        occasion: "",
        interests: "",
        budget: ""
    });
    const [loading, setLoading] = useState(false);
    const [suggestions, setSuggestions] = useState(null);
    const { user, updateCredits } = useContext(AuthContext);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        if (!formData.relation || !formData.interests) {
            toast.error("Please tell us who it is for and what they like!");
            return;
        }

        if (user?.credits < 1) {
            toast.error("Insufficient Credits!");
            return;
        }

        setLoading(true);
        setSuggestions(null);
        try {
            const result = await getGiftIdeas(formData);
            if (result.suggestions) {
                setSuggestions(result.suggestions);
            }
            if (result.credits !== undefined) {
                updateCredits(result.credits);
                toast.success("Ideas found! 1 credit deducted.");
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to get ideas. Try again!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-container page-transition">
            <div className="page-header">
                <h1 className="neon-title" style={{ fontSize: suggestions ? '2.5rem' : '4rem' }}>Gift Ideas 🎁</h1>
                <p style={{ color: "var(--text-dim)" }}>Find the perfect gift for anyone with AI</p>
            </div>

            <div className="scroll-area">
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '40px', maxWidth: '800px', margin: '0 auto' }}>

                    {/* Input Form */}
                    <div style={{
                        width: "100%",
                        background: "rgba(255, 255, 255, 0.02)",
                        padding: "40px",
                        borderRadius: "24px",
                        border: "1px solid var(--glass-border)",
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "25px"
                    }}>
                        <div style={{ gridColumn: "span 2" }}>
                            <label style={{ color: "var(--primary)", marginBottom: "8px", display: 'block', fontSize: "0.9rem", fontWeight: '600' }}>For whom?</label>
                            <input
                                name="relation"
                                value={formData.relation}
                                onChange={handleChange}
                                placeholder="e.g. Mom, Best Friend, Techie Boss"
                                style={inputStyle}
                            />
                        </div>

                        <div>
                            <label style={labelStyle}>Age</label>
                            <input
                                name="age"
                                type="number"
                                value={formData.age}
                                onChange={handleChange}
                                placeholder="Age..."
                                style={inputStyle}
                            />
                        </div>

                        <div>
                            <label style={labelStyle}>Occasion</label>
                            <input
                                name="occasion"
                                value={formData.occasion}
                                onChange={handleChange}
                                placeholder="e.g. Birthday, Farewell"
                                style={inputStyle}
                            />
                        </div>

                        <div style={{ gridColumn: "span 2" }}>
                            <label style={labelStyle}>Interests & Hobbies</label>
                            <textarea
                                name="interests"
                                value={formData.interests}
                                onChange={handleChange}
                                placeholder="Loves gaming, minimalist design, organic coffee..."
                                style={{ ...inputStyle, minHeight: "100px", resize: "none", borderRadius: '20px' }}
                            />
                        </div>

                        <div style={{ gridColumn: "span 2" }}>
                            <label style={labelStyle}>Budget (Optional)</label>
                            <input
                                name="budget"
                                value={formData.budget}
                                onChange={handleChange}
                                placeholder="e.g. Under $100"
                                style={inputStyle}
                            />
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={loading || user?.credits < 1}
                            className="btn-primary"
                            style={{
                                gridColumn: "span 2",
                                padding: "18px",
                                marginTop: "10px",
                                borderRadius: '50px',
                                fontSize: '1.2rem'
                            }}
                        >
                            {loading ? "Analyzing... 🧠" : user?.credits < 1 ? "No Credits Left" : "Generate Best Ideas 🎁"}
                        </button>
                    </div>

                    {/* Results Area */}
                    {suggestions && (
                        <div style={{
                            width: "100%",
                            background: "rgba(160, 0, 255, 0.05)",
                            padding: "40px",
                            borderRadius: "24px",
                            border: "1px solid var(--accent)",
                            color: "#fff",
                            lineHeight: "1.8",
                            whiteSpace: "pre-wrap",
                            boxShadow: '0 0 40px rgba(160, 0, 255, 0.1)',
                            fontSize: '1.1rem'
                        }}>
                            <h2 style={{ marginTop: 0, color: "var(--primary)", marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>AI Top Recommendations:</h2>
                            {suggestions}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

const labelStyle = {
    color: "var(--text-dim)",
    marginBottom: "8px",
    display: 'block',
    fontSize: "0.9rem",
    fontWeight: '500'
};

const inputStyle = {
    width: "100%",
    padding: "15px 20px",
    background: "rgba(0,0,0,0.2)",
    border: "1px solid var(--glass-border)",
    borderRadius: "15px",
    color: "white",
    fontSize: "1rem",
    outline: "none",
    transition: "all 0.3s ease"
};

