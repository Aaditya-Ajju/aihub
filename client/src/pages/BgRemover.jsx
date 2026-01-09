import { useState, useRef, useContext } from "react";
import { removeBg } from "../services/api";
import { AuthContext } from "../context/AuthContext";
import toast from "react-hot-toast";
import SocialShare from "../components/SocialShare";

export default function BgRemover() {
    const [loading, setLoading] = useState(false);
    const [image, setImage] = useState(null);
    const [file, setFile] = useState(null);
    const [processedImage, setProcessedImage] = useState(null);
    const fileInputRef = useRef(null);

    const { user, updateCredits } = useContext(AuthContext);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setImage(URL.createObjectURL(selectedFile));
            setFile(selectedFile);
            setProcessedImage(null);
        }
    };

    const handleRemoveBg = async () => {
        if (!file) return;

        if (user?.credits < 1) {
            toast.error("Insufficient credits! Please recharge.");
            return;
        }

        setLoading(true);

        try {
            const data = await removeBg(file);
            const fullImageUrl = `data:image/png;base64,${data.image}`;
            setProcessedImage(fullImageUrl);

            if (data.credits !== undefined) {
                updateCredits(data.credits);
                toast.success("Background removed! 1 credit deducted.");
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to remove background. Try again later.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-container page-transition">
            <div className="page-header">
                <h1 className="neon-title">BG Remover</h1>
                <p style={{ color: "var(--text-dim)" }}>Remove backgrounds instantly with AI</p>
            </div>

            <div className="scroll-area">
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '40px' }}>

                    {!image ? (
                        <div
                            onClick={() => fileInputRef.current.click()}
                            className="upload-card"
                            style={{
                                width: "100%",
                                maxWidth: "700px",
                                height: "350px",
                                border: "2px dashed var(--glass-border)",
                                borderRadius: "24px",
                                background: "rgba(255, 255, 255, 0.02)",
                                cursor: "pointer",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                                alignItems: "center",
                                gap: "25px",
                                transition: "var(--transition)"
                            }}
                        >
                            <div style={{
                                width: "90px", height: "90px", borderRadius: "50%",
                                background: "rgba(160, 0, 255, 0.1)", display: "flex",
                                alignItems: "center", justifyContent: "center", fontSize: "2.5rem",
                                boxShadow: '0 0 30px rgba(160, 0, 255, 0.2)'
                            }}>
                                🖼️
                            </div>
                            <div style={{ textAlign: "center" }}>
                                <h3 style={{ margin: "0 0 8px 0", fontSize: '1.6rem' }}>Upload Image</h3>
                                <p style={{ margin: 0, color: "var(--text-dim)", fontSize: "1rem" }}>Drag & drop or click to browse</p>
                            </div>
                        </div>
                    ) : (
                        <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: "40px" }}>
                            <div style={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: "30px",
                                width: "100%",
                                justifyContent: "center"
                            }}>
                                <div style={{ flex: 1, minWidth: "280px", maxWidth: "450px" }}>
                                    <div style={{ marginBottom: "15px", fontWeight: "600", color: "var(--text-dim)", textAlign: "center", textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.8rem' }}>Original</div>
                                    <div style={{ borderRadius: "20px", overflow: 'hidden', border: '1px solid var(--glass-border)', boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }}>
                                        <img src={image} alt="Original" style={{ width: "100%", display: 'block' }} />
                                    </div>
                                </div>

                                {processedImage && (
                                    <div style={{ flex: 1, minWidth: "280px", maxWidth: "450px" }}>
                                        <div style={{ marginBottom: "15px", fontWeight: "600", color: "var(--primary)", textAlign: "center", textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.8rem' }}>Result</div>
                                        <div style={{
                                            borderRadius: "20px",
                                            overflow: 'hidden',
                                            border: '1px solid var(--primary)',
                                            boxShadow: "0 10px 40px rgba(0, 255, 255, 0.2)",
                                            background: "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAMUlEQVQ4T2NkYGAQYcAP3uCTZhw1gGGYhAGBZIA/nYDCgBDAm9BGDWAAJyRCgLaBCAAgXwixzAS0pgAAAABJRU5ErkJggg==')"
                                        }}>
                                            <img src={processedImage} alt="Processed" style={{ width: "100%", display: 'block' }} />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", justifyContent: "center" }}>
                                {!processedImage ? (
                                    <button
                                        onClick={handleRemoveBg}
                                        disabled={loading || user?.credits < 1}
                                        className="btn-primary"
                                        style={{ padding: '16px 45px', fontSize: '1.1rem', borderRadius: '50px' }}
                                    >
                                        {loading ? "Removing Background..." : user?.credits < 1 ? "No Credits Left" : "Remove Background ✨"}
                                    </button>
                                ) : (
                                    <>
                                        <a
                                            href={processedImage}
                                            download="removed-bg.png"
                                            className="btn-primary"
                                            style={{
                                                textDecoration: "none",
                                                display: "inline-block",
                                                padding: '16px 45px',
                                                fontSize: '1.1rem',
                                                borderRadius: '50px',
                                                background: 'linear-gradient(135deg, #00ffff, #0088ff)'
                                            }}
                                        >
                                            Download HD ⬇
                                        </a>
                                        <SocialShare url={processedImage} title="Check out this background removal I did with AI Hub!" />
                                        <button
                                            onClick={() => { setImage(null); setFile(null); setProcessedImage(null); }}
                                            style={{
                                                padding: "16px 45px",
                                                background: "rgba(255,255,255,0.05)",
                                                border: "1px solid var(--glass-border)",
                                                borderRadius: "50px",
                                                color: "white",
                                                cursor: "pointer",
                                                fontSize: '1.1rem',
                                                transition: "var(--transition)"
                                            }}
                                        >
                                            Start Over
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: "none" }}
                accept="image/*"
            />
        </div>
    );
}
