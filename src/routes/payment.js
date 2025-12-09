import express from "express";
import userAuth from "../middleware/auth.js";
import razorpayInstance from "../utils/razorpay.js";
import Payment from "../models/payment.js";
import subscriptionAmount from "../utils/constants.js";
import { validateWebhookSignature } from "razorpay/dist/utils/razorpay-utils.js";
import User from "../models/user.js";
import { sendEmail } from "../utils/emailService.js";
import { paymentSuccessEmail } from "../emails/paymentSuccess.js";


const router = express.Router();

/* ============================================================
   1) CREATE ORDER (User Initiates Payment)
   ============================================================ */
router.post("/payment/create", userAuth, async (req, res) => {
  try {
    const user = req.user;

    const order = await razorpayInstance.orders.create({
      amount: subscriptionAmount * 100,
      currency: "INR",
      receipt: "receipt_#1",
      notes: { fullName: user.fullName },
    });

    await Payment.create({
      userId: user._id,
      orderId: order.id,
      status: "created",
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

/* ============================================================
   2) WEBHOOK HANDLER (Razorpay Calls This)
   ============================================================ */
export const webhookHandler = async (req, res) => {
  try {
    const signature = req.headers["x-razorpay-signature"];
    const rawBody = req.body.toString();

    const valid = validateWebhookSignature(
      rawBody,
      signature,
      process.env.RAZORPAY_WEBHOOK_SECRET
    );

    if (!valid) return res.status(400).send("Invalid webhook signature");

    const data = JSON.parse(rawBody);
    const event = data.event;
    const paymentDetails = data.payload.payment.entity;

    // Only process successful captured payments
    if (event !== "payment.captured") {
      return res.status(200).send("Event ignored");
    }

    // 1️⃣ Update payment record
    const payment = await Payment.findOneAndUpdate(
      { orderId: paymentDetails.order_id },
      {
        status: paymentDetails.status,
        paymentId: paymentDetails.id
      },
      { new: true }
    );

    if (!payment) {
      return res.status(200).send("Payment record not found");
    }

    // 2️⃣ Update user subscription
    await User.findByIdAndUpdate(payment.userId, {
      isSubscribed: true
    });
    
    // 3️⃣ Send Confirmation Email
    const user = await User.findById(payment.userId);

    console.log(user);
    
    if (user) {
      sendEmail(
        user.emailId,
        "Payment Successful ✔",
        paymentSuccessEmail(
          user.fullName,
          paymentDetails.order_id,
          paymentDetails.amount
        )
      );
    }

    return res.status(200).send("OK");
  } catch (err) {
    console.log("Webhook Error:", err);
    return res.status(500).send("Webhook Error");
  }
};
/* ============================================================
   3) PREMIUM VERIFY (Frontend polls subscription status)
   ============================================================ */
router.get("/premium/verify", userAuth, async (req, res) => {
  try {
    const user = req.user;

    res.json({
      isLoggedIn: true,
      isSubscribed: user.isSubscribed,
      name: user.fullName,
      email: user.emailId,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error verifying subscription" });
  }
});

export default router;
