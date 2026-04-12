import validator from "validator";
import { sendError } from "../utils/response.js";

const searchAllowedPattern = /^[\w\s@.+-]*$/;

export const validateUpdateUser = (req, res, next) => {
  const { fullName, emailId, mobile, state, role } = req.body;

  if (!fullName && !emailId && !mobile && !state && role === undefined) {
    return sendError(res, "Invalid request", "No fields provided to update", 400);
  }

  if (fullName && (typeof fullName !== "string" || fullName.trim().length < 3 || fullName.trim().length > 50)) {
    return sendError(res, "Invalid request", "fullName must be a string between 3 and 50 characters", 400);
  }

  if (emailId && !validator.isEmail(emailId)) {
    return sendError(res, "Invalid request", "emailId must be a valid email", 400);
  }

  if (mobile && !/^\d{10}$/.test(mobile)) {
    return sendError(res, "Invalid request", "mobile must be a 10 digit number", 400);
  }

  if (state && typeof state !== "string") {
    return sendError(res, "Invalid request", "state must be a string", 400);
  }

  if (role !== undefined && !["user", "admin"].includes(role)) {
    return sendError(res, "Invalid request", "role must be either user or admin", 400);
  }

  next();
};

export const validateGetUsersQuery = (req, res, next) => {
  const { search, page, limit } = req.query;

  if (search && typeof search !== "string") {
    return sendError(res, "Invalid query", "search must be a string", 400);
  }

  if (search && !searchAllowedPattern.test(search.trim())) {
    return sendError(res, "Invalid query", "search contains invalid characters", 400);
  }

  if (page && (!Number.isInteger(+page) || +page < 1)) {
    return sendError(res, "Invalid query", "page must be a positive integer", 400);
  }

  if (limit && (!Number.isInteger(+limit) || +limit < 1 || +limit > 100)) {
    return sendError(res, "Invalid query", "limit must be a positive integer up to 100", 400);
  }

  req.query.page = page ? parseInt(page, 10) : 1;
  req.query.limit = limit ? parseInt(limit, 10) : 10;
  req.query.search = search ? search.trim() : undefined;

  next();
};

export const validateUserIdParam = (req, res, next) => {
  const { id } = req.params;
  if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
    return sendError(res, "Invalid parameter", "Invalid user id", 400);
  }
  next();
};