const Cart = require('../models/cartModel')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')


const getCart = async (req, res) => {

    try{
        const userID = req.cookies.user;
        const cart = await Cart.findOne({userID})
        if (!cart){
            res.status(200).json({message: 'No Cart'})
        }
        res.status(200).json(cart)
    }catch(error){
        res.status(200).json({error: error})
    }

}

const addToCart = async (req, res) => {
  try {
    const encoded_user_id = req.cookies.user;
    const user_id = jwt.verify(encoded_user_id, process.env.SECRET).user
    const { service } = req.body;
    console.log({user_id, service})
    const cart = await Cart.addToCart(user_id, service);
    res.status(200).json(cart);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
};
  

const removeFromCart = async (req, res) => {
  try {
    const encoded_user_id = req.cookies.user;
    const user_id = jwt.verify(encoded_user_id, process.env.SECRET).user
    const { _id } = req.body;
    const cart = await Cart.removeFromCart(user_id, _id);
    res.status(200).json(cart);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
};
  

module.exports = {
    getCart,
    addToCart,
    removeFromCart
}


