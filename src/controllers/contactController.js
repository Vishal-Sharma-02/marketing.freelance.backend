import { sendEmail } from "../utils/emailService.js";
import { sendSuccess, sendError } from "../utils/response.js";

export const sendContactMessage = async (req, res) => {
  try {
    const { name, email, website, message } = req.body;

    if (!name || !email || !message) {
      return sendError(res, "Invalid request", "Name, email, and message are required.", 400);
    }

    const adminEmails = (process.env.ADMIN_EMAILS || "")
      .split(",")
      .map((e) => e.trim())
      .filter(Boolean);

    if (!adminEmails.length) {
      return sendError(res, "Configuration error", "No admin email configured", 500);
    }

    const html = `
      <h2>New Contact Form Message</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Website:</strong> ${website || "Not Provided"}</p>
      <p><strong>Message:</strong><br>${message}</p>
    `;

    for (const adminEmail of adminEmails) {
      await sendEmail(adminEmail, `New Contact Message from ${name}`, html);
    }

    return sendSuccess(res, "Message sent successfully", null, 200);
  } catch (err) {
    console.error("Contact API error:", err);
    return sendError(res, "Internal server error", err.message, 500);
  }
};
