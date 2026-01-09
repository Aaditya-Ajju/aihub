import { useState, useContext, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from 'react-hot-toast';

import { AuthContext } from "./context/AuthContext";
import Navbar from "./components/Navbar.jsx";
import ImageGen from "./pages/ImageGen.jsx";
import AskAi from "./pages/AskAi.jsx";
import BgRemover from "./pages/BgRemover.jsx";
import ImageToPdf from "./pages/ImageToPdf.jsx";
import QrGenerator from "./pages/QrGenerator.jsx";
import GiftIdeas from "./pages/GiftIdeas.jsx";
import Login from "./pages/Login.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import UsageHistory from "./pages/UsageHistory.jsx";
import Leaderboard from "./pages/Leaderboard.jsx";
import SupportChat from "./components/SupportChat.jsx";
import Pricing from "./pages/Pricing.jsx";
import TopNav from "./components/TopNav.jsx";
import Gallery from "./pages/Gallery.jsx";
import BatchBg from "./pages/BatchBg.jsx";
import Dashboard from "./pages/Dashboard.jsx";

export default function App() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const { user, loading } = useContext(AuthContext);
  const [isSupportOpen, setIsSupportOpen] = useState(false);

  const toggleSupport = () => setIsSupportOpen(!isSupportOpen);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) {
      sessionStorage.setItem('referralCode', ref);
    }
  }, []);

  if (loading) {
    return <div style={{ height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", color: "white" }}>Loading...</div>;
  }

  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ style: { background: '#1a0a30', color: '#fff', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' } }} />
      {!user ? (
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<LandingPage />} />
        </Routes>
      ) : (
        <>
          <div className={`app-container ${isCollapsed ? 'collapsed' : ''}`}>
            <Navbar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />
            <main className="main-content">
              <TopNav toggleSupport={toggleSupport} />
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/image" element={<ImageGen />} />
                <Route path="/ask-ai" element={<AskAi />} />
                <Route path="/bg-remover" element={<BgRemover />} />
                <Route path="/img-to-pdf" element={<ImageToPdf />} />
                <Route path="/qr-generator" element={<QrGenerator />} />
                <Route path="/gift-ideas" element={<GiftIdeas />} />
                <Route path="/usage-history" element={<UsageHistory />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/batch-bg" element={<BatchBg />} />
                <Route path="*" element={<Dashboard />} />
              </Routes>
            </main>
          </div>
          <SupportChat isOpen={isSupportOpen} setIsOpen={setIsSupportOpen} />
        </>
      )}
    </BrowserRouter>
  );
}