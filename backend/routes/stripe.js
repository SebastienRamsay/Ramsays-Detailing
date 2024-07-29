const express = require("express");
const {
  createCheckoutSession,
  manageStripeWebhook,
  refundCheckoutSession,
  connectStripeAccount,
  deleteStripeAccount,
  payoutEmployee,
} = require("../controllers/stripeController");

const router = express.Router();

router.post("/createCheckoutSession", createCheckoutSession);

router.delete("/refundCheckoutSession", refundCheckoutSession);

router.post("/connectStripeAccount", connectStripeAccount);

router.post("/payoutEmployee", payoutEmployee);

router.delete("/deleteStripeAccount", deleteStripeAccount);

router.post("/webhook", manageStripeWebhook);

module.exports = router;
