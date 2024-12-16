const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  productname: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  description: {
    type : String,
    required : true,
  },
  category: {
    type: String,
    required: true,
    lowercase: true,
  },
  subcategory: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    trim: true,
  },
  prize: {  
    type: Number,
    required: true,
    trim: true,
  },
  seller: {
    type: String,
  },
  brandname: {
    type: String,
    required: true,
    trim: true,
  },
  image: {
    type : String,
    required: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Product', productSchema);
