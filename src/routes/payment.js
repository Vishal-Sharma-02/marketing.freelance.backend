import express from "express";
import userAuth  from "../middleware/auth.js";
import razorpayInstance from "../utils/razorpay.js";
import Payment from "../models/payment.js";
import  subscriptionAmount from "../utils/constants.js";
import { validateWebhookSignature } from "razorpay/dist/utils/razorpay-utils.js";
import User from "../models/user.js";

const paymentRouter = express.Router();

paymentRouter.post("/payment/create", userAuth, async (req, res) => {
  try {
    const user = req.user; // Already authenticated by userAuth

    const order = await razorpayInstance.orders.create({
      amount: subscriptionAmount * 100,
      currency: "INR",
      receipt: "receipt_#1",
      notes: {
        fullName: user.fullName
      }
    });

    const payment = await Payment.create({
      userId: user._id,
      orderId: order.id,
      status: order.status,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      notes: order.notes,
    });

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      notes: order.notes,
      keyId: process.env.RAZORPAY_KEY_ID,
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Payment creation failed" });
  }
});


paymentRouter.post("/payment/webhook", async (req, res) => {
  try {
    const signature = req.headers["x-razorpay-signature"];

    const isValid = validateWebhookSignature(
      JSON.stringify(req.body),
      signature,
      process.env.RAZORPAY_WEBHOOK_SECRET
    );

    if (!isValid) {
      return res.status(400).send("Invalid webhook signature");
    }

    const event = req.body.event; 
    const paymentDetails = req.body.payload.payment.entity;

    // Only handle successful captured payments
    if (event !== "payment.captured") {
      return res.status(200).send("Event ignored");
    }

    // Update payment record
    await Payment.findOneAndUpdate(
      { orderId: paymentDetails.order_id },
      {
        status: paymentDetails.status,
        paymentId: paymentDetails.id
      }
    );

    // Get payment entry
    const payment = await Payment.findOne({ orderId: paymentDetails.order_id });

    // Update user subscription
    await User.findByIdAndUpdate(payment.userId, {
      isSubscribed: true
    });

    return res.status(200).send("OK");

  } catch (err) {
    console.log(err);
    return res.status(500).send("Webhook Error");
  }
});



paymentRouter.get("/premium/verify", userAuth, async (req, res) => {
  try {
    const user = req.user;

    return res.json({
      isLoggedIn: true,
      isSubscribed: user.isSubscribed,
      name: user.fullName,
      email: user.emailId
    });

  } catch (err) {
    res.status(500).json({ message: "Error verifying subscription" });
  }
});
 
 
export default paymentRouter;