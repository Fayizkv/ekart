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
async function productView(id) {

    var product = await products.findById(id);
    return product;
}

//view favorited products
async function favorites(id) {

    const user = await User.findById(id).populate('favorites');
    const products = await user.favorites;

    return products;
}

//view cart items
async function cart(id) {

    const user = await User.findById(id).populate('cart.product');
    const cartItems = await user.cart;

    return cartItems;
}

//add remove from fav
async function addFav(id, productId) {
    const user = await User.findById(id);

    if (!user.favorites) {
        user.favorites = [];
    }
    const isFav = await user.favorites.includes(productId);

    if (isFav) {
        user.favorites = await user.favorites.filter(
            (id) => id.toString() !== productId
        );
        console.log("Product removed from favorites succesfully");
        await user.save();
        return false;

    }
    else {
        await user.favorites.push(productId);
        console.log("Product added to favorites succesfully");
        await user.save();
        return true;
    }

}

//add to cart
async function addCart(id, productId) {

    const user = await User.findById(id);
    const quantity = 1;

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
async function removeCart(req) {

    const productId = req.params.productId;

    const user = await User.findById(req.user.id);
    user.cart = user.cart.filter(item => item.product.toString() !== productId);

    await user.save();

    console.log("Product removed from cart");
}

//buy prdct
async function buy(id) {
    const product = await products.findById(id);
    return product;
}

//razorpay
async function makePayment(amountToPay, orderId) {
    dotenv.config();
    const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY,
        key_secret: process.env.KEY_SECRET
    });

    try {
        const options = {
            amount: amountToPay * 100,
            currency: 'INR',
            receipt: "order" + orderId
        };

        const razorPayOrder = await razorpay.orders.create(options);
        // console.log("Razorpay Order Created:", razorPayOrder);
        return razorPayOrder;
    } catch (error) {
        console.log("error making payment", error);
        throw error;
    }

}
//purchase
async function purchase(req, res) {
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

    if (coupon) {

        const coup = await Coupons.findOne({ couponcode: coupon })

        if (!coup) { console.log("coupon code does not exist"); }
        else if (user.coupons.includes(coup._id)) {
            console.log("coupon already used by user");
        } else {
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

    if (paymentMethod === 'Razorpay') {
        const razorpayOrder = await makePayment(amountToPay, newOrder._id);
        newOrder.paymentDetails.transactionId = "" + razorpayOrder.id;

        await newOrder.save();

        res.render('razorpay', {
            orderId: razorpayOrder.id,
            amount: amountToPay * 100,
            currency: 'INR',
            purchaseOrder: newOrder._id,
            amountToPay: amountToPay
        });
    }
    else {
        await newOrder.save();

        user.orders.push(newOrder._id);
        user.save();

        return newOrder._id;
    }
}

//purchase payment success
async function purchasePaymentSuccess(id, userId) {
    var user = await User.findById(userId);
    user.orders.push(id);
    await user.save();
}

//purchase payment failure
async function purchasePaymentFailed(id) {
    await Order.deleteById(id);
}

//getbill
async function getBill(id, res) {
    const order = await Order.findById(id).populate('user products.product');
    genBill(order, res);
}

//get orders
async function getOrders(id) {
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
async function checkout(req) {

    const session = await mongoose.startSession();
    session.startTransaction();

    const { fullName, addressLine1, addressLine2, city, state, postalCode, country, paymentMethod } = req.body;
    var transactionId = "Cash on delivery";
    var status = 'Pending';
    if (  paymentMethod == "Razorpay")
    {
        transactionId = req.body.transactionId;
        status = 'paid';
        
    }
    const coupon = req.body.coupon;
    

    try {
        // Fetch user with populated cart
        const user = await User.findById(req.user.id).populate('cart.product');

        // Total amount for the entire order
        let totalOrderAmount = 0;

        // Process each item in the user's cart
        for (const item of user.cart) {
            const product = item.product;

            // Check stock availability
            if (product.quantity < item.quantity) {
                throw new Error(`Not enough stock for product: ${product.productname}`);
            }

            // Update product quantity
            product.quantity -= item.quantity;
            await product.save({ session });

            const amountToPay = product.prize * item.quantity;

            // Create a new order
        const newOrder = new Order({
            user: req.user.id,
            products: [{
                product: item.product._id,
                quantity: item.quantity,
                price: item.product.prize,
            }],
            totalAmount: amountToPay,
            shippingAddress: { fullName, addressLine1, addressLine2, city, state, postalCode, country },
            paymentDetails: { method: paymentMethod, paymentStatus: status, transactionId: transactionId }
        });
        user.orders.push(newOrder._id);

        await newOrder.save({ session });
            // Calculate total for this product and add to order amount
            totalOrderAmount += product.prize * item.quantity;
        }

        if (coupon) {

            const coup = await Coupons.findOne({ couponcode: coupon })

            if (!coup) { console.log("coupon code does not exist"); }
            else if (user.coupons.includes(coup._id)) {
                console.log("coupon already used by user");
            } else {
                totalOrderAmount -= coup.discount;
                user.coupons.push(coup._id);
            }
        }

        // Add order to user and clear the cart
        
        user.cart = [];
        await user.save({ session });

        // Commit transaction
        await session.commitTransaction();
        session.endSession();

        return true;

    } catch (error) {
        // Abort transaction and log error
        await session.abortTransaction();
        session.endSession();
        console.error("Checkout error:", error.message);

        return false;
    }
}

// to proceed checkout
async function proceedCheckout(req, res) {
    var amountToPay = 0;
    var coupon = req.body.coupon;
    try {
        const user = await User.findById(req.user.id).populate('cart.product').exec();

            amountToPay = user?.cart?.reduce((sum, item) =>
            sum + (item.product?.prize || 0) * item.quantity, 0);

        if (coupon) {

            const coup = await Coupons.findOne({ couponcode: coupon })

            if (!coup) { console.log("coupon code does not exist"); }
            else if (user.coupons.includes(coup._id)) {
                console.log("coupon already used by user");
            } else {
                amountToPay -= coup.discount;
                user.coupons.push(coup._id);
            }
        }
        console.log(amountToPay);

        if (req.body.paymentMethod === 'Razorpay') {
            const razorpayOrder = await makePayment(amountToPay, "bulk");

            res.render('razorpay', {
                orderId: razorpayOrder.id,
                amount: amountToPay * 100,
                currency: 'INR',
                bulk: true,
                amountToPay: amountToPay
            });
        }
        else {
            return false;
        }

    } catch (error) {
        console.log(error);
    }


}
//edit cart
async function updateCart(userId, action, id) {

    const user = await User.findById(userId);

    const cartItem = user.cart.find(item => item.product.toString() === id);

    if (action === 'increase') {
        cartItem.quantity += 1;
    }
    if (action === 'decrease') {
        if ( cartItem.quantity == 1) return false;
        cartItem.quantity -= 1;
        if (cartItem.quantity <= 0) {
            user.cart = user.cart.filter(item => item.product.toString() !== id);
        }
    }

    await user.save();
    return cartItem.quantity
}


module.exports = { productView, favorites, cart, addFav, addCart, removeCart, buy, purchase, getBill, getOrders, checkout, updateCart, purchasePaymentSuccess, purchasePaymentFailed, proceedCheckout }