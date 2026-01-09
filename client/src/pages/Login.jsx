import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import toast from 'react-hot-toast';
import { GoogleLogin } from '@react-oauth/google';

export default function Login() {
    const { login, register, googleLogin } = useContext(AuthContext);
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({ username: "", password: "", referralCode: "" });
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const ref = params.get('ref');
        if (ref) {
            sessionStorage.setItem('referralCode', ref);
        }
    }, []);

    useEffect(() => {
        // Check session storage for a saved referral code
        const savedRef = sessionStorage.getItem('referralCode');
        const params = new URLSearchParams(location.search);
        const urlRef = params.get('ref');

        const finalRef = urlRef || savedRef;

        if (finalRef) {
            setFormData(prev => ({ ...prev, referralCode: finalRef }));
            setIsLogin(false); // Default to register if ref is found
            if (!formData.referralCode) {
                toast("Referral Bonus Active! 🎁", { icon: '✨' });
            }
        }
    }, [location]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleGoogleSuccess = async (credentialResponse) => {
        const res = await googleLogin(credentialResponse.credential, formData.referralCode);
        if (res.success) {
            toast.success(`Welcome! You have ${res.credits} credits. 🪙`, { duration: 4000 });
            navigate("/");
        } else {
            toast.error(res.error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = isLogin
            ? await login(formData.username, formData.password)
            : await register(formData.username, formData.password, formData.referralCode);

        if (res.success) {
            toast.success(`Welcome! You have ${res.credits} credits. 🪙`, { duration: 4000 });
            navigate("/");
        } else {
            toast.error(res.error);
        }
    };

    return (
        <div style={{
            display: "flex",
            height: "100vh",
            width: "100vw",
            justifyContent: "center",
            alignItems: "center",
            background: "var(--bg-gradient)"
        }}>
            <div className="page-transition" style={{
                padding: "50px",
                background: "rgba(15, 15, 40, 0.4)",
                backdropFilter: "blur(30px)",
                borderRadius: "32px",
                border: "1px solid var(--glass-border)",
                textAlign: "center",
                width: "450px",
                boxShadow: "0 40px 100px rgba(0,0,0,0.6)"
            }}>
                <h1 className="neon-title" style={{ fontSize: '2.5rem', marginBottom: '10px' }}>
                    {isLogin ? "Welcome Back" : "Join AI Hub"}
                </h1>

                {(!isLogin && formData.referralCode) && (
                    <div style={{
                        background: 'rgba(0, 255, 255, 0.1)',
                        border: '1px solid var(--primary)',
                        padding: '10px',
                        borderRadius: '12px',
                        color: 'var(--primary)',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        marginBottom: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                    }}>
                        🎁 +5 Credits Bonus Activated!
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    <div style={{ textAlign: 'left' }}>
                        <label style={labelStyle}>Username</label>
                        <input
                            name="username"
                            value={formData.username}
                            placeholder="Enter your username"
                            onChange={handleChange}
                            style={inputStyle}
                        />
                    </div>

                    <div style={{ textAlign: 'left' }}>
                        <label style={labelStyle}>Password</label>
                        <input
                            name="password"
                            type="password"
                            value={formData.password}
                            placeholder="••••••••"
                            onChange={handleChange}
                            style={inputStyle}
                        />
                    </div>

                    {!isLogin && (
                        <div style={{ textAlign: 'left' }}>
                            <label style={labelStyle}>Referral Code (Optional)</label>
                            <input
                                name="referralCode"
                                value={formData.referralCode}
                                placeholder="E.g. AXB123"
                                onChange={handleChange}
                                style={inputStyle}
                            />
                            <small style={{ color: 'var(--primary)', fontSize: '0.7rem', marginTop: '5px', display: 'block' }}>Joining via referral gives you +5 bonus credits! 🎁</small>
                        </div>
                    )}

                    <div style={{ margin: '10px 0', display: 'flex', justifyContent: 'center' }}>
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={() => toast.error("Google Login Failed")}
                            theme="filled_black"
                            shape="pill"
                            width="100%"
                        />
                    </div>

                    <button type="submit" className="btn-primary" style={{ height: '55px', borderRadius: '16px', marginTop: '10px', fontSize: '1.1rem' }}>
                        {isLogin ? "Login Now" : "Create Account"}
                    </button>
                </form>

                <p style={{ marginTop: "25px", color: "var(--text-dim)", fontSize: '0.95rem' }}>
                    {isLogin ? "Don't have an account?" : "Already have an account?"}
                    <span
                        onClick={() => setIsLogin(!isLogin)}
                        style={{ color: "var(--primary)", cursor: "pointer", marginLeft: "8px", fontWeight: '600' }}
                    >
                        {isLogin ? "Register" : "Login"}
                    </span>
                </p>
            </div>
        </div>
    );
}

const labelStyle = {
    color: "var(--text-dim)",
    marginBottom: "8px",
    display: 'block',
    fontSize: "0.85rem",
    fontWeight: '500',
    paddingLeft: '5px'
};

const inputStyle = {
    width: "100%",
    padding: "15px 20px",
    background: "rgba(0,0,0,0.2)",
    border: "1px solid var(--glass-border)",
    borderRadius: "15px",
    color: "white",
    fontSize: "1rem",
    outline: "none",
    transition: "all 0.3s ease"
};

