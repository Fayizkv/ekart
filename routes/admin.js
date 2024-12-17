var express = require('express');
var router = express.Router();

var product = require('../models/productmodel');
var User = require('../models/usermodel');
var connectDB = require('./mongo')

//admin login

//admin logout

//admin product page
router.get('/products', async (req,res)=>{

    await connectDB();

    var products = await product.find();

    res.render('adminproducts', { products });
})

//admin user page
router.get('/users', async(req,res)=>{

    await connectDB();

    var users = await User.find();
    console.log(users);
    res.render('adminusers', {users});
});


module.exports = router;