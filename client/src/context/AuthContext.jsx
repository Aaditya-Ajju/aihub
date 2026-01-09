import { createContext, useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import { API_BASE_URL, SOCKET_URL } from '../config/api.js';

export const AuthContext = createContext();

let socket;

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user && user._id) {
            if (!socket) {
                socket = io(SOCKET_URL);
                socket.emit("register", user._id);
                socket.on("creditsUpdate", (newCredits) => {
                    setUser(prev => ({ ...prev, credits: newCredits }));
                });
            }
        }
        return () => {
            if (socket && !user) {
                socket.disconnect();
                socket = null;
            }
        };
    }, [user]);

    const handleDailyBonus = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;
        try {
            const { data } = await axios.post(`${API_BASE_URL}/api/auth/claim-daily-bonus`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data.success) {
                setUser(prev => ({ ...prev, credits: data.credits }));
                toast.success(data.message, { icon: '🪙', duration: 5000 });
            }
        } catch (error) {
            // Already claimed or error, ignore
        }
    };

    const checkUser = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const { data } = await axios.get(`${API_BASE_URL}/api/auth/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUser(data);
            handleDailyBonus();
        } catch (error) {
            localStorage.removeItem("token");
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkUser();
    }, []);

    const login = async (username, password) => {
        try {
            const { data } = await axios.post(`${API_BASE_URL}/api/auth/login`, { username, password });
            localStorage.setItem("token", data.token);
            setUser({ _id: data._id, username: data.username, credits: data.credits, referralCode: data.referralCode, plan: data.plan, lastBonusClaimed: data.lastBonusClaimed });
            handleDailyBonus();
            return { success: true, credits: data.credits };
        } catch (error) {
            return { success: false, error: error.response?.data?.error || "Login failed" };
        }
    };

    const register = async (username, password, referralCode) => {
        try {
            const { data } = await axios.post(`${API_BASE_URL}/api/auth/register`, { username, password, referralCode });
            localStorage.setItem("token", data.token);
            setUser({ _id: data._id, username: data.username, credits: data.credits, referralCode: data.referralCode, plan: data.plan, lastBonusClaimed: data.lastBonusClaimed });
            return { success: true, credits: data.credits };
        } catch (error) {
            return { success: false, error: error.response?.data?.error || "Registration failed" };
        }
    };

    const updateCredits = (newCredits) => {
        setUser(prev => ({ ...prev, credits: newCredits }));
    };

    const googleLogin = async (googleToken, referralCode) => {
        try {
            const { data } = await axios.post(`${API_BASE_URL}/api/auth/google`, { token: googleToken, referralCode });
            localStorage.setItem("token", data.token);
            setUser({ _id: data._id, username: data.username, credits: data.credits, referralCode: data.referralCode, plan: data.plan, lastBonusClaimed: data.lastBonusClaimed });
            handleDailyBonus();
            return { success: true, credits: data.credits };
        } catch (error) {
            return { success: false, error: error.response?.data?.error || "Google login failed" };
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        if (socket) {
            socket.disconnect();
            socket = null;
        }
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, setUser, login, register, logout, loading, updateCredits, googleLogin }}>
            {children}
        </AuthContext.Provider>
    );
};
