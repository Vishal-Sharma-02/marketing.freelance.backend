import { sendEmail } from "../utils/emailService.js";
import { sendSuccess, sendError } from "../utils/response.js";

export const sendWebinarContactRequest = async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    const adminEmails = (process.env.ADMIN_EMAILS || "")
      .split(",")
      .map((e) => e.trim())
      .filter(Boolean);

    if (!adminEmails.length) {
      return sendError(res, "Configuration error", "No admin email configured", 500);
    }

    const html = `
      <h2>New Webinar Contact Request</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Message:</strong> ${message || "No message provided"}</p>
    `;

    for (const adminEmail of adminEmails) {
      await sendEmail(adminEmail, "New Webinar Request", html);
    }

    return sendSuccess(res, "Mail sent successfully", null, 200);
  } catch (err) {
    console.error("Webinar API error:", err);
    return sendError(res, "Email failed", err.message, 500);
  }
};
