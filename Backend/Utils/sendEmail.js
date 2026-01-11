const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, text) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('Email configuration error: EMAIL_USER or EMAIL_PASS is not set in environment variables');
      throw new Error('Email service configuration is incomplete');
    }

    console.log(`Attempting to send email to: ${to}`);
    console.log(`Using email account: ${process.env.EMAIL_USER}`);
    
    // Create reusable transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        // Do not fail on invalid certs
        rejectUnauthorized: false
      }
    });

    // Convert plain text to HTML with better formatting
    const htmlText = text.split('\n').map(paragraph => 
      paragraph.trim() === '' ? '<br>' : `<p style="margin: 10px 0; line-height: 1.6;">${paragraph}</p>`
    ).join('');

    const mailOptions = {
      from: `"Campus Support Suit" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text, // plain text body
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <div style="background-color: #f8f9fa; padding: 15px; text-align: center; border-bottom: 1px solid #e0e0e0; margin-bottom: 20px;">
            <h2 style="color: #2c3e50; margin: 0;">Campus Support Suit</h2>
          </div>
          ${htmlText}
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #7f8c8d;">
            <p>This is an automated message, please do not reply directly to this email.</p>
            <p>&copy; ${new Date().getFullYear()} Campus Support Suit. All rights reserved.</p>
          </div>
        </div>
      `,
      // Set message headers
      headers: {
        'X-Laziness-level': '1000',
        'X-Mailer': 'Node.js/Nodemailer'
      }
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    if (error.response) {
      console.error('SMTP Error Response:', error.response);
    }
    throw error;
  }
};

module.exports = sendEmail;