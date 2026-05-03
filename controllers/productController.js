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

// GET /api/products/:id
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch product.' });
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
      { title: 'Laptop Pro 15"', image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80', price: 1299.99, category: 'electronics', stock: 15, description: 'High-performance laptop' },
      { title: 'Wireless Mouse', image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80', price: 29.99, category: 'electronics', stock: 50, description: 'Ergonomic wireless mouse' },
      { title: 'Mechanical Keyboard', image: 'https://images.unsplash.com/photo-1512446733611-9099a758e4f0?auto=format&fit=crop&w=800&q=80', price: 89.99, category: 'electronics', stock: 30, description: 'RGB mechanical keyboard' },
      { title: 'USB-C Hub', image: 'https://images.unsplash.com/photo-1555617117-08cd8a8db308?auto=format&fit=crop&w=800&q=80', price: 45.00, category: 'electronics', stock: 40, description: '7-in-1 USB-C hub' },
      { title: 'Monitor 27"', image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80', price: 349.99, category: 'electronics', stock: 10, description: '4K IPS monitor' },
      { title: 'Webcam HD', image: 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=crop&w=800&q=80', price: 79.99, category: 'electronics', stock: 25, description: '1080p webcam' },
      { title: 'Headphones Pro', image: 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=crop&w=800&q=80', price: 199.99, category: 'electronics', stock: 20, description: 'Noise-cancelling headphones' },
      { title: 'SSD 1TB', image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80', price: 109.99, category: 'electronics', stock: 35, description: 'NVMe SSD drive' },
      { title: 'T-Shirt Classique', image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=800&q=80', price: 19.99, category: 'clothing', stock: 100, description: 'Cotton t-shirt' },
      { title: 'Jeans Slim', image: 'https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=800&q=80', price: 49.99, category: 'clothing', stock: 60, description: 'Classic slim jeans' },
      { title: 'Veste en Cuir', image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=800&q=80', price: 149.99, category: 'clothing', stock: 15, description: 'Genuine leather jacket' },
      { title: 'Sneakers Sport', image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=800&q=80', price: 89.99, category: 'clothing', stock: 45, description: 'Running sneakers' },
      { title: 'Casquette', image: 'https://images.unsplash.com/photo-1520975696195-3a1bdf49f828?auto=format&fit=crop&w=800&q=80', price: 14.99, category: 'clothing', stock: 80, description: 'Sport cap' },
      { title: "Livre JavaScript", image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80', price: 39.99, category: 'books', stock: 25, description: 'Complete JS guide' },
      { title: 'Livre Node.js', image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80', price: 34.99, category: 'books', stock: 20, description: 'Node.js in action' },
      { title: 'Livre React', image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80', price: 44.99, category: 'books', stock: 18, description: 'React from scratch' },
      { title: 'Livre Algorithmes', image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80', price: 54.99, category: 'books', stock: 12, description: 'Algorithm design manual' },
      { title: 'Bureau Ergonomique', image: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=800&q=80', price: 299.99, category: 'furniture', stock: 8, description: 'Standing desk' },
      { title: 'Chaise Gaming', image: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=800&q=80', price: 249.99, category: 'furniture', stock: 10, description: 'Ergonomic gaming chair' },
      { title: 'Lampe de Bureau', image: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=800&q=80', price: 39.99, category: 'furniture', stock: 30, description: 'LED desk lamp' },
      { title: 'Tapis de Souris XL', image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80', price: 24.99, category: 'electronics', stock: 55, description: 'Extra large mouse pad' },
      { title: 'Câble HDMI 2m', image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80', price: 12.99, category: 'electronics', stock: 70, description: '4K HDMI cable' }
    ];

    await Product.bulkCreate(products, { ignoreDuplicates: true });
    res.status(201).json({ message: `${products.length} products seeded successfully!` });
  } catch (error) {
    res.status(500).json({ error: 'Seeding failed.', details: error.message });
  }
};
