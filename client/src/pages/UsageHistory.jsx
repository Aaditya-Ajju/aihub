import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import './UsageHistory.css';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

export default function UsageHistory() {
    const { user } = useContext(AuthContext);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const token = localStorage.getItem("token");
                const { data } = await axios.get("http://localhost:5000/api/auth/history", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setHistory(data);
            } catch (error) {
                console.error("Failed to fetch history", error);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    return (
        <div className="history-page page-transition">
            <h1 className="neon-title">Usage Dashboard 📊</h1>

            <div className="stats-grid">
                <div className="stat-card">
                    <h3>Current Credits</h3>
                    <div className="stat-val"><span>🏦</span> {user?.credits}</div>
                </div>
                <div className="stat-card">
                    <h3>Total Activities</h3>
                    <div className="stat-val"><span>📄</span> {history.length}</div>
                </div>
                <div className="stat-card chart-card">
                    <h3>Credit Distribution</h3>
                    <div style={{ height: '200px', display: 'flex', justifyContent: 'center' }}>
                        <Pie
                            data={{
                                labels: ['Spent', 'Remaining'],
                                datasets: [{
                                    data: [
                                        Math.abs(history.filter(h => h.amount < 0).reduce((acc, curr) => acc + curr.amount, 0)),
                                        user?.credits || 0
                                    ],
                                    backgroundColor: ['#a000ff', '#00ffff'],
                                    borderColor: 'rgba(255,255,255,0.1)',
                                    borderWidth: 1,
                                }]
                            }}
                            options={{ maintainAspectRatio: false, plugins: { legend: { labels: { color: '#fff' } } } }}
                        />
                    </div>
                </div>
            </div>

            <div className="history-table-container glass-card">
                <table className="history-table">
                    <thead>
                        <tr>
                            <th>Action</th>
                            <th>Description</th>
                            <th>Credits</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="4" style={{ textAlign: 'center', padding: '40px' }}>Loading history...</td></tr>
                        ) : history.length > 0 ? (
                            history.map((item, i) => (
                                <tr key={i}>
                                    <td className="action-type">{item.action}</td>
                                    <td className="description">{item.description}</td>
                                    <td className={`amount ${item.amount < 0 ? 'deduction' : 'bonus'}`}>
                                        {item.amount > 0 ? `+${item.amount}` : item.amount} 🪙
                                    </td>
                                    <td className="date">{new Date(item.createdAt).toLocaleString()}</td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="4" style={{ textAlign: 'center', padding: '40px' }}>No history found yet.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
