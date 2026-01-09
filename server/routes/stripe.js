import express from 'express';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import { verifyToken } from '../middleware/auth.js';
import User from '../models/User.js';

dotenv.config();

const router = express.Router();

// Initialize Stripe with validation
const stripeKey = process.env.STRIPE_SECRET_KEY;
if (!stripeKey || stripeKey === 'sk_test_your_stripe_secret_key_here') {
    console.warn('⚠️  Stripe not configured. Add STRIPE_SECRET_KEY to .env file.');
}
const stripe = stripeKey && stripeKey !== 'sk_test_your_stripe_secret_key_here'
    ? new Stripe(stripeKey)
    : null;

// Create Checkout Session
router.post('/create-checkout-session', verifyToken, async (req, res) => {
    try {
        // Check if Stripe is configured
        if (!stripe) {
            return res.status(503).json({
                error: 'Payment system not configured. Please contact support.'
            });
        }

        const { plan } = req.body; // 'pro' or 'ultra'
        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Define plan details
        const plans = {
            pro: {
                price: 999, // $9.99 in cents
                credits: 200,
                name: 'Pro Plan',
                description: '200 Credits/Month + 10 Daily Bonus'
            },
            ultra: {
                price: 2999, // $29.99 in cents
                credits: 999999, // Unlimited represented as large number
                name: 'Ultra Plan',
                description: 'Unlimited Credits + VIP Support'
            }
        };

        const selectedPlan = plans[plan];
        if (!selectedPlan) {
            return res.status(400).json({ error: 'Invalid plan' });
        }

        // Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: selectedPlan.name,
                            description: selectedPlan.description,
                        },
                        unit_amount: selectedPlan.price,
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${process.env.CLIENT_URL}/pricing?success=true&plan=${plan}`,
            cancel_url: `${process.env.CLIENT_URL}/pricing?canceled=true`,
            client_reference_id: user._id.toString(),
            metadata: {
                userId: user._id.toString(),
                plan: plan,
                credits: selectedPlan.credits
            }
        });

        res.json({ url: session.url });
    } catch (error) {
        console.error('Stripe checkout error:', error);
        res.status(500).json({ error: 'Failed to create checkout session' });
    }
});

// Stripe Webhook Handler
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    // If Stripe not configured, just acknowledge
    if (!stripe) {
        return res.json({ received: true, note: 'Stripe not configured' });
    }

    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const userId = session.metadata.userId;
        const plan = session.metadata.plan;
        const credits = parseInt(session.metadata.credits);

        try {
            // Update user's plan and credits
            await User.findByIdAndUpdate(userId, {
                plan: plan,
                $inc: { credits: credits }
            });

            console.log(`✅ User ${userId} upgraded to ${plan} plan`);
        } catch (error) {
            console.error('Error updating user after payment:', error);
        }
    }

    res.json({ received: true });
});

export default router;
