export const sendSuccess = (res, message, data = null, statusCode = 200) => {
  return res.status(statusCode).json({
    status: "success",
    message,
    data,
  });
};

export const sendError = (res, message, errors = null, statusCode = 500) => {
  return res.status(statusCode).json({
    status: "error",
    message,
    errors,
  });
};