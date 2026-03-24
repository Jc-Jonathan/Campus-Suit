const SibApiV3Sdk = require('sib-api-v3-sdk');

const sendEmail = async (to, subject, text) => {
  try {
    console.log('🔍 Checking Brevo configuration...');
    console.log('API Key exists:', !!process.env.BREVO_API_KEY);
    console.log('API Key length:', process.env.BREVO_API_KEY?.length || 0);
    console.log('Sender Email:', process.env.BREVO_SENDER_EMAIL);
    
    if (!process.env.BREVO_API_KEY) {
      console.error('❌ Brevo API key not set in environment');
      throw new Error('Brevo API key not set');
    }

    if (!process.env.BREVO_SENDER_EMAIL) {
      console.error('❌ Brevo sender email not set in environment');
      throw new Error('Brevo sender email not set');
    }

    // Configure Brevo
    const client = SibApiV3Sdk.ApiClient.instance;
    client.authentications['api-key'].apiKey = process.env.BREVO_API_KEY;

    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

    const sendSmtpEmail = {
      sender: {
        email: process.env.BREVO_SENDER_EMAIL,
        name: process.env.BREVO_SENDER_NAME || 'Campus Support Suit',
      },
      to: [{ email: to }],
      subject,
      htmlContent: `
        <div style="font-family: Arial; padding:20px">
          <h2>${process.env.BREVO_SENDER_NAME || 'Campus Support Suit'}</h2>
          <p>${text.replace(/\n/g, '<br>')}</p>
          <hr/>
          <small>This is an automated message.</small>
        </div>
      `,
    };

    console.log('📤 Sending email via Brevo with data:', {
      to,
      subject: subject?.substring(0, 50) + '...',
      sender: process.env.BREVO_SENDER_EMAIL
    });

    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('✅ Email sent successfully via Brevo:', result.messageId);
    return { success: true, messageId: result.messageId, service: 'brevo' };

  } catch (error) {
    console.error('❌ Brevo email error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      status: error.status,
      response: error.response?.data
    });
    throw error;
  }
};

module.exports = sendEmail;