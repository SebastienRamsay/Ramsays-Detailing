const Cart = require("../models/cartModel");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const getCart = async (req, res) => {
  try {
    const encoded_user_id = req.cookies.token;
    if (encoded_user_id === "guest") {
      return res.status(200).json({ message: "Guests don't store cart in db" });
    }
    const user_id = jwt.verify(encoded_user_id, process.env.SECRET).userID;
    const cart = await Cart.findOne({ user_id });
    if (!cart) {
      return res.status(200).json({ message: "No Cart" });
    }
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message }); // Use a different status code, e.g., 500 for server error
  }
};

const addToCart = async (req, res) => {
  try {
    const encoded_user_id = req.cookies.token;
    const user_id = jwt.verify(encoded_user_id, process.env.SECRET).userID;
    const { service } = req.body;
    console.log({ user_id, service });
    const cart = await Cart.addToCart(user_id, service);
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const encoded_user_id = req.cookies.token;
    const user_id = jwt.verify(encoded_user_id, process.env.SECRET).userID;
    const { _id } = req.body;
    const cart = await Cart.removeFromCart(user_id, _id);
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const clearCart = async (req, res) => {
  try {
    const encoded_user_id = req.cookies.token;
    const user_id = jwt.verify(encoded_user_id, process.env.SECRET).userID;
    const cart = await Cart.clearCart(user_id);
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getCart,
  addToCart,
  removeFromCart,
  clearCart,
};
