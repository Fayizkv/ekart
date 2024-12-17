var express = require('express');
var router = express.Router();

var product = require('../models/productmodel');
var connectDB = require('./mongo')

//admin login

//admin logout

//admin page
router.get('/', async (req,res)=>{

    await connectDB();

    var products = await product.find();

    res.render('admin', { products });
})

module.exports = router;