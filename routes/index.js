var express = require('express');
var isLoggedIn = require('../controllers/middleware').verifyToken;
var adminLoggedIn = require('../controllers/middleware').adminLoggedIn;
var connectDB = require('./mongo');
const productSchema = require('../models/productmodel');
var indexController = require('../controllers/index');
var dotenv = require('dotenv');
var router = express.Router();

/* GET home page. */
router.get('/', isLoggedIn, async function (req, res, next) {
  const products = await indexController.indexPage();
  res.render('index', { products, homepage: true });
});

router.get('/signup', (req, res) => {
  res.render('signup', { loggedOut : true });
});

router.get('/login', (req, res) => {
  res.render('login', { loggedOut : true} );
});

//admin login
router.post('/login/admin', (req, res)=>{  
  if ( indexController.adminLogin(req,res)){
    res.redirect('/admin/');
  }
});

module.exports = router;