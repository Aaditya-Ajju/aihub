import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './Pricing.css';

export default function Pricing() {
    const { user } = useContext(AuthContext);

    const plans = [
        {
            name: "Free",
            price: "$0",
            period: "forever",
            credits: "10 Instant + 2 Daily",
            features: ["Standard Support", "Llama 3.1 Base", "768px Images", "Watermark Included"],
            btnText: (user?.plan === 'free' || !user?.plan) ? "Current Plan" : "Downgrade",
            isPopular: false,
            color: "#a0a0b0"
        },
        {
            name: "Pro",
            price: "$9.99",
            period: "month",
            credits: "200/Month + 10 Daily",
            features: ["Priority Support", "Llama 3.1 70B", "HD 1024px Images", "No Watermark", "Batch Processing"],
            btnText: user?.plan === 'pro' ? "Current Plan" : "Upgrade to Pro",
            isPopular: true,
            color: "var(--primary)"
        },
        {
            name: "Ultra",
            price: "$29.99",
            period: "month",
            credits: "Unlimited Everything",
            features: ["24/7 VIP Support", "Claude 3.5 Sonnet", "4K Ultra HD Images", "No Limits", "Early Access Features"],
            btnText: user?.plan === 'ultra' ? "Current Plan" : "Go Ultra",
            isPopular: false,
            color: "var(--secondary)"
        }
    ];

    const handleUpgrade = async (plan) => {
        if (plan === 'Free') return;

        const planKey = plan.toLowerCase();

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/stripe/create-checkout-session`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ plan: planKey })
            });

            const data = await response.json();

            // Check if Stripe is not configured
            if (response.status === 503) {
                toast('💡 Payment system coming soon! Meanwhile, share your referral link to earn bonus credits! 🎁', {
                    duration: 5000,
                    icon: '🚀',
                    style: {
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: '#fff',
                    }
                });
                return;
            }

            if (data.url) {
                // Redirect to Stripe Checkout
                window.location.href = data.url;
            } else {
                toast.error(data.error || 'Failed to create checkout session');
            }
        } catch (error) {
            console.error('Checkout error:', error);
            toast('💡 Payments coming soon! Share your referral link to earn credits! 🎁', {
                duration: 5000,
                icon: '🚀'
            });
        }
    };

    return (
        <div className="pricing-page page-transition">
            <div className="pricing-header">
                <h1 className="neon-title">Supercharge Your AI ⚡</h1>
                <p>Choose the perfect plan for your creative journey.</p>
            </div>

            <div className="plans-grid">
                {plans.map((plan, i) => (
                    <div key={i} className={`plan-card glass-card ${plan.isPopular ? 'popular' : ''}`}>
                        {plan.isPopular && <div className="popular-badge">Most Popular</div>}
                        <h2 style={{ color: plan.color }}>{plan.name}</h2>
                        <div className="plan-price">
                            <span className="amount">{plan.price}</span>
                            <span className="period">/{plan.period}</span>
                        </div>
                        <div className="plan-credits">
                            <strong>{plan.credits}</strong>
                        </div>
                        <ul className="plan-features">
                            {plan.features.map((f, j) => (
                                <li key={j}>✅ {f}</li>
                            ))}
                        </ul>
                        <button
                            className={`upgrade-btn-lg ${(plan.name.toLowerCase() === user?.plan || (plan.name === 'Free' && !user?.plan)) ? 'disabled' : ''}`}
                            onClick={() => (plan.name.toLowerCase() !== user?.plan) && handleUpgrade(plan.name)}
                            style={{ background: plan.color }}
                        >
                            {plan.btnText}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
