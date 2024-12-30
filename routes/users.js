var express = require('express');
var router = express.Router();
const nocache = require('nocache');
var connectDB = require('./mongo');
var User = require('../models/usermodel')
var bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const userController = require('../controllers/users');



//LOGIN 
router.get('/login', (req,res)=>{
  res.render('login');
});

// LOGIN
router.post('/login', async(req,res)=>{
  // try {
  //   await connectDB();

  //   let user = await User.findOne({ email: req.body.email });
    
  //   if (user) {

  //     const isMatch = await bcrypt.compare(req.body.password, user.password);
  //     if (isMatch) {

  //       const token = jwt.sign({ id : user._id, username : user.username },
  //                                 secretkey, {expiresIn: '1hr'});

  //       console.log("Login Success");
  //       res.cookie('token', token, { httpOnly: true, secure: true }); // Optional 'secure: true' for HTTPS
  //       res.redirect('/');
  //     } else {
  //       res.render('login',{err : "Incorrect Password"});
  //     }
  //   } else {
  //     res.render('login',{err : "Invalid Email"});
  //   }
  // } catch (err) {
  //   console.log(err);
  //   return res.status(500).send('Server error');
  // }
  if ( await userController.login(req,res) ){
    res.redirect('/');
  }
});

// LOGOUT 
router.get('/logout', (req,res)=>{

  res.clearCookie('token');
  res.redirect('/');
});

// SIGNUP
router.post('/signup', async (req, res) => {

  if ( await userController.signup(req) ) { 
    res.render('login'); }
  
  else { 
    res.status(500).send('Server error'); 
  } 
});

module.exports = router;
