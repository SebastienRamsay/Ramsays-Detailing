const stripe = require("stripe")(process.env.STRIPE_KEY);
const jwt = require("jsonwebtoken");
const {
  createBooking,
  markBookingPaid,
  deleteBooking,
} = require("./bookingController");
const Booking = require("../models/bookingModel");
const User = require("../models/userModel");
const { DateTime } = require("luxon");
// Endpoint for creating a Stripe Checkout ses
async function createCheckoutSession(req, res) {
  try {
    const { items, cart, bookingId } = req.body;
    var varBookingId;
    var date;
    if (cart.services.length > 3) {
      return res.status(400).send("You can only book 3 services at a time");
    }

    if (!bookingId) {
      // Setup date for 48 hour check
      const jsDate = new Date(cart.selectedDateTime);
      date = DateTime.fromJSDate(jsDate);
      // Set additional properties in the request body
      req.body.cart = cart;
      // Call createBooking function
      const response = await createBooking(req, res);
      if (response.created) {
        varBookingId = response.newBooking._id.toString();
      } else {
        console.error("Error Creating Booking: ", response.message);
        return res.status(400).send(response.message);
      }
    } else {
      date = DateTime.fromISO(cart.date);
      varBookingId = bookingId;
    }

    // Calculate the difference in hours
    const differenceInHours = date.diff(DateTime.now(), "hours").hours;
    // 48 hour check
    if (differenceInHours < 0) {
      return res.status(400).send("Date has already passed");
    } else if (differenceInHours <= 48) {
      return res.status(400).send("Date is within 48 hours of right now");
    }

    // Check if createBooking was successful
    if (varBookingId) {
      // Create a Stripe Checkout session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: items,
        mode: "payment",
        success_url: `https://ramsaysdetailing.ca/bookings?success=true&id=${varBookingId}`,
        cancel_url: "https://ramsaysdetailing.ca/bookings?failed=true",
        automatic_tax: { enabled: true },
        metadata: {
          bookingId: varBookingId,
        },
      });

      // Return the session ID to the client
      return res.json({ sessionId: session.id });
    } else {
      // If createBooking failed, return an error response
      console.error("Error Creating Booking: ", response.message);
      return res.status(400).send(response.message);
    }
  } catch (error) {
    console.error("Error Creating Checkout Session:", error.message);
    return res.status(500).json({ error: error.message });
  }
}

async function refundCheckoutSession(req, res) {
  const _id = req.body._id;
  try {
    console.log(req.body._id);
    if (!_id) {
      return res.status(400).send("MUST PROVIDE _ID");
    }

    const booking = await Booking.findById(_id);
    if (!booking.payment_intent) {
      const response = await deleteBooking(req, res);
      if (response.complete) {
        return res.status(200).send("No Payment Intent, Booking Deleted");
      } else {
        return res.status(400).send(response.message);
      }
    }

    // Calculate the difference in hours
    const differenceInHours = DateTime.fromISO(booking.date).diff(
      DateTime.now(),
      "hours"
    ).hours;
    if (differenceInHours < 0) {
      return res.status(400).send("Date has already passed");
    } else if (differenceInHours <= 48) {
      return res.status(400).send("Date is within 48 hours of right now");
    }

    const encoded_payment_intent = booking.payment_intent;
    if (!encoded_payment_intent) {
      return res.status(400).send("PAYMENT HAS NOT GONE THROUGH");
    }
    const payment_intent = jwt.verify(
      encoded_payment_intent,
      process.env.SECRET
    );
    console.log(payment_intent);
    const refund = await stripe.refunds.create({
      payment_intent,
    });
    if (refund.status === "failed") {
      console.error("REFUND FAILED: ", refund.failure_reason);
      return res.status(400).send("REFUND FAILED");
    }
    const response = await deleteBooking(req, res);
    if (response.complete) {
      return res.status(200).send("Refund Complete");
    } else {
      return res.status(400).send(response.message);
    }
  } catch (error) {
    console.error("Error Creating Refund:", error.message);
    return res.status(500).json({ error: error.message });
  }
}

async function connectStripeAccount(req, res) {
  try {
    const token = req.cookies.token;
    const decodedToken = jwt.verify(token, process.env.SECRET);
    const userID = decodedToken.userID;

    const user = await User.findOne({ _id: userID });
    var stripeId;
    if (user.stripeId) {
      stripeId = jwt.verify(user.stripeId, process.env.SECRET);

      const account = await stripe.accounts.retrieve(stripeId);

      if (account.charges_enabled && account.details_submitted) {
        user.onboardingComplete = true;
        user.save();
        return res.status(200).send("Stripe Account Connected");
      }
    } else {
      const account = await stripe.accounts.create({
        type: "express",
      });
      user.stripeId = jwt.sign(account.id, process.env.SECRET);
      user.save();
      stripeId = account.id;
    }

    const accountLink = await stripe.accountLinks.create({
      account: stripeId,
      refresh_url:
        "https://ramsaysdetailing.ca:4000/api/stripe/connectStripeAccount",
      return_url: "https://ramsaysdetailing.ca/employee?success=true",
      type: "account_onboarding",
    });
    res.status(200).send({ url: accountLink.url });
  } catch (error) {
    console.error(error.message);
    return res.status(400).send(error.message);
  }
}

async function deleteStripeAccount(req, res) {
  try {
    const token = req.cookies.token;
    const decodedToken = jwt.verify(token, process.env.SECRET);
    const userID = decodedToken.userID;

    const user = await User.findOne({ _id: userID });
    if (!user.stripeId) {
      return res.status(400).send("No Stripe Account To Delete");
    }
    const stripeId = jwt.verify(user.stripeId, process.env.SECRET);
    const deleted = await stripe.accounts.del(stripeId);

    if (deleted.deleted) {
      user.stripeId = undefined;
      user.onboardingComplete = false;
      user.save();
      return res.status(200).send("Stripe Account Deleted");
    }
    return res.status(400).send("Failed To Delete Stripe Account");
  } catch (error) {
    console.error(error.message);
    return res.status(400).send(error.message);
  }
}

async function manageStripeWebhook(req, res) {
  const payload = req.rawBody;
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    event = await stripe.webhooks.constructEvent(
      payload,
      sig,
      process.env.ENDPOINTSECRET
    );
    console.log(event.type);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;

      if (session.payment_status === "paid") {
        const bookingId = session.metadata.bookingId;
        console.log(bookingId, "101");
        req.body.payment_intent = session.payment_intent;
        req.body.bookingId = bookingId;
        console.log("session complete: ", session);
        console.log("paymentIntentId: ", session.payment_intent);
        const response = await markBookingPaid(req, res);
        if (response.complete) {
          console.log("session complete: ", session);
          console.log("paymentIntentId: ", session.payment_intent);
        } else {
          console.error(response.message);
        }
      }

      break;
    }
  }

  // Return a response to acknowledge receipt of the event
  return res.json({ received: true });
}

async function payoutEmployee(req, res) {
  try {
    const { bookingId, comment, rating } = req.body;
    const token = req.cookies.token;
    const decodedToken = jwt.verify(token, process.env.SECRET);
    const userID = decodedToken.userID;
    const user = await User.findOne({ _id: userID });

    const booking = await Booking.findById(bookingId);
    if (booking.status !== "Complete") {
      return res.status(400).send("Booking not complete");
    }
    if (booking.employeeId === "none") {
      return res.status(400).send("Booking not claimed");
    }
    if (!booking.payment_intent) {
      return res.status(400).send("Booking has not been paid for");
    }

    const gasMoney = 20;
    const amountToTransfer = booking.expectedTimeToComplete * 20 + gasMoney;

    const employee = await User.findOne({ _id: booking.employeeId });

    if (!employee.stripeId) {
      booking.status = "Confirmed";
      booking.transferInfo = "Admin Transfer";
      booking.rating = rating;
      booking.comment = comment;
      booking.save();
      return res.status(200).send("Admin Transfer Complete");
    }
    const stripeId = jwt.verify(employee.stripeId, process.env.SECRET);
    console.log(amountToTransfer);

    if (booking.userId === user._id.toString()) {
      console.log("YOU CREATED THIS BOOKING");
      const transfer = await stripe.transfers.create({
        amount: amountToTransfer,
        currency: "cad",
        destination: stripeId,
      });
      const transferInfo = jwt.sign(transfer, process.env.SECRET);
      booking.status = "Confirmed";
      booking.transferInfo = transferInfo;
      booking.rating = rating;
      booking.comment = comment;
      booking.save();
      return res.status(200).send("Transfer Complete");
    }
    try {
      const adminToken = req.cookies.admin;
      const decodedToken = jwt.verify(adminToken, process.env.SECRET);
      const isAdmin = decodedToken.isAdmin;
      if (isAdmin) {
        console.log("YOU ARE AN ADMIN");
        const transfer = await stripe.transfers.create({
          amount: amountToTransfer,
          currency: "cad",
          destination: stripeId,
        });
        const transferInfo = jwt.sign(transfer, process.env.SECRET);
        booking.status = "Confirmed";
        booking.transferInfo = transferInfo;
        booking.rating = rating;
        booking.comment = comment;
        booking.save();
        return res.status(200).send("Transfer Complete");
      } else {
        console.log("YOU ARE NOT AN ADMIN");
      }
    } catch (error) {
      // user is not an admin
    }

    return res.status(400).send("Insufficient Permissions");
  } catch (error) {
    console.error(error.message);
    return res.status(400).send(error.message);
  }
}

module.exports = {
  createCheckoutSession,
  manageStripeWebhook,
  refundCheckoutSession,
  connectStripeAccount,
  deleteStripeAccount,
  payoutEmployee,
};
