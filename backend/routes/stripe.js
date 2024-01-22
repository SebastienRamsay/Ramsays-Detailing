const express = require("express");
const {
  createCheckoutSession,
  manageStripeWebhook,
} = require("../controllers/stripeController");

const router = express.Router();

router.post("/createCheckoutSession", createCheckoutSession);

router.post("/webhook", manageStripeWebhook);

module.exports = router;
