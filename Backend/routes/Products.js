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
    const {
      name,
      productType,
      productBrand,
      description,
      imageUrl,
      newPrice,
      oldPrice,
    } = req.body;

    if (
      !name ||
      !productType ||
      !productBrand ||
      !description ||
      !imageUrl ||
      !newPrice
    ) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const productId = await getNextProductId();

    const product = new Product({
      productId,
      name,
      productType,
      productBrand,
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


//GET ALL PRODUCT TYPES
router.get('/filters/types', async (req, res) => {
  try {
    const types = await Product.distinct('productType');
    res.json(types);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET ALL PRODUCT BRANDS
router.get('/filters/brands', async (req, res) => {
  try {
    const brands = await Product.distinct('productBrand');
    res.json(brands);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// FILTER PRODUCTS
router.get('/filter', async (req, res) => {
  try {
    const { type, brand, search } = req.query;

    const query = {};

    if (type) query.productType = type;
    if (brand) query.productBrand = brand;
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const products = await Product.find(query).sort({ productId: 1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// UPDATE PRODUCT
router.put('/:productId', async (req, res) => {
  try {
    console.log('UPDATE BODY:', req.body); // 👈 ADD THIS

    const productId = Number(req.params.productId);
    const { name, productType, productBrand, description, imageUrl, newPrice, oldPrice } = req.body;

    const updated = await Product.findOneAndUpdate(
      { productId },
      { name, productType, productBrand, description, imageUrl, newPrice, oldPrice },
      { new: true }
    );

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});
// GET SINGLE PRODUCT
router.get('/:productId', async (req, res) => {
  try {
    const productId = Number(req.params.productId);

    const product = await Product.findOne({ productId });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});
//DELETE PRODUCT
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
