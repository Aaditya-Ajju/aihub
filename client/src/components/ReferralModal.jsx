import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function ReferralModal({ isOpen, onClose }) {
    const { user } = useContext(AuthContext);
    const [referrals, setReferrals] = useState([]);
    const [loading, setLoading] = useState(false);

    const referralCode = user?.referralCode || "REF-" + Math.random().toString(36).substring(2, 6).toUpperCase();
   const productionUrl = "https://aihubsuite.vercel.app";
    const shareUrl = `${productionUrl}/login?ref=${referralCode}`;
    const shareText = `Hey! Use my referral code ${referralCode} to get 5 extra credits on AI Hub! 🚀 Join now: ${shareUrl}`;

    useEffect(() => {
        if (isOpen) {
            fetchReferrals();
        }
    }, [isOpen]);

    const fetchReferrals = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const apiUrl = process.env.NODE_ENV === 'production' 
                ? 'https://aihubsuite.vercel.app/api/auth/referrals'
                : 'http://localhost:5000/api/auth/referrals';
                
            const { data } = await axios.get(apiUrl, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setReferrals(data);
        } catch (error) {
            console.error("Failed to fetch referrals", error);
            toast.error("Failed to load referral data. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard! 🚀");
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content glass-container" onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>&times;</button>

                <h2 className="neon-title" style={{ fontSize: '2rem', marginBottom: '10px' }}>Share & Earn 🎁</h2>
                <p style={{ color: 'var(--text-dim)', marginBottom: '30px' }}>Invite friends and you both get 5 credits!</p>

                <div className="referral-box">
                    <div className="ref-item">
                        <label>Your Referral Code</label>
                        <div className="copy-field">
                            <span>{referralCode}</span>
                            <button onClick={() => copyToClipboard(referralCode)}>Copy</button>
                        </div>
                    </div>

                    <div className="ref-item">
                        <label>Referral Link</label>
                        <div className="copy-field">
                            <span style={{ fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis' }}>{shareUrl}</span>
                            <button onClick={() => copyToClipboard(shareUrl)}>Copy</button>
                        </div>
                    </div>
                </div>

                <div className="share-buttons" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {navigator.share && (
                        <button
                            className="btn-primary"
                            style={{ padding: '15px', borderRadius: '12px', fontSize: '1rem', width: '100%' }}
                            onClick={() => {
                                navigator.share({
                                    title: 'Join AI Hub',
                                    text: shareText,
                                    url: shareUrl,
                                }).catch(console.error);
                            }}
                        >
                            📤 Share via...
                        </button>
                    )}
                    <button
                        className="share-btn whatsapp"
                        onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank')}
                    >
                        Share to WhatsApp
                    </button>
                </div>

                <div className="referral-history" style={{ marginTop: '30px', textAlign: 'left' }}>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '15px', color: 'var(--primary)' }}>Invited Friends ({referrals.length})</h3>
                    <div className="history-list scroll-area" style={{ maxHeight: '150px' }}>
                        {loading ? (
                            <p>Loading...</p>
                        ) : referrals.length > 0 ? (
                            referrals.map((ref, i) => (
                                <div key={i} className="history-item">
                                    <span>👤 {ref.username}</span>
                                    <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>
                                        {new Date(ref.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <p style={{ color: 'var(--text-dim)', textAlign: 'center' }}>No friends invited yet. Start sharing!</p>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                .modal-overlay {
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0,0,0,0.8);
                    backdrop-filter: blur(10px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 2000;
                }
                .modal-content {
                    width: 90%;
                    max-width: 500px;
                    padding: 40px;
                    border-radius: 32px;
                    position: relative;
                    text-align: center;
                    border: 1px solid var(--glass-border);
                    height: auto !important;
                }
                .modal-close {
                    position: absolute;
                    top: 20px; right: 20px;
                    background: transparent;
                    border: none;
                    color: white;
                    font-size: 2rem;
                    cursor: pointer;
                }
                .referral-box {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                    margin-bottom: 30px;
                }
                .ref-item {
                    text-align: left;
                }
                .ref-item label {
                    font-size: 0.8rem;
                    color: var(--text-dim);
                    margin-bottom: 8px;
                    display: block;
                }
                .copy-field {
                    display: flex;
                    background: rgba(255,255,255,0.05);
                    border: 1px solid var(--glass-border);
                    border-radius: 12px;
                    padding: 10px 15px;
                    align-items: center;
                    justify-content: space-between;
                }
                .copy-field button {
                    background: var(--primary);
                    border: none;
                    color: white;
                    padding: 5px 12px;
                    border-radius: 8px;
                    font-size: 0.8rem;
                    cursor: pointer;
                }
                .share-buttons {
                    margin-top: 20px;
                }
                .share-btn.whatsapp {
                    width: 100%;
                    background: #25D366;
                    border: none;
                    color: white;
                    padding: 15px;
                    border-radius: 12px;
                    font-weight: 600;
                    cursor: pointer;
                }
                .history-item {
                    display: flex;
                    justify-content: space-between;
                    padding: 10px 0;
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                }
            `}</style>
        </div>
    );
}
