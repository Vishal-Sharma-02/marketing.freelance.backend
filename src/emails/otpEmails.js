export const otpEmail = (name, otp) => `
  <div style="font-family: Arial; padding: 20px;">
    <h2>Hello ${name},</h2>
    <p>Your OTP for password reset is:</p>

    <h1 style="font-size: 32px; letter-spacing: 3px;">${otp}</h1>

    <p>This OTP is valid for <strong>10 minutes</strong>.</p>

    <br/>
    <strong>— AnaylixHub Security Team</strong>
  </div>
`;
