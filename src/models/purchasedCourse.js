import mongoose from "mongoose";

const purchaseSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },

    // When purchased
    purchaseDate: {
      type: Date,
      default: Date.now,
    },

    // Validity: e.g. validity in days
    expiresAt: {
      type: Date,
      required: true,
    },

    // Optional: for package-related purchase
    packageName: { type: String }
  },
  { timestamps: true }
);

export default mongoose.model("Purchase", purchaseSchema);
