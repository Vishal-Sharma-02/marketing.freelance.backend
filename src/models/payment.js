import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "User"
    },

    paymentId: {
      type: String, // Razorpay payment ID (captured from webhook)
    },

    orderId: {
      type: String,
      required: true, // FIXED TYPO
    },

    status: {
      type: String,
      required: true, // created, paid, failed
    },

    amount: {
      type: Number,
      required: true,
    },

    currency: {
      type: String,
      required: true,
    },

    receipt: {
      type: String,
      required: true,
    },

    notes: {
      type: Object, // more flexible
      default: {},
    }
  },

  { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);
