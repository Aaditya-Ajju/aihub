import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import toast from "react-hot-toast";
import SocialShare from "../components/SocialShare";


export default function QrGenerator() {
    const { user, updateCredits } = useContext(AuthContext);
    const [text, setText] = useState("");
    const [qrImage, setQrImage] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleGenerate = () => {
        if (!text.trim()) return;

        if (user?.credits < 1) {
            toast.error("Insufficient credits!");
            return;
        }

        setLoading(true);

        const url = `https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=${encodeURIComponent(text)}&color=ffffff&bgcolor=0a0a1e&margin=10`;

        const img = new Image();
        img.src = url;
        img.onload = async () => {
            setQrImage(url);
            updateCredits(user.credits - 1);

            // Save to Gallery
            try {
                const token = localStorage.getItem("token");
                await fetch("http://localhost:5000/api/save-work", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        type: 'qr-generator',
                        url: url,
                        prompt: `QR Code: ${text.substring(0, 30)}`
                    })
                });
            } catch (err) {
                console.error("Failed to save QR to gallery", err);
            }

            toast.success("QR Code generated! 1 credit deducted.");
            setLoading(false);
        };
    };

    const handleDownload = async () => {
        if (!qrImage) return;
        try {
            const response = await fetch(qrImage);
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = url;
            a.download = `qrcode-${Date.now()}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Download failed:", error);
            window.open(qrImage, "_blank");
        }
    };

    return (
        <div className="glass-container page-transition">
            <div className="page-header">
                <h1 className="neon-title" style={{ fontSize: qrImage ? '2.5rem' : '4rem' }}>QR Generator</h1>
                <p style={{ color: "var(--text-dim)" }}>Turn any text or link into a high-quality QR Code</p>
            </div>

            <div className="scroll-area">
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '40px', maxWidth: '700px', margin: '0 auto' }}>

                    {/* Input Area */}
                    <div style={{
                        width: "100%",
                        display: "flex",
                        gap: "15px",
                        background: "rgba(255, 255, 255, 0.02)",
                        padding: "15px",
                        borderRadius: "24px",
                        border: "1px solid var(--glass-border)",
                        backdropFilter: "blur(10px)",
                        boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                    }}>
                        <input
                            type="text"
                            placeholder="Paste your URL or text here..."
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                            style={{
                                flex: 1,
                                background: "transparent",
                                border: "none",
                                color: "white",
                                fontSize: "1.1rem",
                                padding: "10px 20px",
                                outline: "none"
                            }}
                        />
                        <button
                            onClick={handleGenerate}
                            disabled={loading || !text || user?.credits < 1}
                            className="btn-primary"
                            style={{
                                padding: "12px 30px",
                                borderRadius: "16px",
                                fontSize: '1rem'
                            }}
                        >
                            {loading ? "..." : user?.credits < 1 ? "No Credits" : "Generate ✨"}
                        </button>
                    </div>

                    {/* QR Display Card */}
                    {qrImage && (
                        <div style={{
                            background: "rgba(255, 255, 255, 0.03)",
                            padding: "30px",
                            borderRadius: "32px",
                            border: '1px solid var(--glass-border)',
                            boxShadow: "0 0 60px rgba(0, 255, 255, 0.15)",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: "25px",
                            animation: "slideUp 0.6s cubic-bezier(0.23, 1, 0.32, 1)"
                        }}>
                            <div style={{
                                padding: '15px',
                                background: '#fff',
                                borderRadius: '20px',
                                boxShadow: 'inset 0 0 10px rgba(0,0,0,0.1)'
                            }}>
                                <img
                                    src={qrImage}
                                    alt="QR Code"
                                    style={{ width: "300px", height: "300px", display: 'block' }}
                                />
                            </div>

                            <button
                                onClick={handleDownload}
                                className="btn-primary"
                                style={{
                                    width: "100%",
                                    padding: "15px",
                                    borderRadius: "16px",
                                    fontSize: "1.1rem",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "12px",
                                    background: 'linear-gradient(135deg, var(--primary), #0088ff)'
                                }}
                            >
                                <i>⬇</i> Download PNG
                            </button>
                            <SocialShare url={qrImage} title="Scan this AI-Generated QR Code!" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
