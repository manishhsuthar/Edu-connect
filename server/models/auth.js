require('dotenv').config();
const bcrypt = require('bcrypt');
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('./User');


// Import Brevo SDK
const SibApiV3Sdk = require('sib-api-v3-sdk');

// Configure Brevo
const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;

const sendResetEmail = async (email, link) => {
  const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

  const sendSmtpEmail = {
    to: [{ email }],
    sender: { email: process.env.SENDER_EMAIL, name: 'EduConnect' },
    subject: 'Reset your EduConnect password',
    htmlContent: `<p>Click <a href="${link}">here</a> to reset your password. This link expires in 15 minutes.</p>`
  };

  await apiInstance.sendTransacEmail(sendSmtpEmail);
};

// POST /forgot-password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  console.log("➡️ Forgot Password request received");
  console.log("Email:", email);

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    console.log("process.env.RESET_TOKEN_SECRET:", process.env.RESET_TOKEN_SECRET);
    console.log("RESET_TOKEN_SECRET:", process.env.RESET_TOKEN_SECRET);

    const token = jwt.sign({ id: user._id }, process.env.RESET_TOKEN_SECRET, { expiresIn: '15m' });
    const link = `${process.env.CLIENT_URL}/reset-password.html?token=${token}`;

    console.log("Sending reset to:", email);
    console.log("Reset Link:", link);

    await sendResetEmail(email, link);

  } catch (err) {
    console.error('Error sending email:', err.message);
    res.status(500).json({ message: 'Failed to send reset email. Please try again.' });
  }
});

// POST /reset-password/:token
router.post('/reset-password/:token', async (req, res) =>  {
  const { token } = req.params;
  const { password } = req.body;

  try {
    console.log("Received token param:", token);
    // Debug log
    console.log("RESET_TOKEN_SECRET:", process.env.RESET_TOKEN_SECRET);

    const decoded = jwt.verify(token, process.env.RESET_TOKEN_SECRET);
    console.log("Decoded token:", decoded);
    const userId = decoded.id;
    console.log("User ID from token:", userId);

    const user = await User.findById(userId);
    if (!user) {
      console.log("User not found for ID:", userId);
      return res.status(404).json({ message: 'User not found' });
    }
    console.log("User found:", user.email);

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();
    console.log("User password updated and saved:", user.email);

    console.log('Password reset successful for user:', user.email);
    res.json({ message: 'Password reset successful' });
  } catch (err)  {
    console.error('Error in reset-password:', err && err.stack ? err.stack : err);

    res.status(400).json({ message: 'Invalid or expired token' });
  }
});

module.exports = router;
