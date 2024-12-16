var express = require('express');
var router = express.Router();
const nocache = require('nocache');
var connectDB = require('./mongo');
var User = require('../models/usermodel')
var bcrypt = require('bcrypt');

// LOGIN
router.post('/login', async(req,res)=>{
  try {
    await connectDB();

    let user = await User.findOne({ email: req.body.email });
    
    if (user) {

      const isMatch = await bcrypt.compare(req.body.password, user.password);
      if (isMatch) {
        req.session.user = req.body.username;
        console.log("Login Success");
        res.render('index');
      } else {
        res.render('login',{err : "Incorrect Password"});
      }
    } else {
      res.render('login',{err : "Invalid Email"});
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send('Server error');
  }

})


// SIGNUP
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
      res.redirect('/login');
      
    } catch (err) {
      console.log(err);
      res.status(500).send('Server error');
    }

    
});

module.exports = router;
