var express = require('express');
var router = express.Router();
const userController = require('../controllers/users');
var isLoggedIn = require('../controllers/middleware').verifyToken;

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

//Get details
router.get('/details', isLoggedIn, async(req,res)=>{
  var user = await userController.getDetails(req.user.id);
  res.render('userdetails', { user });
});

//edit user details
router.post('/edit', isLoggedIn, async(req,res)=>{
  await userController.editDetails(req);
  res.redirect('/users/details');
})
module.exports = router;
