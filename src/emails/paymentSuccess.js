export const paymentSuccessEmail = (name, orderId, amount) => `
  <div style="font-family: Arial; padding: 20px;">
    <h2>Payment Successful! 🎉</h2>

    <p>Hi ${name},</p>

    <p>Your payment has been successfully processed.</p>

    <h3>Payment Details:</h3>
    <ul>
      <li><strong>Order ID:</strong> ${orderId}</li>
      <li><strong>Amount Paid:</strong> ₹${amount / 100}</li>
      <li><strong>Status:</strong> Confirmed</li>
    </ul>

    <p>You now have full access to all premium content.</p>

    <br/>
    <strong>Enjoy learning with AnaylixHub! 🚀</strong>
  </div>
`;
