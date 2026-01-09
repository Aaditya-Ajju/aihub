import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';
import ReferralModal from './ReferralModal';
import './Navbar.css';

export default function Navbar({ isCollapsed, toggleSidebar, toggleSupport }) {
  const { logout, user } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [isReferralOpen, setIsReferralOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setDeferredPrompt(null);
  };

  const menuItems = [
    { to: "/image", label: "Image Generation", icon: "🎨" },
    { to: "/ask-ai", label: "Ask AI", icon: "🤖" },
    { to: "/bg-remover", label: "Bg Remover", icon: "🖼️" },
    { to: "/img-to-pdf", label: "Image to PDF", icon: "📄" },
    { to: "/qr-generator", label: "QR Generator", icon: "🔳" },
    { to: "/gift-ideas", label: "Gift Ideas", icon: "🎁" },
    { to: "/gallery", label: "My Gallery", icon: "🖼️" }
  ];

  const proItems = [
    { to: "/batch-bg", label: "Bulk BG", icon: "⚡" }
  ];

  return (
    <>
      <nav className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        <button
          className="sidebar-toggle"
          onClick={toggleSidebar}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? '→' : '←'}
        </button>

        <div className="sidebar-logo">
          <h2>{isCollapsed ? 'AH' : 'AI Hub'}</h2>
        </div>

        <div className="sidebar-scrollable">
          <ul className="sidebar-menu">
            {menuItems.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className={location.pathname === item.to || (item.to === '/ask-ai' && location.pathname === '/') ? 'active' : ''}
                  title={item.label}
                >
                  <i>{item.icon}</i>
                  {!isCollapsed && <span>{item.label}</span>}
                </Link>
              </li>
            ))}

            {/* Pro Section */}
            {(user?.plan === 'pro' || user?.plan === 'ultra') && (
              <>
                {!isCollapsed && <li className="menu-divider">PRO TOOLS</li>}
                {proItems.map((item) => (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      className={location.pathname === item.to ? 'active' : ''}
                      title={`${item.label} (PRO)`}
                      style={{ color: '#ffd700' }}
                    >
                      <i>{item.icon}</i>
                      {!isCollapsed && <span>{item.label}</span>}
                    </Link>
                  </li>
                ))}
              </>
            )}

            {/* Action Items */}
            <li>
              <Link to="/pricing" className={location.pathname === '/pricing' ? 'active' : ''} title="Go Pro">
                <i>💎</i>
                {!isCollapsed && <span>Upgrade</span>}
              </Link>
            </li>
          </ul>
        </div>

        <div className="sidebar-footer">
          <div className="user-profile-card">
            <div className="profile-main">
              <div className="avatar-circle">
                {user?.username?.charAt(0).toUpperCase()}
              </div>
              {!isCollapsed && (
                <div className="profile-info">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span className="user-name">{user?.username}</span>
                    {user?.plan !== 'free' && <span className="pro-chip">PRO</span>}
                  </div>
                  <span className="user-credits">🪙 {user?.credits} Credits</span>
                  <div className="credit-progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${Math.min((user?.credits / 20) * 100, 100)}%`,
                        background: user?.credits < 5 ? '#ff3366' : 'var(--grad-primary)',
                        boxShadow: `0 0 10px ${user?.credits < 5 ? '#ff3366' : 'var(--primary)'}`
                      }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            {!isCollapsed && (
              <button
                onClick={() => setIsReferralOpen(true)}
                className="mini-btn referral"
              >
                🎁 Earn Credits
              </button>
            )}
          </div>

          <button onClick={logout} className="logout-button" title="Logout">
            <i>🚪</i> {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </nav>

      <ReferralModal isOpen={isReferralOpen} onClose={() => setIsReferralOpen(false)} />
    </>
  );
}