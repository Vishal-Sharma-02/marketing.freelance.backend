import { sendError } from "../utils/response.js";

export const authorizeRoles = (...allowedRoles) => (req, res, next) => {
  const userRole = req.user?.role || "user";
  if (!allowedRoles.includes(userRole)) {
    return sendError(res, "Forbidden", "You do not have permission", 403);
  }
  next();
};