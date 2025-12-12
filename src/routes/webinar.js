import express from "express";
import { sendEmail } from "../utils/emailService.js";  // adjust path if needed

const webinarRouter = express.Router();

webinarRouter.post("/webinar/contact", async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    const html = `
      <h2>New Webinar Contact Request</h2>

      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Message:</strong> ${message || "No message provided"}</p>
    `;

    const adminEmails = process.env.ADMIN_EMAILS
      .split(",")
      .map((e) => e.trim());
    
    // Your website email receives this
    await sendEmail(adminEmails, "New Webinar Request", html);

    res.json({ success: true, message: "Mail sent successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Email failed" });
  }
});

export default webinarRouter;
