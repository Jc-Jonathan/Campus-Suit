const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

async function getNextProductId() {
  const products = await Product.find({}, { productId: 1, _id: 0 })
    .sort({ productId: 1 });

  let expectedId = 1;

  for (const p of products) {
    if (p.productId !== expectedId) {
      return expectedId; // gap found
    }
    expectedId++;
  }

  return expectedId; // no gaps, return next number
}

router.post('/add', async (req, res) => {
  try {
    const { name, description, imageUrl, newPrice, oldPrice } = req.body;

    if (!name || !description || !imageUrl || !newPrice) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const productId = await getNextProductId();

    const product = new Product({
      productId,
      name,
      description,
      imageUrl,
      newPrice,
      oldPrice,
    });

    await product.save();

    res.status(201).json({
      message: 'Product added successfully',
      product,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});


router.get('/', async (req, res) => {
  try {
    const products = await Product.find().sort({ productId: 1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// UPDATE PRODUCT
router.put('/:productId', async (req, res) => {
  try {
    const productId = Number(req.params.productId);
    const { name, description, imageUrl, newPrice, oldPrice } = req.body;

    const updated = await Product.findOneAndUpdate(
      { productId },
      { name, description, imageUrl, newPrice, oldPrice },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({
      message: 'Product updated successfully',
      product: updated,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});



router.delete('/:productId', async (req, res) => {
  try {
    const productId = Number(req.params.productId);

    const deleted = await Product.findOneAndDelete({ productId });

    if (!deleted) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
