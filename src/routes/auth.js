import express from "express";
import User from "../models/user.js";
import bcrypt from "bcrypt";

const authRouter = express.Router();

// Detect environment
const isProduction = process.env.NODE_ENV === "production";

// Helper: cookie options for secure environments
const cookieOptions = {
  httpOnly: true,
  secure: isProduction,               // HTTPS only in prod
  sameSite: isProduction ? "none" : "lax", 
  path: "/",
  expires: new Date(Date.now() + 3600000), // 1 hour
};

/* ------------------------------
   REGISTER USER
-------------------------------- */
authRouter.post("/auth/register", async (req, res) => {
  try {
    const { fullName, sponserName, sponserId, emailId, password, mobile, state, packages } = req.body;

    if (!fullName || !emailId || !password || !mobile || !state || !packages) {
      return res.status(400).json({ message: "All * fields are required" });
    }

    const existingUser = await User.findOne({ emailId: emailId.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = new User({
      fullName,
      sponserName,
      sponserId,
      emailId: emailId.toLowerCase(),
      password: passwordHash,
      mobile,
      state,
      packages,
    });

    const savedUser = await newUser.save();

    // Issue token
    const token = await savedUser.getJWT();

    // Set cookie based on environment
    res.cookie("token", token, cookieOptions);

    return res.status(201).json({
      message: "User Registered Successfully",
      data: savedUser,
    });

  } catch (err) {
    return res.status(500).json({
      message: "Server Error",
      error: err.message
    });
  }
});


/* ------------------------------
   LOGIN USER
-------------------------------- */
authRouter.post("/auth/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;

    const isUser = await User.findOne({ emailId: emailId.toLowerCase() });
    if (!isUser) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    const isPasswordValid = await isUser.validatePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    const token = await isUser.getJWT();

    // Write cookie
    res.cookie("token", token, cookieOptions);

    return res.status(200).json(isUser);

  } catch (err) {
    return res.status(500).json({
      message: "Server Error",
      error: err.message
    });
  }
});


/* ------------------------------
   LOGOUT USER
-------------------------------- */
authRouter.get("/auth/logout", async (req, res) => {
  try {
    res.cookie("token", "", {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      path: "/",
      expires: new Date(0), // immediately expire
    });

    return res.status(200).json({ message: "Logged out successfully" });

  } catch (err) {
    return res.status(500).json({ message: "Logout failed", error: err.message });
  }
});

export default authRouter;
