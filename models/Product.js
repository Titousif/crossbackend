const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Title cannot be empty.' }
    }
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      min: { args: [0], msg: 'Price cannot be negative.' }
    }
  },
  description: {
    type: DataTypes.TEXT
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'general'
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isUrl: { msg: 'Image must be a valid URL.' }
    }
  },
  // Criterion 5 — stock management
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: { args: [0], msg: 'Stock cannot be negative.' }
    }
  }
});

module.exports = Product;
