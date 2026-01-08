import express from "express";
import bcrypt from "bcrypt";
import User from "../models/user.js";
import { sendEmail } from "../utils/emailService.js";
import { welcomeEmail } from "../emails/welcomeEmail.js";
import { otpEmail } from "../emails/otpEmails.js";
import {UAParser} from "ua-parser-js";

const authRouter = express.Router();

const isProduction = process.env.NODE_ENV === "production";

/** -------------------------------------
 * COOKIE OPTIONS (WORKS IN LOCAL + PROD)
 * --------------------------------------*/
const cookieOptions = {
  httpOnly: true,
  secure: isProduction,               // Must be false on localhost
  sameSite: isProduction ? "none" : "lax",
  path: "/",
  maxAge: 1000 * 60 * 60 * 24 * 30,    // 7 days
};

/** -------------------------------------
 *  REGISTER USER
 * --------------------------------------*/
authRouter.post("/auth/register", async (req, res) => {
  try {
    const { fullName, emailId, password, mobile, state } = req.body;

    if (!fullName || !emailId || !password || !mobile || !state) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUserMail = await User.findOne({ emailId: emailId.toLowerCase() });
    if (existingUserMail) {
      return res.status(400).json({ message: "User already exists with this email, Login!!" });
    }
    const existingUserMobile = await User.findOne({ mobile: mobile });
    if (existingUserMobile) {
      return res.status(400).json({ message: "User already exists with this mobile number, Login!!" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const parser = new UAParser(req.headers["user-agent"]);
const deviceInfo = parser.getResult();

const deviceName = `${deviceInfo.os.name || "Unknown OS"} - ${deviceInfo.browser.name || "Unknown Browser"}`;

    const newUser = await User.create({
      fullName,
      emailId: emailId.toLowerCase(),
      password: passwordHash,
      mobile,
      state,
      lastLogin: new Date(),
      loginHistory: [
        {
          device: deviceName
        }
      ]
    });    

    const token = await newUser.getJWT();
    res.cookie("token", token, cookieOptions);

    const safeUser = {
      _id: newUser._id,
      fullName: newUser.fullName,
      emailId: newUser.emailId,
      mobile: newUser.mobile,
      state: newUser.state,
      createdAt: newUser.createdAt,
    };
    
 sendEmail(
  safeUser.emailId,
  "Welcome to AnaylixHub 🎉",
  welcomeEmail(safeUser.fullName)
); 

    res.status(201).json({
      message: "User registered successfully",
      user: safeUser,
      token
    });

  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

/** -------------------------------------
 *  LOGIN USER
 * --------------------------------------*/
authRouter.post("/auth/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;

    const user = await User.findOne({ emailId: emailId.toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    const isValid = await user.validatePassword(password);
    if (!isValid) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    const parser = new UAParser(req.headers["user-agent"]);
const deviceInfo = parser.getResult();

const deviceName = `${deviceInfo.os.name || "Unknown OS"} - ${
  deviceInfo.browser.name || "Unknown Browser"
}`;

user.lastLogin = new Date();
user.loginHistory.push({ device: deviceName });

if (user.loginHistory.length > 5) {
  user.loginHistory.shift();
}

await user.save();

    const token = await user.getJWT();

    res.cookie("token", token, cookieOptions);
 
    const safeUser = {
      _id: user._id,
      fullName: user.fullName,
      emailId: user.emailId,
      mobile: user.mobile,
      state: user.state,
      createdAt: user.createdAt,
    };
    
    console.log("Login Successful: ", safeUser.emailId);
    res.status(200).json({
      message: "Login successful",
      user: safeUser,
      token
    });


  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

/** -------------------------------------
 *  LOGOUT USER
 * --------------------------------------*/
authRouter.get("/auth/logout", (req, res) => {
  try {
    res.clearCookie("token", {
      ...cookieOptions,
      maxAge: 0,
    });

    res.status(200).json({
      message: "Logged out successfully",
    });
  } catch (err) {
    res.status(500).json({
      message: "Logout failed",
      error: err.message,
    });
  }
});


//forget password api:

authRouter.post("/auth/forgot-password", async (req, res) => {
  try {
    const { emailId } = req.body;

    const user = await User.findOne({ emailId: emailId.toLowerCase() });
    if (!user) return res.status(400).json({ message: "Email not found" });

    // generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.otp = otp;
    user.otpExpiresAt = Date.now() + 10 * 60 * 1000; // 10 min

    await user.save();

    // send email
    sendEmail(
      user.emailId,
      "Reset Your Password – OTP",
      otpEmail(user.fullName, otp)
    );

    res.json({ message: "OTP Sent Successfully" });

  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

authRouter.post("/auth/verify-otp", async (req, res) => {
  try {
    const { emailId, otp } = req.body;

    const user = await User.findOne({ emailId: emailId.toLowerCase() });
    if (!user) return res.status(400).json({ message: "Email not found" });

    if (user.otp !== otp)
      return res.status(400).json({ message: "Invalid OTP" });

    if (Date.now() > user.otpExpiresAt)
      return res.status(400).json({ message: "OTP expired" });

    // OTP correct
    res.json({ message: "OTP Verified Successfully" });

  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

authRouter.post("/auth/reset-password", async (req, res) => {
  try {
    const { emailId, newPassword } = req.body;

    const user = await User.findOne({ emailId: emailId.toLowerCase() });
    if (!user) return res.status(400).json({ message: "Email not found" });

    // reset password
    const hashed = await bcrypt.hash(newPassword, 10);

    user.password = hashed;
    user.otp = null;
    user.otpExpiresAt = null;

    await user.save();

    res.json({ message: "Password Reset Successful" });

  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

authRouter.get("/health", (req, res) => {
  res.status(200).send("OK");
});

export default authRouter;