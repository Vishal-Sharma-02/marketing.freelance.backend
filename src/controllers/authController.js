import {
  registerUser,
  loginUser,
  forgotPassword,
  verifyOtp,
  resetPassword,
} from "../services/authService.js";
import { sendSuccess, sendError } from "../utils/response.js";

export const register = async (req, res) => {
  try {
    const result = await registerUser(req.body, req.headers["user-agent"]);
    return sendSuccess(res, "User registered successfully", result, 201);
  } catch (err) {
    return sendError(res, err.message || "Server Error", null, err.statusCode || 500);
  }
};

export const login = async (req, res) => {
  try {
    const result = await loginUser(req.body, req.headers["user-agent"]);
    return sendSuccess(res, "Login successful", result, 200);
  } catch (err) {
    return sendError(res, err.message || "Server Error", null, err.statusCode || 500);
  }
};

export const logout = (req, res) => {
  try {
    return sendSuccess(res, "Logged out successfully", null, 200);
  } catch (err) {
    return sendError(res, "Logout failed", err.message, 500);
  }
};

export const forgotPasswordController = async (req, res) => {
  try {
    const result = await forgotPassword(req.body.emailId);
    return sendSuccess(res, result.message, null, 200);
  } catch (err) {
    return sendError(res, err.message || "Server Error", null, err.statusCode || 500);
  }
};

export const verifyOtpController = async (req, res) => {
  try {
    const result = await verifyOtp(req.body.emailId, req.body.otp);
    return sendSuccess(res, result.message, null, 200);
  } catch (err) {
    return sendError(res, err.message || "Server Error", null, err.statusCode || 500);
  }
};

export const resetPasswordController = async (req, res) => {
  try {
    const result = await resetPassword(req.body.emailId, req.body.newPassword);
    return sendSuccess(res, result.message, null, 200);
  } catch (err) {
    return sendError(res, err.message || "Server Error", null, err.statusCode || 500);
  }
};

export const healthCheck = (req, res) => {
  return sendSuccess(res, "OK", null, 200);
};