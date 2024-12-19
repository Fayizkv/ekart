var express = require('express');
var router = express.Router();
var dotenv = require('dotenv');

var product = require('../models/productmodel');
var User = require('../models/usermodel');
var Orders = require('../models/orders');

//admin page 
router.get('/', async (req,res)=>{

    // const orders = await Orders.find();
    // console.log(orders);


    const salesReport = await Orders.aggregate([

        { $unwind: "$products" },
        {
            $group: {
                _id: "$products.product", 
                totalSold: { $sum: "$products.quantity" }, 
            },
        },
        {
            $lookup: {
                from: "products", 
                localField: "_id", 
                foreignField: "_id", 
                as: "productDetails", 
            },
        },
        {
            $unwind: "$productDetails", 
        },
        {
            $project: {
                productName: "$productDetails.productname", 
                totalSold: 1,
            },
        },
        { $sort: { totalSold: -1 } },
    ]);

    // console.log(productSales);
    res.render('admin', { salesReport, loggedOut : true });
});


//admin Login
router.get('/login', (req,res)=>{
    res.render('login', {admin : true} );
});

//admin logout

//admin product page
router.get('/products', async (req,res)=>{

    var products = await product.find();

    res.render('adminproducts', { products });
});

//admin user page
router.get('/users', async(req,res)=>{

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
router.post('/delete/:id', async(req,res)=>{

    await product.deleteOne({ _id : req.params.id });
    res.redirect('/admin/products');
})

//edit page
router.get('/edit/:id', async (req,res)=>{

    const e_product = await product.findById(req.params.id);
    res.render('productedit', { e_product }); 
});


//edit product 
router.post('/edit/:id', async(req,res)=>{

    await product.findByIdAndUpdate( req.params.id, req.body, { new : true });
    
    res.redirect('/admin/products');
});


module.exports = router;