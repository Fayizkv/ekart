var express = require('express');
var router = express.Router();
var connectDB = require('./mongo');
var User = require('../models/usermodel');
const products = require('../models/productmodel');
var isLoggedIn = require('./middleware').verifyToken;


//favorites::

router.get('/favorites', isLoggedIn, async(req,res)=>{

    // res.render('favorites');
    await connectDB();

    const user = await User.findById(req.user.id).populate('favorites');
    const products = await user.favorites;

    res.render('index', { products, favorites : true, loggedIn : true });

});
//ADD TO FAV
router.post('/addFavorite', isLoggedIn, async (req, res) => {

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
    
});

//ADD TO CART
router.post('/addcart', isLoggedIn, async (req, res) => {

    await connectDB();

    const user = await User.findById(req.user.id);

    if (!user.cart) {
        user.cart = [];
      }
    const isOnCart = await user.cart.includes(req.body.productId);

    if (!isOnCart) {
        await user.cart.push(req.body.productId);
        console.log("Product added to cart succesfully");
        await user.save();
    }
});
module.exports = router;