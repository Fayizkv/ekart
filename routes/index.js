var express = require('express');
var isLoggedIn = require('./middleware').userLoggedIn;
var connectDB = require('./mongo');
const productSchema = require('../models/productmodel');

var router = express.Router();

/* GET home page. */
router.get('/', isLoggedIn, async function(req, res, next) {
  
  await connectDB();
  
  const products = await productSchema.find();
  
  res.render('index', { products });
});

router.get('/signup', (req,res)=>{
  res.render('signup');
});

router.get('/login',(req,res)=>{
  res.render('login');
});


module.exports = router;