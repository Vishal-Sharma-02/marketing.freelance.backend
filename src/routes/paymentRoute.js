import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import {
  createPaymentOrder,
  webhookHandler,
  verifyPremium,
} from "../controllers/paymentController.js";

const router = express.Router();

router.post("/payment/create", authenticate, createPaymentOrder);
router.get("/premium/verify", authenticate, verifyPremium);

export default router;
export { webhookHandler };
