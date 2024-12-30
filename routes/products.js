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

    await productController.addFav(req);
    
    if ( req.get('Referer').includes('favorites')){
    res.redirect('/products/favorites');
    }
    else
    {
        res.redirect('/');
    }
  
});

//ADD TO CART
router.post('/addcart', async (req, res) => {

    await productController.addCart(req);
    res.redirect('/');
    
});

//remove from cart
router.get('/removefromcart/:productId', async (req, res) => {

    await productController.removeCart(req);
    res.redirect('/products/cart');

});

//buy 
router.post('/buy', async (req, res) => {
    const product = await productController.buy(req.body.productId);
    res.render('buypage', { product });
});

//purchase page
router.post('/purchase', async (req, res) => {

    var order = await productController.purchase(req);
    res.render('ordersuccess', { order });

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
    if ( await productController.checkout(req) )
    {
        res.redirect('/products/cart');
    }
    else{
        res.send('Purchase failed');
    }
});

//update cart
router.post('/updateCart/:id', async (req,res)=>{
    await productController.updateCart(req);
    res.redirect('/products/cart');

});
module.exports = router;