// utils/sendMail.js
require('dotenv').config();
const SibApiV3Sdk = require('sib-api-v3-sdk');

const sendResetEmail = async (toEmail, resetLink) => {
  const client = SibApiV3Sdk.ApiClient.instance;
  const apiKey = client.authentications['api-key'];
  apiKey.apiKey = process.env.BREVO_API_KEY;

  const tranEmailApi = new SibApiV3Sdk.TransactionalEmailsApi();

  const sender = {
    email: 'manishsuthar.dev@gmail.com',
    name: 'EduConnect Hub'  
  };

  const receivers = [{ email: toEmail }];

  try {
    await tranEmailApi.sendTransacEmail({
      sender,
      to: receivers,
      subject: 'Reset Your EduConnect Password',
      htmlContent: `
        <p>Hi there,</p>
        <p>You requested a password reset. Click the link below to reset it:</p>
        <a href="${resetLink}">Reset Password</a>
        <p>This link will expire in 10 minutes.</p>
      `
    });

    console.log(`Reset email sent to ${toEmail}`);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

module.exports = sendResetEmail;
