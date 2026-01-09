import mongoose from 'mongoose';

const usageHistorySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    action: {
        type: String,
        required: true // e.g., 'Image Generation', 'Ask AI', 'Background Removal', 'Daily Bonus', 'Referral Bonus'
    },
    amount: {
        type: Number,
        required: true // -1 for deduction, +5 for bonus, etc.
    },
    description: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('UsageHistory', usageHistorySchema);
