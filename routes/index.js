var express = require('express');
var router = express.Router();
var connectDB = require('./mongo');
var User = require('../models/usermodel')
var bcrypt = require('bcrypt');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/signup', (req,res)=>{
  res.render('signup');
});

router.post('/signup', async (req, res) => {
  
  await connectDB();
  const { username, email, password, firstName, lastName, phone } = req.body;
    
    try {
      // Check if the user already exists
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).send('User already exists');
      }
      
      var hashedPw = await bcrypt.hash(password,10);
      user = new User({
        username,
        email,
        password : hashedPw,
        firstName,
        lastName,
        phone
      });
  
      // Save the new user to the database
      await user.save();
      console.log('User saved:', user);
      res.status(201).send('User registered successfully');
      
    } catch (err) {
      console.log(err);
      res.status(500).send('Server error');
    }
});

module.exports = router;
