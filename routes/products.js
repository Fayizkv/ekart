var express = require('express');
var router = express.Router();
var connectDB = require('./mongo');
var User = require('../models/usermodel');
const products = require('../models/productmodel');
var isLoggedIn = require('./middleware').verifyToken;

router.post('/favorite', isLoggedIn, async (req, res) => {

    await connectDB();
    console.log(req.body.productId);
    console.log(req.user.id);

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

module.exports = router;