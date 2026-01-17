const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

/* AUTO ORDER ID */
async function getNextOrderId() {
  const orders = await Order.find({}, { orderId: 1 }).sort({ orderId: 1 });
  let expected = 1;
  for (const o of orders) {
    if (o.orderId !== expected) return expected;
    expected++;
  }
  return expected;
}

/* CREATE ORDER */
router.post('/', async (req, res) => {
  try {
    const {
      productName,
      productImage,
      quantity,
      totalPrice,
      email,
      phoneNumber,
      address,
      paymentImage,
    } = req.body;

    if (!email || !phoneNumber || !address) {
      return res.status(400).json({ message: 'Missing fields' });
    }

    const orderId = await getNextOrderId();

    const order = await Order.create({
      orderId,
      productName,
      productImage,
      quantity,
      totalPrice,
      email,
      phoneNumber,
      address,
      paymentImage,
    });

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: 'Order failed' });
  }
});

module.exports = router;
