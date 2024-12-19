const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address'],
  },
  password: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    match: [/^\d{10,15}$/, 'Please use a valid phone number'], //phone validation
  },
  favorites: [
    {
      type: mongoose.Schema.Types.ObjectId, // References a Product ID
      ref: 'Product', // Reference to the Product model
    },
  ],
  cart: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId, // References a Product ID
        ref: 'Product', // Reference to the Product model
      },
      quantity: {
        type: Number,
        required: true,
        default: 1, // Default quantity is 1
        min: 1,
      },
    },
  ],
  orders: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order', // Reference to the Order model
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('User', userSchema);
