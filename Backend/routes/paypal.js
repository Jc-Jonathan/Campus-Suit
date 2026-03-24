const express = require('express');
const router = express.Router();
const axios = require('axios');

console.log('PayPal routes loading...'); // Debug log
console.log('PAYPAL_CLIENT_ID:', process.env.PAYPAL_CLIENT_ID ? 'Set' : 'Missing');

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ 
    status: 'PayPal routes working',
    paypalConfigured: !!(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_SECRET)
  });
});

const getAccessToken = async () => {
  const response = await axios({
    url: `${process.env.PAYPAL_BASE_URL}/v1/oauth2/token`,
    method: 'post',
    auth: {
      username: process.env.PAYPAL_CLIENT_ID,
      password: process.env.PAYPAL_SECRET,
    },
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    data: 'grant_type=client_credentials',
  });

  return response.data.access_token;
};

// CREATE ORDER
router.post('/create-order', async (req, res) => {
  try {
    console.log('PayPal create-order endpoint hit'); // Debug log
    
    // Check if environment variables are set
    if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_SECRET) {
      console.error('PayPal credentials missing');
      return res.status(500).json({ 
        error: 'PayPal credentials not configured',
        details: 'PAYPAL_CLIENT_ID or PAYPAL_SECRET missing'
      });
    }

    const { amount } = req.body;
    console.log('Creating order for amount:', amount);

    const accessToken = await getAccessToken();

    const response = await axios({
      url: `${process.env.PAYPAL_BASE_URL}/v2/checkout/orders`,
      method: 'post',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      data: {
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: 'USD',
              value: amount,
            },
          },
        ],
        application_context: {
          return_url: 'https://campus-suit-szub.onrender.com/success',
          cancel_url: 'https://campus-suit-szub.onrender.com/cancel',
        },
      },
    });

    const approvalUrl = response.data.links.find(
      (link) => link.rel === 'approve'
    ).href;

    res.json({ url: approvalUrl });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

//Capture payment

router.post('/capture-order', async (req, res) => {
  try {
    const { orderId } = req.body;

    const accessToken = await getAccessToken();

    const response = await axios({
      url: `${process.env.PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}/capture`,
      method: 'post',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Capture failed' });
  }
});


module.exports = router;