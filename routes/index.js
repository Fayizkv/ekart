var express = require('express');
var isLoggedIn = require('./middleware').userLoggedIn;

var router = express.Router();

/* GET home page. */
router.get('/', isLoggedIn, function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/signup', (req,res)=>{
  res.render('signup');
});

router.get('/login',(req,res)=>{
  res.render('login');
});


module.exports = router;