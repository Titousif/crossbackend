
const { Order, User, Product } = require('../models');
const sequelize = require('../config/database');

// POST /api/orders
// Body: { userId, items: [{productId, quantity}, ...] }
exports.createOrder = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
     const userId = req.user.id;  // Changed from req.body.userId
    const { items } = req.body;   // Only items from body

    // STEP 1: Validate input
    if (!items || !Array.isArray(items) || items.length === 0) {
      await transaction.rollback();
      return res.status(400).json({ error: 'Items array is required.' });
    }


    // STEP 2: Check user exists
    const user = await User.findByPk(userId);
    if (!user) {
      await transaction.rollback();
      return res.status(404).json({ error: 'User not found.' });
    }

    // STEP 3: Check stock for each product
    let totalPrice = 0;
    const productUpdates = [];

    for (const item of items) {
      const product = await Product.findByPk(item.productId, { transaction });

      if (!product) {
        await transaction.rollback();
        return res.status(404).json({ error: `Product with id ${item.productId} not found.` });
      }

      // CRITERION 5 — Stock check
      if (product.stock < item.quantity) {
        await transaction.rollback();
        return res.status(400).json({
          error: `Out of Stock: "${product.title}" only has ${product.stock} units left.`
        });
      }

      totalPrice += product.price * item.quantity;
      productUpdates.push({ product, quantity: item.quantity });
    }

    // STEP 4: Create the order
    const order = await Order.create({ userId, totalPrice }, { transaction });

    // STEP 5: Link products via OrderItems (Many-to-Many) and subtract stock
    for (const { product, quantity } of productUpdates) {
      await order.addProduct(product, {
        through: { quantity },
        transaction
      });

      // Subtract stock
      await product.update(
        { stock: product.stock - quantity },
        { transaction }
      );
    }

    await transaction.commit();

    // Return order with its items
    const result = await Order.findByPk(order.id, {
      include: [
        { model: User, attributes: ['name', 'email'] },
        { model: Product, attributes: ['id', 'title', 'price'] }
      ]
    });

    res.status(201).json(result);

  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ error: 'Server error during checkout.', details: error.message });
  }
};

// GET /api/orders
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [
        { model: User, attributes: ['name', 'email'] },
        { model: Product, attributes: ['id', 'title', 'price'] }
      ]
    });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders.' });
  }
};
