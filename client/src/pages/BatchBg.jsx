import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { removeBg } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './BatchBg.css';

export default function BatchBg() {
    const [files, setFiles] = useState([]);
    const [results, setResults] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const { user, updateCredits } = useContext(AuthContext);

    if (user && user.plan === 'free') {
        return (
            <div className="batch-page page-transition" style={{ textAlign: 'center', paddingTop: '100px' }}>
                <div className="glass-card" style={{ padding: '50px', maxWidth: '600px', margin: 'auto' }}>
                    <h2 style={{ fontSize: '2.5rem', marginBottom: '20px' }}>⭐ Pro Feature Only</h2>
                    <p style={{ color: 'var(--text-dim)', marginBottom: '30px', fontSize: '1.1rem' }}>
                        Batch processing is reserved for our Pro & Ultra members. Upgrade your plan to process multiple images simultaneously!
                    </p>
                    <Link to="/pricing" className="btn-primary" style={{ textDecoration: 'none', padding: '15px 40px', display: 'inline-block', borderRadius: '50px' }}>
                        View Pricing Plans
                    </Link>
                </div>
            </div>
        );
    }

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        setFiles(prev => [...prev, ...selectedFiles]);
    };

    const startBatch = async () => {
        if (files.length === 0) return;
        if (user?.credits < files.length) {
            toast.error(`You need ${files.length} credits to process these images. You have ${user.credits}.`);
            return;
        }

        setIsProcessing(true);
        const newResults = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            try {
                toast(`Processing (${i + 1}/${files.length}): ${file.name}`, { icon: '⏳' });
                const data = await removeBg(file);
                newResults.push({ name: file.name, url: `data:image/png;base64,${data.image}`, success: true });
                if (data.credits !== undefined) updateCredits(data.credits);
            } catch (err) {
                console.error(err);
                newResults.push({ name: file.name, success: false });
                toast.error(`Failed to process ${file.name}`);
            }
        }

        setResults(newResults);
        setFiles([]);
        setIsProcessing(false);
        toast.success("Batch processing complete! Check your gallery for results.");
    };

    const downloadAll = () => {
        results.filter(r => r.success).forEach((res, i) => {
            setTimeout(() => {
                const link = document.createElement('a');
                link.href = res.url;
                link.download = `Batch-${res.name}`;
                link.click();
            }, i * 500);
        });
    };

    return (
        <div className="batch-page page-transition">
            <div className="page-header">
                <span className="pro-badge">PRO FEATURE</span>
                <h1 className="neon-title">Bulk BG Remover ⚡</h1>
                <p>Process multiple images at once. Save time, work faster!</p>
            </div>

            <div className="batch-container glass-card">
                <div className="upload-zone" onClick={() => !isProcessing && document.getElementById('batch-input').click()}>
                    <input
                        type="file"
                        id="batch-input"
                        multiple
                        hidden
                        onChange={handleFileChange}
                        accept="image/*"
                    />
                    <div className="zone-content">
                        <i>📁</i>
                        <h3>{files.length > 0 ? `${files.length} files selected` : "Select Multiple Images"}</h3>
                        <p>Click here to add images to the queue</p>
                    </div>
                </div>

                {files.length > 0 && (
                    <div className="queue-list">
                        <h4>Processing Queue ({files.length} images)</h4>
                        <div className="queue-items">
                            {files.map((f, i) => <div key={i} className="q-item">📄 {f.name}</div>)}
                        </div>
                        <button
                            className="btn-primary start-btn"
                            onClick={startBatch}
                            disabled={isProcessing}
                        >
                            {isProcessing ? "Processing..." : `Process ${files.length} Images`}
                        </button>
                    </div>
                )}

                {results.length > 0 && (
                    <div className="results-section">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h4>Results</h4>
                            <button className="download-all-btn" onClick={downloadAll}>⬇ Download All</button>
                        </div>
                        <div className="results-grid">
                            {results.map((r, i) => (
                                <div key={i} className={`res-thumb ${r.success ? 'success' : 'fail'}`}>
                                    {r.success ? <img src={r.url} alt={r.name} /> : <span>❌</span>}
                                    <div className="res-name">{r.name}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
