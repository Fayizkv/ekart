var express = require('express');
var router = express.Router();
var User = require('../models/usermodel');
const products = require('../models/productmodel');
const Order = require('../models/orders');
const Coupons = require('../models/couponmodel');
var genBill = require('./createPdf');
const mongoose = require('mongoose');
const Razorpay = require('razorpay');
var dotenv = require('dotenv');

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

//razorpay
async function makePayment(amountToPay, orderId){
    dotenv.config();
    const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY,
        key_secret: process.env.KEY_SECRET
    });

    try{
        const options = {
            amount: amountToPay * 100,
            currency: 'INR',
            receipt: "order"+orderId
        };

        const razorPayOrder = await razorpay.orders.create(options);
        // console.log("Razorpay Order Created:", razorPayOrder);
        return razorPayOrder;
    }catch(error){
        console.log("error making payment", error);
        throw error;
    }

}
//purchase
async function purchase(req,res){
    const { productId, quantity, fullName, addressLine1, addressLine2, city, state, postalCode, country, paymentMethod, coupon } = req.body;

    const product = await products.findById(req.body.productId);
    const user = await User.findById(req.user.id);
    
    if (product.quantity < quantity) {
        return res.status(400).send("Not enough stock available.");
    }
    
    product.quantity -= quantity;
    await product.save();
    
    var totalAmount = product.prize * req.body.quantity;
    var amountToPay = totalAmount;
    
    if ( coupon ){

        const coup = await Coupons.findOne({ couponcode : coupon })

        if ( !coup ) { console.log("coupon code does not exist"); }
        else if ( user.coupons.includes(coup._id)) {
            console.log("coupon already used by user");
        }else
        {
            amountToPay -= coup.discount;
            user.coupons.push(coup._id);
        }

    }  

    
    
    const newOrder = new Order({
        user: req.user.id,
        products: [{ product: productId, quantity: quantity, price: product.prize }],
        totalAmount,
        shippingAddress: { fullName, addressLine1, addressLine2, city, state, postalCode, country },
        paymentDetails: { method: paymentMethod, paymentStatus: 'Pending' }
    });
    
    if ( paymentMethod === 'Razorpay'){
    const razorpayOrder = await makePayment(amountToPay, newOrder._id);
    newOrder.paymentDetails.transactionId = ""+razorpayOrder.id;

    await newOrder.save();

    res.render('razorpay', {
        orderId: razorpayOrder.id,
        amount: amountToPay * 100,
        currency: 'INR',
        purchaseOrder: newOrder._id,
    });
    }
    else{
    await newOrder.save();
   
    user.orders.push(newOrder._id);
    user.save();
    
    return newOrder._id;
    }
}

//purchase payment success
async function purchasePaymentSuccess(id, userId){
    var user = await User.findById(userId);
    user.orders.push(id);
    await user.save();
}

//purchase payment failure
async function purchasePaymentFailed(id){
    await Order.deleteById(id);
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

//checkout 
async function checkout(req){

    const session = await mongoose.startSession();
    session.startTransaction();

    const { fullName, addressLine1, addressLine2, city, state, postalCode, country, paymentMethod, coupon } = req.body;

    var amountToPay = 0;
    try {
        const user = await User.findById(req.user.id).populate('cart.product');

        const newOrders = [];

        for (const item of user.cart) {
            const product = item.product;
            
            if (product.quantity < item.quantity) {
                throw new Error(`Not enough stock for product: ${product.productname}`);
            }
            product.quantity -= item.quantity;
            if ( product.quantity < 0 ){
                return false;
            }
            await product.save({ session });

            const totalAmount = product.prize * item.quantity;
            amountToPay += totalAmount;

            const newOrder = new Order({
                user: req.user.id,
                products: [{
                    product: product._id,
                    quantity: item.quantity,
                    price: product.prize,
                }],
                totalAmount,
                shippingAddress: { fullName, addressLine1, addressLine2, city, state, postalCode, country },
                paymentDetails: { method: paymentMethod, paymentStatus: 'Pending' }
            });

            await newOrder.save({ session });
            user.orders.push(newOrder._id);
        }
        user.cart = [];
        await user.save({ session });

        await session.commitTransaction();
        session.endSession();

        if ( coupon ){

            const coup = await Coupons.findOne({ couponcode : coupon })
    
            if ( !coup ) { console.log("coupon code does not exist"); }
            else if ( user.coupons.includes(coup._id)) {
                console.log("coupon already used by user");
            }else
            {
                // console.log(amountToPay);
                amountToPay -= coup.discount;
                // console.log(amountToPay);
                // console.log (coup.discount);
                user.coupons.push(coup._id);
            }
    
        }

        await user.save();
        return true
    
    }catch(error){
        await session.abortTransaction();
        session.endSession();
        console.error(error);
        return false
    }


}

//edit cart
async function updateCart(req){

    const id = req.params.id;
    const { action } = req.body;
    const user = await User.findById(req.user.id);

    const cartItem = user.cart.find(item => item.product.toString() === id);

    if ( action === 'increase'){
        cartItem.quantity += 1;
    }
    if ( action === 'decrease'){
        cartItem.quantity -= 1;
      if (cartItem.quantity <= 0) {
        user.cart = user.cart.filter(item => item.product.toString() !== id);
      }
    }

    await user.save();
}


module.exports = { productView, favorites, cart, addFav, addCart, removeCart, buy, purchase, getBill, getOrders, checkout, updateCart, purchasePaymentSuccess, purchasePaymentFailed }