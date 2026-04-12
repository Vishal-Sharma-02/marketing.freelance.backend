import bcrypt from "bcrypt";
import { UAParser } from "ua-parser-js";
import User from "../models/user.js";
import { sendEmail } from "../utils/emailService.js";
import { welcomeEmail } from "../emails/welcomeEmail.js";
import { otpEmail } from "../emails/otpEmails.js";

const createSafeUser = (user) => ({
  _id: user._id,
  fullName: user.fullName,
  emailId: user.emailId,
  mobile: user.mobile,
  state: user.state,
  createdAt: user.createdAt,
});

const buildDeviceName = (userAgent) => {
  const parser = new UAParser(userAgent);
  const deviceInfo = parser.getResult();
  return `${deviceInfo.os.name || "Unknown OS"} - ${deviceInfo.browser.name || "Unknown Browser"}`;
};

export const registerUser = async (body, userAgent) => {
  const { fullName, emailId, password, mobile, state } = body;

  const existingUserMail = await User.findOne({ emailId: emailId.toLowerCase() });
  if (existingUserMail) {
    const error = new Error("User already exists with this email, Login!!");
    error.statusCode = 400;
    throw error;
  }

  const existingUserMobile = await User.findOne({ mobile });
  if (existingUserMobile) {
    const error = new Error("User already exists with this mobile number, Login!!");
    error.statusCode = 400;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const deviceName = buildDeviceName(userAgent);

  const newUser = await User.create({
    fullName,
    emailId: emailId.toLowerCase(),
    password: passwordHash,
    mobile,
    state,
    lastLogin: new Date(),
    loginHistory: [{ device: deviceName }],
  });

  const token = await newUser.getJWT();
  const safeUser = createSafeUser(newUser);

  sendEmail(safeUser.emailId, "Welcome to AnaylixHub 🎉", welcomeEmail(safeUser.fullName));

  return { user: safeUser, token };
};

export const loginUser = async (body, userAgent) => {
  const { emailId, password } = body;

  const user = await User.findOne({ emailId: emailId.toLowerCase() });
  if (!user) {
    const error = new Error("Invalid Credentials");
    error.statusCode = 400;
    throw error;
  }

  const isValid = await user.validatePassword(password);
  if (!isValid) {
    const error = new Error("Invalid Credentials");
    error.statusCode = 400;
    throw error;
  }

  const deviceName = buildDeviceName(userAgent);

  user.lastLogin = new Date();
  user.loginHistory.push({ device: deviceName });

  if (user.loginHistory.length > 5) {
    user.loginHistory.shift();
  }

  await user.save();

  const token = await user.getJWT();
  const safeUser = createSafeUser(user);

  return { user: safeUser, token };
};

export const forgotPassword = async (emailId) => {
  const user = await User.findOne({ emailId: emailId.toLowerCase() });
  if (!user) {
    const error = new Error("Email not found");
    error.statusCode = 400;
    throw error;
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  user.otp = otp;
  user.otpExpiresAt = Date.now() + 10 * 60 * 1000;
  await user.save();

  sendEmail(user.emailId, "Reset Your Password – OTP", otpEmail(user.fullName, otp));

  return { message: "OTP Sent Successfully" };
};

export const verifyOtp = async (emailId, otp) => {
  const user = await User.findOne({ emailId: emailId.toLowerCase() });
  if (!user) {
    const error = new Error("Email not found");
    error.statusCode = 400;
    throw error;
  }

  if (user.otp !== otp) {
    const error = new Error("Invalid OTP");
    error.statusCode = 400;
    throw error;
  }

  if (Date.now() > user.otpExpiresAt) {
    const error = new Error("OTP expired");
    error.statusCode = 400;
    throw error;
  }

  return { message: "OTP Verified Successfully" };
};

export const resetPassword = async (emailId, newPassword) => {
  const user = await User.findOne({ emailId: emailId.toLowerCase() });
  if (!user) {
    const error = new Error("Email not found");
    error.statusCode = 400;
    throw error;
  }

  user.password = await bcrypt.hash(newPassword, 10);
  user.otp = null;
  user.otpExpiresAt = null;
  await user.save();

  return { message: "Password Reset Successful" };
};