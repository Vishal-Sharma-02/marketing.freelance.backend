import { sendEmail } from "../utils/emailService.js";
import { sendSuccess, sendError } from "../utils/response.js";
import razorpayInstance from "../utils/razorpay.js";
import Payment from "../models/payment.js";
import User from "../models/user.js";
import subscriptionAmount from "../utils/constants.js";
import { validateWebhookSignature } from "razorpay/dist/utils/razorpay-utils.js";
import { paymentSuccessEmail } from "../emails/paymentSuccess.js";

export const createPaymentOrder = async (req, res) => {
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

    return sendSuccess(res, "Order created", {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      notes: order.notes,
      keyId: process.env.RAZORPAY_KEY_ID,
    }, 200);
  } catch (err) {
    console.error("Payment create error:", err);
    return sendError(res, "Payment creation failed", err.message, 500);
  }
};

export const webhookHandler = async (req, res) => {
  try {
    const signature = req.headers["x-razorpay-signature"];
    const rawBody = req.body.toString();

    const valid = validateWebhookSignature(
      rawBody,
      signature,
      process.env.RAZORPAY_WEBHOOK_SECRET
    );

    if (!valid) {
      return res.status(400).send("Invalid webhook signature");
    }

    const data = JSON.parse(rawBody);
    const event = data.event;
    const paymentDetails = data.payload.payment.entity;

    if (event !== "payment.captured") {
      return res.status(200).send("Event ignored");
    }

    const payment = await Payment.findOneAndUpdate(
      { orderId: paymentDetails.order_id },
      {
        status: paymentDetails.status,
        paymentId: paymentDetails.id,
      },
      { new: true }
    );

    if (!payment) {
      return res.status(200).send("Payment record not found");
    }

    await User.findByIdAndUpdate(payment.userId, {
      isSubscribed: true,
    });

    const user = await User.findById(payment.userId);
    if (user) {
      await sendEmail(
        user.emailId,
        "Payment Successful ✔",
        paymentSuccessEmail(user.fullName, paymentDetails.order_id, paymentDetails.amount)
      );
    }

    return res.status(200).send("OK");
  } catch (err) {
    console.error("Webhook Error:", err);
    return res.status(500).send("Webhook Error");
  }
};

export const verifyPremium = async (req, res) => {
  try {
    const user = req.user;
    return sendSuccess(res, "Subscription status fetched", {
      isLoggedIn: true,
      isSubscribed: user.isSubscribed,
      name: user.fullName,
      email: user.emailId,
    }, 200);
  } catch (err) {
    console.error("Premium verify error:", err);
    return sendError(res, "Error verifying subscription", err.message, 500);
  }
};
