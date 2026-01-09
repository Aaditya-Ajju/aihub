import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { claimDailyBonus } from '../services/api';
import toast from 'react-hot-toast';
import './Dashboard.css';

export default function Dashboard() {
    const { user, updateCredits, setUser } = useContext(AuthContext);
    const [timeLeft, setTimeLeft] = useState("");
    const [canClaim, setCanClaim] = useState(true);

    useEffect(() => {
        const timer = setInterval(() => {
            if (!user?.lastBonusClaimed) {
                setCanClaim(true);
                return;
            }

            const lastClaim = new Date(user.lastBonusClaimed);
            const nextClaim = new Date(lastClaim.getTime() + 24 * 60 * 60 * 1000);
            const now = new Date();
            const diff = nextClaim - now;

            if (diff <= 0) {
                setCanClaim(true);
                setTimeLeft("");
            } else {
                setCanClaim(false);
                const hours = Math.floor(diff / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((diff % (1000 * 60)) / 1000);
                setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [user?.lastBonusClaimed]);

    const handleClaimBonus = async () => {
        if (!canClaim) return;
        try {
            const data = await claimDailyBonus();
            if (data.success) {
                toast.success(data.message);
                updateCredits(data.credits);
                // Update local user state with lastBonusClaimed
                setUser(prev => ({ ...prev, lastBonusClaimed: data.lastBonusClaimed }));
            } else {
                toast.error(data.error);
            }
        } catch (err) {
            toast.error("Failed to claim bonus");
        }
    };

    const quickActions = [
        { to: "/image", label: "Generate Art", icon: "🎨", desc: "Create high-quality AI images" },
        { to: "/ask-ai", label: "Chat with AI", icon: "🤖", desc: "Get answers & write code" },
        { to: "/bg-remover", label: "Magic Eraser", icon: "🖼️", desc: "Remove background instantly" },
        { to: "/qr-generator", label: "QR Master", icon: "🔳", desc: "Custom QR codes in seconds" },
        { to: "/gallery", label: "My Gallery", icon: "🖼️", desc: "View your saved masterpieces" },
        {
            label: canClaim ? "Claim Bonus" : "Bonus Claimed",
            icon: "💎",
            desc: canClaim ? "Click to get +2 Credits" : `Next bonus in: ${timeLeft}`,
            onClick: handleClaimBonus,
            isBonus: true,
            disabled: !canClaim
        }
    ];

    return (
        <div className="dashboard-page page-transition">
            <div className="dashboard-header">
                <div className="welcome-section">
                    <h1>Welcome back, <span className="highlight-text">{user?.username}</span> 👋</h1>
                    <p>What would you like to create today?</p>
                </div>
                <div className="credit-summary glass-card">
                    <div className="credit-main">
                        <span className="label">Available Credits</span>
                        <div className="val">👑 {user?.credits}</div>
                    </div>
                    <div className="plan-badge">{user?.plan?.toUpperCase()} PLAN</div>
                </div>
            </div>

            <div className="actions-grid">
                {quickActions.map((action, i) => (
                    action.to ? (
                        <Link key={i} to={action.to} className="action-tile glass-card">
                            <div className="tile-icon">{action.icon}</div>
                            <div className="tile-content">
                                <h3>{action.label}</h3>
                                <p>{action.desc}</p>
                            </div>
                            <div className="tile-arrow">↗</div>
                        </Link>
                    ) : (
                        <div
                            key={i}
                            onClick={action.onClick}
                            className={`action-tile glass-card bonus-tile ${action.disabled ? 'disabled' : ''}`}
                        >
                            <div className="tile-icon">{action.icon}</div>
                            <div className="tile-content">
                                <h3>{action.label}</h3>
                                <p className={!canClaim ? 'timer-text' : ''}>{action.desc}</p>
                            </div>
                            {canClaim && <div className="tile-arrow">🎁</div>}
                        </div>
                    )
                ))}
            </div>

            <div className="dashboard-stats-row">
                <div className="stats-mini-card glass-card">
                    <h4>Current Status</h4>
                    <div className="status-indicator">
                        <div className="dot"></div> System Online
                    </div>
                </div>
                <div className="stats-mini-card glass-card">
                    <h4>Recent Activity</h4>
                    <p>Check your gallery for latest works</p>
                </div>
            </div>
        </div>
    );
}
