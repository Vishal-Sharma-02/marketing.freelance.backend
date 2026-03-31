import jwt from "jsonwebtoken";
import User from "../models/user.js";

const userAuth = async (req, res, next) => {
  try {
    // 🔐 Get token from Authorization header only
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];

    // 🔍 Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 👤 Load user
    const user = await User.findById(decoded._id);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // ✅ Attach user to request
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};



export default userAuth;
