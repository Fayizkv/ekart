var express = require('express');
var router = express.Router();
var User = require('../models/usermodel');
const Order = require('../models/orders');
var productController = require('../controllers/products')

// view product details
router.get('/view/:id', async (req, res) => {
    var product = await productController.productView(req.params.id);
    res.render('product', { product });
});

//favorites::
router.get('/favorites', async (req, res) => {
    var products = await productController.favorites(req.user.id);
    res.render('index', { products, favorites: true, loggedIn: true });
});

//cart 
router.get('/cart', async (req, res) => {
    const cartItems = await productController.cart(req.user.id);
    res.render('cart', { cartItems, loggedIn: true });
});


//Add or remove from fav
router.post('/addfavorite', async (req, res) => {
    var fav = await productController.addFav(req.user.id, req.body.product_id);
    if( !fav )
    {
        res.json({notfav : true })
    }
  
});

//ADD TO CART
router.post('/addcart', async (req, res) => {
    await productController.addCart(req.user.id,req.body.product_id);  
});

//remove from cart
router.get('/removefromcart/:productId', async (req, res) => {

    await productController.removeCart(req);
    res.redirect('/products/cart');

});

//buy 
router.post('/buy', async (req, res) => {
    const product = await productController.buy(req.body.productId);
    res.render('buypage', { product, razorpay : true, singleItem : true });
});

//purchase page
router.post('/purchase', async (req, res) => {

    var orderId = await productController.purchase(req,res);
    if(req.body.paymentMethod !== 'Razorpay' ){
    res.render('ordersuccess', { orderId, alertMessage : "Purchase successful" }); 
    }
});

//payment success
router.get('/paymentsuccess/:id', async (req,res)=>{
    await productController.purchasePaymentSuccess(req.params.id, req.user.id);
    res.render('ordersuccess', { orderId : req.params.id, alertMessage : "Purchase successful" });
})

//payment failed
router.get('/paymentfailure/:id', async (req,res)=>{
    await productController.purchasePaymentFailed(req.params.id);
    res.redirect('/');
});

//get bill
router.get('/getbill/:id', async(req,res)=>{
    await productController.getBill(req.params.id,res);
});

//see orders
router.get('/orders', async (req, res) => {
    var orders = await productController.getOrders(req.user.id)
    res.render('userorders', { orders });
});

//checkout from cart
router.post('/checkout', async(req,res)=>{
    const status =  await productController.proceedCheckout(req,res);
    if ( !status ){
        res.render('bulkordercod')
    }
});

//checkout proceed for address
router.get('/checkoutsuccess/:id', (req,res)=>{
    res.render('bulkorderpaid', { transactionId : req.params.id })
});

//make cart order
router.post('/bulkpurchase', async (req,res)=>{
    await productController.checkout(req);
    res.redirect('/');
});

//update cart
router.post('/updateCart/', async (req,res)=>{
    var status = await productController.updateCart(req.user.id, req.body.action, req.body.id);
    if ( status != false ){
        res.json({success : true, quantity : status})
    }
});
module.exports = router;