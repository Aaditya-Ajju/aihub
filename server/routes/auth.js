import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';
import UsageHistory from '../models/UsageHistory.js';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const router = express.Router();

import { verifyToken } from '../middleware/auth.js';

// Register
router.post('/register', async (req, res) => {
    try {
        const { username, password, referralCode } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: "Username and password are required" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        let referredBy = null;
        if (referralCode) {
            const referrer = await User.findOne({ referralCode: referralCode.trim().toUpperCase() });
            if (referrer) {
                referredBy = referrer._id;
            }
        }

        const user = new User({
            username,
            password: hashedPassword,
            referredBy,
            credits: referredBy ? 15 : 10
        });

        await user.save();

        // Log registration history
        await UsageHistory.create({
            userId: user._id,
            action: 'Account Created',
            amount: user.credits,
            description: `Started with ${user.credits} credits ${referredBy ? '(Referral Bonus included)' : ''}`
        });

        // Give referrer credits ONLY after successful registration
        if (referredBy) {
            await User.findByIdAndUpdate(referredBy, { $inc: { credits: 5 } });

            // Log history for referrer
            await UsageHistory.create({
                userId: referredBy,
                action: 'Referral Bonus',
                amount: 5,
                description: `Earned for inviting ${user.username}`
            });

            // Emit socket update for referrer if online
            const io = req.app.get('socketio');
            const userSockets = req.app.get('userSockets');
            if (io && userSockets) {
                const referrerSocketId = userSockets.get(referredBy.toString());
                if (referrerSocketId) {
                    const updatedReferrer = await User.findById(referredBy);
                    io.to(referrerSocketId).emit('creditsUpdate', updatedReferrer.credits);
                }
            }
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '24h' });

        res.status(201).json({
            token,
            credits: user.credits,
            username: user.username,
            _id: user._id,
            referralCode: user.referralCode,
            plan: user.plan
        });
    } catch (error) {
        console.error("CRITICAL REGISTRATION ERROR:", error);
        res.status(500).json({
            error: error.code === 11000 ? "Username already taken" : "Internal server error during registration"
        });
    }
});

// Daily Bonus
router.post('/claim-daily-bonus', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        const now = new Date();
        const lastClaimed = user.lastBonusClaimed || new Date(0);

        // Check if 24 hours have passed
        const diffHours = (now - lastClaimed) / (1000 * 60 * 60);

        if (diffHours >= 24) {
            user.credits += 2;
            user.lastBonusClaimed = now;
            await user.save();

            // Log history
            await UsageHistory.create({
                userId: user._id,
                action: 'Daily Bonus',
                amount: 2,
                description: 'Claimed daily check-in reward'
            });

            // Emit Real-time Update
            const io = req.app.get('socketio');
            const userSockets = req.app.get('userSockets');
            const socketId = userSockets.get(user._id.toString());
            if (socketId) io.to(socketId).emit('creditsUpdate', user.credits);

            return res.json({ success: true, credits: user.credits, lastBonusClaimed: user.lastBonusClaimed, message: "+2 Daily Bonus Claimed! 🪙" });
        } else {
            return res.status(400).json({ success: false, error: "Already claimed today!" });
        }
    } catch (error) {
        res.status(500).json({ error: "Failed to claim bonus" });
    }
});

// Google Login
router.post('/google', async (req, res) => {
    try {
        const { token: googleToken, referralCode } = req.body;
        const ticket = await client.verifyIdToken({
            idToken: googleToken,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        const { name, sub } = ticket.getPayload();

        let user = await User.findOne({ username: name });

        if (!user) {
            // Check Referral for New Google User
            let referredBy = null;
            if (referralCode) {
                const referrer = await User.findOne({ referralCode: referralCode.trim().toUpperCase() });
                if (referrer) referredBy = referrer._id;
            }

            const randomPass = Math.random().toString(36).slice(-10);
            const hashedPassword = await bcrypt.hash(randomPass, 10);

            user = new User({
                username: name,
                password: hashedPassword,
                referredBy,
                credits: referredBy ? 15 : 10
            });
            await user.save();

            // Log registration history
            await UsageHistory.create({
                userId: user._id,
                action: 'Google Sign-up',
                amount: user.credits,
                description: `Started with ${user.credits} credits ${referredBy ? '(Referral Bonus included)' : ''}`
            });

            // Give referrer bonus
            if (referredBy) {
                await User.findByIdAndUpdate(referredBy, { $inc: { credits: 5 } });

                // Log history for referrer
                await UsageHistory.create({
                    userId: referredBy,
                    action: 'Referral Bonus',
                    amount: 5,
                    description: `Earned for inviting ${user.username}`
                });
                const io = req.app.get('socketio');
                const userSockets = req.app.get('userSockets');
                if (io && userSockets) {
                    const rSid = userSockets.get(referredBy.toString());
                    if (rSid) {
                        const updRef = await User.findById(referredBy);
                        io.to(rSid).emit('creditsUpdate', updRef.credits);
                    }
                }
            }
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '24h' });
        res.json({
            token,
            credits: user.credits,
            username: user.username,
            _id: user._id,
            referralCode: user.referralCode,
            plan: user.plan
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Google login failed" });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) return res.status(404).json({ error: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '24h' });

        res.json({ token, credits: user.credits, username: user.username, _id: user._id, referralCode: user.referralCode, plan: user.plan, lastBonusClaimed: user.lastBonusClaimed });
    } catch (error) {
        res.status(500).json({ error: "Login failed" });
    }
});

// Get User Info (Credits)
router.get('/me', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password');
        if (!user) return res.status(404).json({ error: "User not found" }); // Added null user check

        // Migration: Ensure old users get a referral code
        if (!user.referralCode) {
            user.referralCode = Math.random().toString(36).substring(2, 9).toUpperCase();
            await user.save();
        }

        res.json(user);
    } catch (error) {
        console.error("ME Error:", error); // Added error logging
        res.status(500).json({ error: "Failed to fetch user" });
    }
});

// Get Referral History
router.get('/referrals', verifyToken, async (req, res) => {
    try {
        const referrals = await User.find({ referredBy: req.userId })
            .select('username createdAt')
            .sort({ createdAt: -1 });
        res.json(referrals || []); // Ensure an empty array is returned if no referrals
    } catch (error) {
        console.error("Referrals Error:", error); // Added error logging
        res.status(500).json({ error: "Failed to fetch referrals" });
    }
});

// Get Usage History
router.get('/history', verifyToken, async (req, res) => {
    try {
        const history = await UsageHistory.find({ userId: req.userId })
            .sort({ createdAt: -1 })
            .limit(50);
        res.json(history);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch history" });
    }
});

// Get Leaderboard (Top Referrers)
router.get('/leaderboard', async (req, res) => {
    try {
        // Aggregate to find users with most referrals
        const leaderboard = await User.aggregate([
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: 'referredBy',
                    as: 'referrals'
                }
            },
            {
                $project: {
                    username: 1,
                    referralCount: { $size: '$referrals' }
                }
            },
            { $sort: { referralCount: -1 } },
            { $limit: 10 }
        ]);
        res.json(leaderboard);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
});

export default router;
