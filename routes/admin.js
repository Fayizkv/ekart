var express = require('express');
var router = express.Router();
var adminController = require('../controllers/admin');

//admin page 
router.get('/', async (req,res)=>{
    var salesReport = await adminController.adminHome();
    res.render('admin', { salesReport, loggedOut : true });
});


//admin Login
router.get('/login', (req,res)=>{
    res.render('login', {admin : true, loggedOut : true} );
});

//admin logout
router.get('/logout', (req,res)=>{
    adminController.logout(req);
    res.redirect('/');
});

//admin product page
router.get('/products', async (req,res)=>{
    var products = await adminController.getProducts();
    res.render('adminproducts', { products, loggedOut : true });
});

//admin user page
router.get('/users', async(req,res)=>{

    var users = await adminController.getUsers();
    res.render('adminusers', {users, loggedOut : true});
});

//addproduct page
router.get('/addproduct',(req,res)=>{
    res.render('addproduct', {loggedOut : true});
});

//add product
router.post('/addproduct', adminController.upload.single('imagefile'), async(req,res)=>{
        await adminController.addProduct(req);
        res.redirect('/admin/addproduct');
});

//deleteproduct
router.post('/delete/:id', async(req,res)=>{
    await adminController.deleteProduct(req.params.id);
    res.redirect('/admin/products');
})

//edit page
router.get('/edit/:id', async (req,res)=>{

    const e_product = await adminController.getEdit(req.params.id);
    res.render('productedit', { e_product, loggedOut : true }); 
});


//edit product 
router.post('/edit/:id', async(req,res)=>{
    await adminController.editProduct(req);    
    res.redirect('/admin/products');
});

//activate user
router.get('/activate/:id', async(req,res)=>{
    await adminController.activateUser(req.params.id);
    res.redirect('/admin/users');
});

//dectivate user
router.get('/deactivate/:id', async (req,res)=>{
    await adminController.deactivateUser(req.params.id);
    res.redirect('/admin/users');
})

module.exports = router;