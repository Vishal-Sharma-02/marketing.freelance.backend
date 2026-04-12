import jwt from "jsonwebtoken";
import User from "../models/user.js";
import { sendError } from "../utils/response.js";

export const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return sendError(res, "Unauthorized", "Authorization token missing", 401);
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
    const user = await User.findById(decoded._id);

    if (!user) {
      return sendError(res, "Unauthorized", "User not found", 401);
    }

    req.user = user;
    
    next();
  } catch (err) {
    return sendError(res, "Unauthorized", err.message, 401);
  }
};