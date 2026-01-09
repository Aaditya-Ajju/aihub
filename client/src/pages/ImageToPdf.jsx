import { useState, useRef, useContext } from "react";
import jsPDF from "jspdf";
import { AuthContext } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function ImageToPdf() {
    const { user, updateCredits } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const [images, setImages] = useState([]);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            const newImages = files.map(file => ({
                url: URL.createObjectURL(file), // For preview
                file: file
            }));
            setImages(prev => [...prev, ...newImages]);
        }
    };

    const handleConvert = async () => {
        if (images.length === 0) return;

        if (user?.credits < 1) {
            toast.error("Insufficient credits for conversion!");
            return;
        }

        setLoading(true);

        try {
            const doc = new jsPDF();

            for (let i = 0; i < images.length; i++) {
                if (i > 0) doc.addPage();

                const img = new Image();
                img.src = images[i].url;
                await new Promise(resolve => { img.onload = resolve; });

                const pageWidth = doc.internal.pageSize.getWidth();
                const pageHeight = doc.internal.pageSize.getHeight();

                const widthRatio = (pageWidth - 20) / img.width;
                const heightRatio = (pageHeight - 20) / img.height;
                const ratio = Math.min(widthRatio, heightRatio);

                const w = img.width * ratio;
                const h = img.height * ratio;

                doc.addImage(img, "JPEG", 10, 10, w, h);
            }

            doc.save("converted.pdf");

            updateCredits(user.credits - 1);
            toast.success("PDF Created! 1 credit used.");
            setLoading(false);

        } catch (error) {
            console.error(error);
            toast.error("Error converting images.");
            setLoading(false);
        }
    };

    return (
        <div className="glass-container page-transition">
            <div className="page-header">
                <h1 className="neon-title">Image to PDF</h1>
                <p style={{ color: "var(--text-dim)" }}>Convert your memories into a document</p>
            </div>

            <div className="scroll-area">
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px' }}>
                    {/* Upload Card */}
                    <div
                        onClick={() => fileInputRef.current.click()}
                        className="upload-card"
                        style={{
                            width: "100%",
                            maxWidth: "600px",
                            padding: "60px 40px",
                            border: "2px dashed var(--glass-border)",
                            borderRadius: "24px",
                            background: "rgba(255, 255, 255, 0.02)",
                            cursor: "pointer",
                            transition: "var(--transition)",
                            display: "flex",
                            flexDirection: "column",
                            gap: "20px",
                            alignItems: "center",
                            textAlign: 'center'
                        }}
                    >
                        <div style={{ fontSize: "4rem" }}>📂</div>
                        <div>
                            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.5rem' }}>Click to Upload Images</h3>
                            <p style={{ margin: 0, color: "var(--text-dim)" }}>Supports JPG, PNG</p>
                        </div>
                    </div>

                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        style={{ display: "none" }}
                        accept="image/*"
                        multiple
                    />

                    {/* Image Grid */}
                    {images.length > 0 && (
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
                            gap: "20px",
                            width: "100%"
                        }}>
                            {images.map((img, idx) => (
                                <div key={idx} style={{
                                    position: "relative",
                                    aspectRatio: "1",
                                    borderRadius: "16px",
                                    overflow: "hidden",
                                    border: '1px solid var(--glass-border)',
                                    boxShadow: "0 10px 20px rgba(0,0,0,0.2)"
                                }}>
                                    <img
                                        src={img.url}
                                        alt={`img-${idx}`}
                                        style={{
                                            width: "100%",
                                            height: "100%",
                                            objectFit: "cover"
                                        }}
                                    />
                                    <button
                                        onClick={() => setImages(images.filter((_, i) => i !== idx))}
                                        style={{
                                            position: "absolute",
                                            top: "8px",
                                            right: "8px",
                                            background: "rgba(0,0,0,0.6)",
                                            color: "white",
                                            border: "none",
                                            borderRadius: "50%",
                                            width: "28px",
                                            height: "28px",
                                            cursor: "pointer",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontSize: "14px",
                                            backdropFilter: "blur(4px)"
                                        }}
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Action Button */}
                    {images.length > 0 && (
                        <button
                            onClick={handleConvert}
                            disabled={loading || user?.credits < 1}
                            className="btn-primary"
                            style={{ padding: '18px 60px', fontSize: '1.2rem', borderRadius: '50px' }}
                        >
                            {loading ? "Converting..." : user?.credits < 1 ? "No Credits Left" : "Download PDF ⬇"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
