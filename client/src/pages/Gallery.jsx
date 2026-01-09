import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import './Gallery.css';
import SocialShare from '../components/SocialShare';

export default function Gallery() {
    const [works, setWorks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWorks = async () => {
            try {
                const token = localStorage.getItem("token");
                const { data } = await axios.get("http://localhost:5000/api/works", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setWorks(data);
            } catch (error) {
                console.error("Gallery failed:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchWorks();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this masterpiece? 🗑️")) return;
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`http://localhost:5000/api/works/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setWorks(works.filter(w => w._id !== id));
            toast.success("Deleted from gallery");
        } catch (error) {
            toast.error("Delete failed");
        }
    };

    const handleDownload = (url, type) => {
        const link = document.createElement('a');
        link.href = url;
        link.download = `AI-Hub-${type}-${Date.now()}.png`;
        link.click();
    };

    return (
        <div className="gallery-page page-transition">
            <div className="page-header">
                <h1 className="neon-title">My Creative Works 🖼️</h1>
                <p>All your AI generations in one place. Relive your creativity!</p>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '100px' }}>
                    <div className="loader"></div>
                    <p>Fetching your masterpieces...</p>
                </div>
            ) : works.length > 0 ? (
                <div className="gallery-grid">
                    {works.map((work) => (
                        <div key={work._id} className="gallery-item glass-card">
                            <div className="work-preview">
                                <img src={work.url} alt={work.type} />
                                <div className="work-overlay">
                                    <button onClick={() => handleDownload(work.url, work.type)} className="mini-action-btn" title="Download">⬇</button>
                                    <button onClick={() => handleDelete(work._id)} className="mini-action-btn delete" title="Delete">🗑️</button>
                                </div>
                            </div>
                            <div className="work-details">
                                <div className="work-meta">
                                    <span className={`work-type ${work.type}`}>{work.type.toUpperCase()}</span>
                                    <span className="work-date">{new Date(work.createdAt).toLocaleDateString()}</span>
                                </div>
                                {work.prompt && <p className="work-prompt">"{work.prompt.substring(0, 60)}..."</p>}
                                <SocialShare url={work.url} title={`Check out this ${work.type} I made!`} />
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{ textAlign: 'center', padding: '100px', opacity: 0.5 }}>
                    <h2>No works found yet.</h2>
                    <p>Start creating with our AI tools to fill your gallery!</p>
                </div>
            )}
        </div>
    );
}
