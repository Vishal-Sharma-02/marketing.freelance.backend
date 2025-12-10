import express from "express";
import { sendEmail } from "../utils/emailService.js";

const router = express.Router();

router.post("/send", async (req, res) => {
  try {
    const { name, email, website, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ 
        success: false, 
        error: "Name, email, and message are required." 
      });
    }

    // Convert ADMIN_EMAILS string → array
    const adminEmails = process.env.ADMIN_EMAILS
      .split(",")
      .map((e) => e.trim());

    const html = `
      <h2>New Contact Form Message</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Website:</strong> ${website || "Not Provided"}</p>
      <p><strong>Message:</strong><br>${message}</p>
    `;

    // Send email to all admin emails
    for (const adminEmail of adminEmails) {
      await sendEmail(
        adminEmail,
        `New Contact Message from ${name}`,
        html
      );
    }

    res.status(200).json({
      success: true,
      message: "Message sent successfully!",
    });

  } catch (err) {
    console.error("Contact API error:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

export default router;
