const { Product } = require('../models');
const { Op } = require('sequelize');

// GET /api/products?page=1&limit=10&category=electronics
exports.getAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const category = req.query.category;

    // Build where clause for filtering
    const where = {};
    if (category) {
      where.category = category;
    }

    const { count, rows } = await Product.findAndCountAll({
      where,
      limit,
      offset,
      order: [['id', 'ASC']]
    });

    res.status(200).json({
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
      products: rows
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products.' });
  }
};

// POST /api/products — protected by JWT
exports.createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: error.errors.map(e => e.message) });
    }
    res.status(500).json({ error: 'Failed to create product.' });
  }
};

// POST /api/products/seed — load 20+ products at once
exports.seedProducts = async (req, res) => {
  try {
    const products = [
      { title: 'Laptop Pro 15"', price: 1299.99, category: 'electronics', stock: 15, description: 'High-performance laptop' },
      { title: 'Wireless Mouse', price: 29.99, category: 'electronics', stock: 50, description: 'Ergonomic wireless mouse' },
      { title: 'Mechanical Keyboard', price: 89.99, category: 'electronics', stock: 30, description: 'RGB mechanical keyboard' },
      { title: 'USB-C Hub', price: 45.00, category: 'electronics', stock: 40, description: '7-in-1 USB-C hub' },
      { title: 'Monitor 27"', price: 349.99, category: 'electronics', stock: 10, description: '4K IPS monitor' },
      { title: 'Webcam HD', price: 79.99, category: 'electronics', stock: 25, description: '1080p webcam' },
      { title: 'Headphones Pro', price: 199.99, category: 'electronics', stock: 20, description: 'Noise-cancelling headphones' },
      { title: 'SSD 1TB', price: 109.99, category: 'electronics', stock: 35, description: 'NVMe SSD drive' },
      { title: 'T-Shirt Classique', price: 19.99, category: 'clothing', stock: 100, description: 'Cotton t-shirt' },
      { title: 'Jeans Slim', price: 49.99, category: 'clothing', stock: 60, description: 'Classic slim jeans' },
      { title: 'Veste en Cuir', price: 149.99, category: 'clothing', stock: 15, description: 'Genuine leather jacket' },
      { title: 'Sneakers Sport', price: 89.99, category: 'clothing', stock: 45, description: 'Running sneakers' },
      { title: 'Casquette', price: 14.99, category: 'clothing', stock: 80, description: 'Sport cap' },
      { title: "Livre JavaScript", price: 39.99, category: 'books', stock: 25, description: 'Complete JS guide' },
      { title: 'Livre Node.js', price: 34.99, category: 'books', stock: 20, description: 'Node.js in action' },
      { title: 'Livre React', price: 44.99, category: 'books', stock: 18, description: 'React from scratch' },
      { title: 'Livre Algorithmes', price: 54.99, category: 'books', stock: 12, description: 'Algorithm design manual' },
      { title: 'Bureau Ergonomique', price: 299.99, category: 'furniture', stock: 8, description: 'Standing desk' },
      { title: 'Chaise Gaming', price: 249.99, category: 'furniture', stock: 10, description: 'Ergonomic gaming chair' },
      { title: 'Lampe de Bureau', price: 39.99, category: 'furniture', stock: 30, description: 'LED desk lamp' },
      { title: 'Tapis de Souris XL', price: 24.99, category: 'electronics', stock: 55, description: 'Extra large mouse pad' },
      { title: 'Câble HDMI 2m', price: 12.99, category: 'electronics', stock: 70, description: '4K HDMI cable' }
    ];

    await Product.bulkCreate(products, { ignoreDuplicates: true });
    res.status(201).json({ message: `${products.length} products seeded successfully!` });
  } catch (error) {
    res.status(500).json({ error: 'Seeding failed.', details: error.message });
  }
};
