const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { sequelize } = require('./models');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
// ─── CORS Configuration ───────────────────────────────────────
app.use(cors({
  origin: 'http://localhost:5173', // Your Vite frontend URL
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
// ─── Middleware ───────────────────────────────────────────────
app.use(express.json());
app.use(cors());

// ─── Health Check ─────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({ message: 'Croos API is running!' });
});

// ─── Routes ───────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// ─── Sync DB & Start ─────────────────────────────────────────
sequelize.sync({ alter: true })
  .then(() => {
    console.log('✅ Database connected & tables synced!');
    app.listen(3000, () => {
      console.log('🚀 Server running on http://localhost:3000');
    });
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err);
  });
