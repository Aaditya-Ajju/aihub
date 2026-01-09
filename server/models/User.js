import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    credits: {
        type: Number,
        default: 10 // New users get 10 free credits
    },
    referralCode: {
        type: String,
        unique: true,
        sparse: true
    },
    referredBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    lastBonusClaimed: {
        type: Date
    },
    plan: {
        type: String,
        enum: ['free', 'pro', 'ultra'],
        default: 'free'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

userSchema.pre('save', async function () {
    if (!this.referralCode) {
        this.referralCode = Math.random().toString(36).substring(2, 9).toUpperCase();
    }
});

export default mongoose.model('User', userSchema);
