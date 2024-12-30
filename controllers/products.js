var express = require('express');
var router = express.Router();
var User = require('../models/usermodel');
const products = require('../models/productmodel');
const Order = require('../models/orders');
var genBill = require('./createPdf');
var connectDB = require('./mongo');

//view product details
async function productView(id){

    var product = await products.findById(id);
    return product;
}

//view favorited products
async function favorites(id){

    const user = await User.findById(id).populate('favorites');
    const products = await user.favorites;

    return products;
}

//view cart items
async function cart(id){

    const user = await User.findById(id).populate('cart.product');
    const cartItems = await user.cart;

    return cartItems;
}

//add remove from fav
async function addFav(req){
    const user = await User.findById(req.user.id);

    if (!user.favorites) {
        user.favorites = [];
    }
    const isFav = await user.favorites.includes(req.body.productId);

    if (isFav) {
        user.favorites = await user.favorites.filter(
            (id) => id.toString() !== req.body.productId
        );
        console.log("Product removed from favorites succesfully");
        await user.save();

    }
    else {
        await user.favorites.push(req.body.productId);
        console.log("Product added to favorites succesfully");
        await user.save();
    }
    
}

//add to cart
async function addCart(req){
    
    const user = await User.findById(req.user.id);
    const productId = req.body.productId;
    const quantity = req.body.quantity || 1;

    if (!user.cart) {
        user.cart = [];
    };

    const existingCartItem = user.cart.find(item => item.product && item.product.toString() === productId);

    if (existingCartItem) {
        // If product exists, update the quantity
        existingCartItem.quantity += quantity;
        console.log("Product quantity updated in cart");
    } else {
        user.cart.push({ product: productId, quantity });
        console.log("Product added to cart successfully");
    }
    await user.save();
    
}

//remove from cart
async function removeCart(req){

    const productId = req.params.productId;

    const user = await User.findById(req.user.id);
    user.cart = user.cart.filter(item => item.product.toString() !== productId);

    await user.save();

    console.log("Product removed from cart");
}

//buy prdct
async function buy(id){
    const product = await products.findById(id);
    return product;
}
//purchase
async function purchase(req){
    const { productId, quantity, fullName, addressLine1, addressLine2, city, state, postalCode, country, paymentMethod } = req.body;

    const product = await products.findById(req.body.productId);

    if (product.quantity < quantity) {
        return res.status(400).send("Not enough stock available.");
    }

    product.quantity -= quantity;
    await product.save();

    const totalAmount = product.prize * req.body.quantity;

    const newOrder = new Order({
        user: req.user.id,
        products: [{ product: productId, quantity: quantity, price: product.prize }],
        totalAmount,
        shippingAddress: { fullName, addressLine1, addressLine2, city, state, postalCode, country },
        paymentDetails: { method: paymentMethod, paymentStatus: 'Pending' }
    });

    await newOrder.save();

    const user = await User.findById(req.user.id);
    user.orders.push(newOrder._id);
    user.save();

    const order = await Order.findById(newOrder._id).populate('user products.product');

    return order;
}

//getbill
async function getBill(id,res){
    const order = await Order.findById(id).populate('user products.product');
    genBill(order,res);   
}

//get orders
async function getOrders(id){
    var userOrders = await User.findById(id).populate({
        path: 'orders',
        populate: {
            path: 'products.product', // Populate product details
            model: 'Product',
        },
    });

    var orders = userOrders.orders;
    return orders;
}

module.exports = { productView, favorites, cart, addFav, addCart, removeCart, buy, purchase, getBill, getOrders }