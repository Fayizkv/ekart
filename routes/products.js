var express = require('express');
var router = express.Router();
var connectDB = require('./mongo');
var User = require('../models/usermodel');
const products = require('../models/productmodel');
var isLoggedIn = require('./middleware').verifyToken;


//favorites::

router.get('/favorites', async(req,res)=>{

    await connectDB();

    const user = await User.findById(req.user.id).populate('favorites');
    const products = await user.favorites;

    res.render('index', { products, favorites : true, loggedIn : true });

});

//cart 
router.get('/cart', async(req,res)=>{

    await connectDB();

    const user = await User.findById(req.user.id).populate('cart.product');
    const cartItems = await user.cart;


    res.render('cart', { cartItems, loggedIn : true});

});


//ADD TO FAV
router.post('/addFavorite', async (req, res) => {

    await connectDB();

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

    await connectDB();

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
    } else{
        user.cart.push({ product: productId, quantity });
        console.log("Product added to cart successfully");
    }
    res.redirect('/');
    await user.save();
});

//remove from cart

router.get('/removefromcart/:productId', async(req,res)=>{

    const productId = req.params.productId;

    const user = await User.findById(req.user.id);
    user.cart = user.cart.filter(item => item.product.toString() !== productId);

    await user.save();

    console.log("Product removed from cart");
    res.redirect('/products/cart');


});
module.exports = router;