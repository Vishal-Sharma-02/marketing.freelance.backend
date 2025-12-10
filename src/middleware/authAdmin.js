 const authAdmin = (req, res, next) => {
  try {
    const adminEmails = process.env.ADMIN_EMAILS
      ? process.env.ADMIN_EMAILS.split(",")
      : [process.env.ADMIN_EMAIL];
    
    if (!req.user || !adminEmails.includes(req.user.emailId)) {
      return res.status(403).json({
        message: "Access denied. Only admin users are allowed.",
      });
    }
       
    next();
  } catch (err) {
    res.status(500).json({ message: "Authorization error" });
  }
};

export default authAdmin;