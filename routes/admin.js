var express = require('express');
var router = express.Router();
var dotenv = require('dotenv');

var product = require('../models/productmodel');
var User = require('../models/usermodel');
var connectDB = require('./mongo')

//admin page 
router.get('/', (req,res)=>{
    res.render('admin');
});


//admin Login
router.get('/login', (req,res)=>{
    res.render('login', {admin : true} );
});

//admin logout

//admin product page
router.get('/products', async (req,res)=>{

    await connectDB();

    var products = await product.find();

    res.render('adminproducts', { products });
});

//admin user page
router.get('/users', async(req,res)=>{

    await connectDB();

    var users = await User.find();
    console.log(users);
    res.render('adminusers', {users});
});

//addproduct page
router.get('/addproduct',(req,res)=>{
    res.render('addproduct');
});

//add product
router.post('/addproduct', async(req,res)=>{

    await connectDB();

    const newProduct = await new product({
        productname: req.body.productname,
        description: req.body.description,
        category: req.body.category,
        subcategory: req.body.subcategory,
        quantity: req.body.quantity,
        prize: req.body.prize, 
        seller: req.body.seller,
        brandname: req.body.brandname,
        image: req.body.image });

        await newProduct.save();

        console.log('Product added successfully');

        res.redirect('/admin/addproduct');
});
//deleteproduct


//edit page
router.get('/edit/:id', async (req,res)=>{

    await connectDB();

    const e_product = await product.findById(req.params.id);
    res.render('productedit', { e_product }); 
});


//edit product 
router.post('/edit/:id', async(req,res)=>{

    await product.findByIdAndUpdate( req.params.id, req.body, { new : true });
    
    res.redirect('/admin/products');
});


// router.get('')
module.exports = router;