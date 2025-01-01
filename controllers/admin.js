var dotenv = require('dotenv');
var product = require('../models/productmodel');
var User = require('../models/usermodel');
var Orders = require('../models/orders');
var noCache = require('nocache');

//get home page
async function adminHome(){
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

    return salesReport;
}

//logout
function logout(req){
    req.session.destroy();
    noCache();
}

//get productpage
async function getProducts(){
    return await product.find();;
}

//get userpage
async function getUsers(){
    return await User.find();
}

//add product
async function addProduct(req){
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
}

//deleteProduct
async function deleteProduct(id){
    await product.deleteOne({ _id : id});
}

//edit product
async function getEdit(id){
    return await product.findById(id);
}

//edit product
async function editProduct(req){
    await product.findByIdAndUpdate( req.params.id, req.body, { new : true });
}

//activate user
async function activateUser(id){
    await User.findByIdAndUpdate(
        id,
        { activestatus: true },
        { new: true }
      );
}

//deactivate user
async function deactivateUser(id){
    await User.findByIdAndUpdate(id, {activestatus : false}, { new: true });
}
module.exports = { adminHome, getProducts, getUsers, addProduct, deleteProduct, getEdit, editProduct, activateUser, deactivateUser, logout };