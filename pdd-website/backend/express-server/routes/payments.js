const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

router.post('/create-checkout-session', async (req, res) => {
  const { priceId, email } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId || 'price_1Pjk6ySD4iRxtSSvF6vY6Y6Y', // Replace with your real Stripe Price ID
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `https://ravi123sv.github.io/pdd-project/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `https://ravi123sv.github.io/pdd-project/checkout/cancel`,
      customer_email: email,
    });

    res.json({ id: session.id, url: session.url });
  } catch (err) {
    console.error('[STRIPE] Session Creation Error:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
