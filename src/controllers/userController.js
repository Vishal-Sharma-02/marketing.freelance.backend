import { sendSuccess, sendError } from "../utils/response.js";
import userService from "../services/userService.js";

export const profile = async (req, res) => {
  try {
    const result = await userService.getProfile(req.user);
    return sendSuccess(res, "User profile fetched successfully", result, 200);
  } catch (err) {
    return sendError(res, err.message || "Server Error", null, err.statusCode || 500);
  }
};

export const updateProfile = async (req, res) => {
  try {
    const result = await userService.updateProfile(req.user, req.body);
    return sendSuccess(res, "Profile updated successfully", result, 200);
  } catch (err) {
    return sendError(res, err.message || "Server Error", null, err.statusCode || 500);
  }
};

export const updateUserById = async (req, res) => {
  try {
    const result = await userService.updateUserById(req.params.id, req.body);
    return sendSuccess(res, "User updated successfully", result, 200);
  } catch (err) {
    return sendError(res, err.message || "Server Error", null, err.statusCode || 500);
  }
};

export const getUsers = async (req, res) => {
  try {
    const result = await userService.getUsers(req.query);
    return sendSuccess(res, "Users fetched successfully", result, 200);
  } catch (err) {
    return sendError(res, err.message || "Server Error", null, err.statusCode || 500);
  }
};

export const getUserById = async (req, res) => {
  try {
    const result = await userService.getUserById(req.params.id);
    return sendSuccess(res, "User fetched successfully", result, 200);
  } catch (err) {
    return sendError(res, err.message || "Server Error", null, err.statusCode || 500);
  }
};