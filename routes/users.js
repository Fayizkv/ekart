var express = require('express');
var router = express.Router();
const userController = require('../controllers/users');

//LOGIN 
router.get('/login', (req,res)=>{
  res.render('login');
});

// LOGIN
router.post('/login', async(req,res)=>{
  if ( await userController.login(req,res) ){
    res.redirect('/');
  }
});

// LOGOUT 
router.get('/logout', (req,res)=>{
  userController.logout(res);
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
