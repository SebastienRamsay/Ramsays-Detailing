const stripe = require("stripe")(process.env.STRIPE_KEY);
// Endpoint for creating a Stripe Checkout ses
async function createCheckoutSession(req, res) {
  try {
    const { items } = req.body;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: items,
      mode: "payment",
      success_url: "https://ramsaysdetailing.ca/cart?success=true",
      cancel_url: "https://ramsaysdetailing.ca/cart?canceled=true",
      automatic_tax: { enabled: true },
    });

    const paymentIntentId = session.payment_intent;
    console.log(paymentIntentId);
    res.json({ sessionId: session.id });
  } catch (error) {
    console.error("Error creating Checkout session:", error.message);
    res.status(500).json({ error: error.message });
  }
}

async function manageStripeWebhook(req, res) {
  const payload = req.body;
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the checkout.session.completed event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    // Fulfill the purchase...
    fulfillOrder(session);
  }
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      // Save an order in your database, marked as 'awaiting payment'
      createOrder(session);

      // Check if the order is paid (for example, from a card payment)
      //
      // A delayed notification payment will have an `unpaid` status, as
      // you're still waiting for funds to be transferred from the customer's
      // account.
      if (session.payment_status === "paid") {
        fulfillOrder(session);
      }

      break;
    }

    case "checkout.session.async_payment_succeeded": {
      const session = event.data.object;

      // Fulfill the purchase...
      fulfillOrder(session);

      break;
    }

    case "checkout.session.async_payment_failed": {
      const session = event.data.object;

      // Send an email to the customer asking them to retry their order
      emailCustomerAboutFailedPayment(session);

      break;
    }
  }

  res.status(200).end();
}

module.exports = {
  createCheckoutSession,
  manageStripeWebhook,
};
