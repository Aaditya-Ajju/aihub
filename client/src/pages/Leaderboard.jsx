import { useState, useEffect } from 'react';
import axios from 'axios';
import './Leaderboard.css';

export default function Leaderboard() {
    const [leaders, setLeaders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaders = async () => {
            try {
                const { data } = await axios.get("http://localhost:5000/api/auth/leaderboard");
                setLeaders(data);
            } catch (error) {
                console.error("Failed to fetch leaderboard", error);
            } finally {
                setLoading(false);
            }
        };
        fetchLeaders();
    }, []);

    return (
        <div className="leaderboard-page page-transition">
            <div className="leaderboard-header">
                <h1 className="neon-title">Top Referrers 🏆</h1>
                <p>Join the elite! Refer your friends and climb the ranks to earn ultimate bragging rights.</p>
            </div>

            <div className="leaderboard-list glass-card">
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '60px' }}>Loading rankings...</div>
                ) : leaders.length > 0 ? (
                    leaders.map((user, index) => (
                        <div key={user._id} className="leader-item">
                            <div className={`rank ${index === 0 ? 'rank-gold' : index === 1 ? 'rank-silver' : index === 2 ? 'rank-bronze' : ''}`}>
                                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                            </div>
                            <div className="avatar">
                                {user.username.charAt(0).toUpperCase()}
                            </div>
                            <div className="user-info">
                                <span className={`username ${index < 3 ? 'top-tier' : ''}`}>{user.username}</span>
                                <span className="referral-count">{user.referralCount} Referrals</span>
                            </div>
                            <div className="badge">
                                {index === 0 ? 'Referral King' : index < 3 ? 'Elite' : 'Member'}
                            </div>
                        </div>
                    ))
                ) : (
                    <div style={{ textAlign: 'center', padding: '40px' }}>No rankings available yet.</div>
                )}
            </div>
        </div>
    );
}
