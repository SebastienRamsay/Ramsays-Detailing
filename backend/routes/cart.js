const express = require("express");

const {
  getCart,
  addToCart,
  removeFromCart,
  clearCart,
} = require("../controllers/cartController");

const router = express.Router();

router.post("/", addToCart);

router.get("/", getCart);

router.delete("/", removeFromCart);
router.delete("/clear", clearCart);

module.exports = router;
