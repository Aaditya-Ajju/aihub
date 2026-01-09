import mongoose from 'mongoose';

const workSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['image', 'bg-remover', 'qr-generator'], required: true },
    url: { type: String, required: true }, // URL or Base64
    prompt: { type: String }, // For images
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Work', workSchema);
