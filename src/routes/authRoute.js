import express from "express";
import {
  register,
  login,
  logout,
  forgotPasswordController,
  verifyOtpController,
  resetPasswordController,
  healthCheck,
} from "../controllers/authController.js";

import {
  validateRegister,
  validateLogin,
  validateEmail,
  validateEmailOtp,
  validateResetPassword,
} from "../validators/authValidator.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const authRouter = express.Router();

authRouter.post("/auth/register", validateRegister, register);
authRouter.post("/auth/login", validateLogin, login);
authRouter.get("/auth/logout", authenticate, authorizeRoles("user", "admin"), logout);
authRouter.post("/auth/forgot-password", validateEmail, forgotPasswordController);
authRouter.post("/auth/verify-otp", validateEmailOtp, verifyOtpController);
authRouter.post("/auth/reset-password", validateResetPassword, resetPasswordController);
authRouter.get("/health", healthCheck);

export default authRouter;  