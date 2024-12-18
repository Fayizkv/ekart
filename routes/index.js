var express = require('express');
var isLoggedIn = require('./middleware').verifyToken;
var adminLoggedIn = require('./middleware').adminLoggedIn;
var connectDB = require('./mongo');
const productSchema = require('../models/productmodel');
var dotenv = require('dotenv');
var router = express.Router();

/* GET home page. */
router.get('/', isLoggedIn, async function (req, res, next) {

  await connectDB();

  const products = await productSchema.find();

  res.render('index', { products, loggedIn: true, homepage: true });
});

router.get('/signup', (req, res) => {
  res.render('signup');
});

router.get('/login', (req, res) => {
  res.render('login');
});

//admin login
router.post('/login/admin', (req, res)=>{
  dotenv.config();

  if (req.body.email == process.env.ADMIN_EMAIL) {
    if (req.body.password == process.env.ADMIN_PASSWORD) {
      req.session.email = req.body.email;
      res.redirect('/admin/');
    }
    else {
      res.render('login', { admin: true, err: "Password Incorrect" });
    }
  }
  else {
    res.render('login', { admin: true, err: "Invalid Admin" });
  }

});

module.exports = router;