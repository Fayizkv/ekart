var express = require('express');
var router = express.Router();
var User = require('../models/usermodel');
const products = require('../models/productmodel');
const Order = require('../models/orders');
var genBill = require('../models/createPdf');

// view product details
router.get('/view/:id', async (req, res) => {
    var product = await products.findById(req.params.id);
    res.render('product', { product, loggedIn: true });
});

//favorites::
router.get('/favorites', async (req, res) => {

    const user = await User.findById(req.user.id).populate('favorites');
    const products = await user.favorites;

    res.render('index', { products, favorites: true, loggedIn: true });

});

//cart 
router.get('/cart', async (req, res) => {

    const user = await User.findById(req.user.id).populate('cart.product');
    const cartItems = await user.cart;


    res.render('cart', { cartItems, loggedIn: true });

});


//Add or remove from fav
router.post('/addfavorite', async (req, res) => {

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
    res.redirect('/');
});

//ADD TO CART
router.post('/addcart', async (req, res) => {

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
    res.redirect('/');
    await user.save();
});

//remove from cart
router.get('/removefromcart/:productId', async (req, res) => {

    const productId = req.params.productId;

    const user = await User.findById(req.user.id);
    user.cart = user.cart.filter(item => item.product.toString() !== productId);

    await user.save();

    console.log("Product removed from cart");
    res.redirect('/products/cart');


});

//buy 
router.post('/buy', async (req, res) => {

    const product = await products.findById(req.body.productId);
    res.render('buypage', { product });
});

router.post('/purchase', async (req, res) => {

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
    res.render('ordersuccess', { order });


});

router.get('/getbill/:id', async(req,res)=>{
    
    const order = await Order.findById(req.params.id).populate('user products.product');
    genBill(order,res);
    console.log(order);
})
router.get('/orders', async (req, res) => {

    var userOrders = await User.findById(req.user.id).populate({
        path: 'orders',
        populate: {
            path: 'products.product', // Populate product details
            model: 'Product',
        },
    });

    var orders = userOrders.orders;

    res.render('userorders', { orders });
});
module.exports = router;