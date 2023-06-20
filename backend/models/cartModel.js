const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    services: [
      {
        serviceName: {
          type: String,
          required: true,
        },
        servicePrice: {
          type: Number,
          required: true
        },
        answeredQuestions: [
          {
            question: {
              type: String,
              required: true,
            },
            answer: {
              type: String,
              required: true,
            },
            costIncrease: {
              type: Number,
              required: true,
            },
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

cartSchema.statics.addToCart = async function (user_id, service) {
  try {
    let cart = await this.findOne({ user_id });

    if (!cart) {
      cart = new this({
        user_id,
        price: service.price,
        services: [
          {
            serviceName: service.title,
            servicePrice: service.price,
            answeredQuestions: service.answeredQuestions,
          },
        ],
      });
    } else {
      cart.price += service.price;
      cart.services.push({
        serviceName: service.title,
        servicePrice: service.price,
        answeredQuestions: service.answeredQuestions,
      });
    }

    await cart.save();
    return cart;
  } catch (error) {
    throw new Error(error);
  }
};

cartSchema.statics.removeFromCart = async function (user_id, service) {
  try {
    const cart = await this.findOne({ user_id });

    if (!cart) {
      throw new Error('No active cart found');
    }

    const serviceIndex = cart.services.findIndex(
      (s) => s.serviceName === service.title
    );
    if (serviceIndex === -1) {
      throw new Error('Service not found in cart');
    }

    cart.price -= service.price;
    cart.services.splice(serviceIndex, 1);

    await cart.save();
    return cart;
  } catch (error) {
    throw new Error('Failed to remove item from cart');
  }
};

module.exports = mongoose.model('Cart', cartSchema);
