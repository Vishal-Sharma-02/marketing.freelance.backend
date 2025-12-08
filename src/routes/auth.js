import express from "express";
import bcrypt from "bcrypt";
import User from "../models/user.js";

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
  maxAge: 1000 * 60 * 60 * 24 * 7,    // 7 days
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

    const existingUser = await User.findOne({ emailId: emailId.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      fullName,
      emailId: emailId.toLowerCase(),
      password: passwordHash,
      mobile,
      state,
    });

    const token = await newUser.getJWT();
    res.cookie("token", token, cookieOptions);

    const safeUser = newUser.toObject();
    delete safeUser.password;

    // 👇 FIXED: return in same way as login
    res.status(201).json({
      message: "User registered successfully",
      user: safeUser,
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

    const token = await user.getJWT();

    res.cookie("token", token, cookieOptions);

    const safeUser = user.toObject();
    delete safeUser.password;

    res.status(200).json({
      message: "Login successful",
      user: safeUser,
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
    res.cookie("token", "", {
      ...cookieOptions,
      maxAge: 0,
    });

    res.status(200).json({ message: "Logged out successfully" });

  } catch (err) {
    res.status(500).json({ message: "Logout failed", error: err.message });
  }
});

export default authRouter;
