import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,           // <-- NOW USING ENV
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,         // support@anaylixhub.in
    pass: process.env.SMTP_PASS,         // email password
  },
});

/* --------------------------------------------------
   SEND EMAIL FUNCTION
-------------------------------------------------- */
export const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: `AnaylixHub <${process.env.SMTP_FROM}>`,  // <-- FROM ENV NOW
      to,
      subject,
      html,
    });

    console.log("Email sent to:", to);
  } catch (err) {
    console.log("Email send error:", err);
  }
};
