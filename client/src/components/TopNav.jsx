import { useNavigate, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import './TopNav.css';

export default function TopNav({ toggleSupport }) {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <div className="top-nav">
            <div className="top-nav-items">
                <button
                    className={`top-nav-btn ${location.pathname === '/' ? 'active' : ''}`}
                    onClick={() => navigate('/')}
                >
                    🏠 Dashboard
                </button>
                <button
                    className="top-nav-btn support"
                    onClick={toggleSupport}
                >
                    🤖 Assistant
                </button>
                <button
                    className={`top-nav-btn ${location.pathname === '/usage-history' ? 'active' : ''}`}
                    onClick={() => navigate('/usage-history')}
                >
                    📊 History
                </button>
                <button
                    className={`top-nav-btn ${location.pathname === '/leaderboard' ? 'active' : ''}`}
                    onClick={() => navigate('/leaderboard')}
                >
                    🏆 Leaderboard
                </button>
            </div>
        </div>
    );
}
