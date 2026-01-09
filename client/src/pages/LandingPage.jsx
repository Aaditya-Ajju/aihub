import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function LandingPage() {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const features = [
        { icon: "🎨", title: "AI Image Gen", desc: "Create stunning visuals from text prompts in seconds." },
        { icon: "🤖", title: "Smart Chat", desc: "Advanced AI assistant for all your questions." },
        { icon: "📄", title: "Img to PDF", desc: "Professional quality document conversion." },
        { icon: "🖼️", title: "BG Removal", desc: "One-click transparent backgrounds for your photos." },
        { icon: "🔳", title: "QR Magic", desc: "Generate custom, themed QR codes instantly." },
        { icon: "🎁", title: "Gift Ideas", desc: "Find the perfect gift with personalized AI logic." }
    ];

    return (
        <div style={containerStyle}>
            {/* Navbar */}
            <nav style={{
                ...navStyle,
                background: scrolled ? 'rgba(10, 10, 30, 0.8)' : 'transparent',
                borderBottom: scrolled ? '1px solid rgba(255,255,255,0.1)' : 'none'
            }}>
                <div className="neon-title" style={{ fontSize: '1.5rem', margin: 0 }}>AI Hub</div>
                <button onClick={() => navigate('/login')} className="btn-primary" style={{ padding: '8px 25px', fontSize: '0.9rem' }}>
                    Login / Sign Up
                </button>
            </nav>

            {/* Hero Section */}
            <section style={heroSection}>
                <div style={heroContent}>
                    <div style={badgeStyle}>✨ Next-Gen AI Suite</div>
                    <h1 className="neon-title" style={{ fontSize: '5rem', lineHeight: '1.1', marginBottom: '25px' }}>
                        Unlimited AI Power <br /> One Simple Suite
                    </h1>
                    <p style={{ color: 'var(--text-dim)', fontSize: '1.25rem', maxWidth: '700px', margin: '0 auto 40px', lineHeight: '1.6' }}>
                        The most premium AI toolkit for creators, developers, and dreamers.
                        Generate images, chat with AI, remove backgrounds, and much more.
                    </p>
                    <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
                        <button onClick={() => navigate('/login')} className="btn-primary" style={heroBtn}>
                            Get Started for Free 🚀
                        </button>
                    </div>
                </div>

                {/* Floating Elements Animation would go here in CSS */}
                <div style={floatingCircle(1)} />
                <div style={floatingCircle(2)} />
            </section>

            {/* Features Grid */}
            <section style={featureSection}>
                <h2 className="neon-title" style={{ fontSize: '3rem', marginBottom: '60px' }}>Built for Excellence</h2>
                <div style={gridStyle}>
                    {features.map((f, i) => (
                        <div key={i} style={featureCard}>
                            <div style={iconStyle}>{f.icon}</div>
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>{f.title}</h3>
                            <p style={{ color: 'var(--text-dim)', fontSize: '1rem', lineHeight: '1.5' }}>{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Referral Hook */}
            <section style={ctaSection}>
                <div className="glass-container" style={{ padding: '80px', height: 'auto', maxWidth: '1000px' }}>
                    <h3 className="neon-title" style={{ fontSize: '2.5rem' }}>Invite Friends, Get Free Credits</h3>
                    <p style={{ fontSize: '1.2rem', color: 'var(--text-dim)', marginBottom: '35px' }}>
                        Share your unique link and both you and your friend get 5 credits instantly.
                    </p>
                    <button onClick={() => navigate('/login')} className="btn-primary" style={{ padding: '15px 40px', fontSize: '1.1rem' }}>
                        Claim Your Rewards Now
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer style={footerStyle}>
                <p style={{ color: 'var(--text-dim)' }}>© 2026 AI Hub. Crafted for the future.</p>
            </footer>
        </div>
    );
}

const containerStyle = {
    background: 'var(--bg-gradient)',
    minHeight: '100vh',
    color: 'white',
    overflowX: 'hidden'
};

const navStyle = {
    position: 'fixed',
    top: 0,
    width: '100%',
    padding: '20px 8%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 1000,
    transition: 'all 0.3s ease'
};

const heroSection = {
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    position: 'relative',
    padding: '0 5%'
};

const heroContent = {
    zIndex: 2,
    maxWidth: '1000px'
};

const badgeStyle = {
    display: 'inline-block',
    padding: '8px 20px',
    background: 'rgba(160, 0, 255, 0.1)',
    border: '1px solid var(--accent)',
    borderRadius: '100px',
    color: 'var(--primary)',
    fontWeight: '600',
    fontSize: '0.9rem',
    marginBottom: '25px',
    textTransform: 'uppercase',
    letterSpacing: '2px'
};

const heroBtn = {
    padding: '20px 50px',
    fontSize: '1.2rem',
    borderRadius: '50px',
    boxShadow: '0 0 30px rgba(0, 255, 255, 0.3)'
};

const featureSection = {
    padding: '120px 10%',
    textAlign: 'center'
};

const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '30px'
};

const featureCard = {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid var(--glass-border)',
    padding: '40px',
    borderRadius: '30px',
    backdropFilter: 'blur(10px)',
    transition: 'transform 0.3s ease, border-color 0.3s ease',
    textAlign: 'left',
    cursor: 'pointer'
};

const iconStyle = {
    fontSize: '2.5rem',
    marginBottom: '20px',
    background: 'rgba(0, 255, 255, 0.1)',
    width: '70px',
    height: '70px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '20px',
    boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
};

const ctaSection = {
    padding: '100px 5%',
    display: 'flex',
    justifyContent: 'center',
    textAlign: 'center'
};

const footerStyle = {
    padding: '50px',
    textAlign: 'center',
    borderTop: '1px solid var(--glass-border)',
    marginTop: '50px'
};

const floatingCircle = (num) => ({
    position: 'absolute',
    width: num === 1 ? '400px' : '300px',
    height: num === 1 ? '400px' : '300px',
    background: num === 1 ? 'radial-gradient(circle, rgba(160, 0, 255, 0.2) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(0, 255, 255, 0.15) 0%, transparent 70%)',
    top: num === 1 ? '10%' : '60%',
    left: num === 1 ? '5%' : '70%',
    zIndex: 1,
    filter: 'blur(50px)'
});
