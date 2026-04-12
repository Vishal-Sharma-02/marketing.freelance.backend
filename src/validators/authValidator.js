export const validateRegister = (req, res, next) => {
  const { fullName, emailId, password, mobile, state } = req.body;

  if (!fullName || !emailId || !password || !mobile || !state) {
    return res.status(400).json({
      status: "error",
      message: "All fields are required",
    });
  }

  next();
};

export const validateLogin = (req, res, next) => {
  
  const { emailId, password } = req.body;

  if (!emailId || !password) {
    return res.status(400).json({
      status: "error",
      message: "Email and password are required",
    });
  }

  next();
};

export const validateEmail = (req, res, next) => {
  const { emailId } = req.body;

  if (!emailId) {
    return res.status(400).json({
      status: "error",
      message: "Email is required",
    });
  }

  next();
};

export const validateEmailOtp = (req, res, next) => {
  const { emailId, otp } = req.body;

  if (!emailId || !otp) {
    return res.status(400).json({
      status: "error",
      message: "Email and OTP are required",
    });
  }

  next();
};

export const validateResetPassword = (req, res, next) => {
  const { emailId, newPassword } = req.body;

  if (!emailId || !newPassword) {
    return res.status(400).json({
      status: "error",
      message: "Email and new password are required",
    });
  }

  next();
};