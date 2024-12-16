var express = require('express');
var router = express.Router();
const nocache = require('nocache');

/* GET users listing. */

var connectDB = require('./mongo');
var User = require('../models/usermodel')
var bcrypt = require('bcrypt');

router.post('/login', async(req,res)=>{
  try {
    await connectDB();

    let user = await User.findOne({ email: req.body.email });
    
    if (user) {
      console.log("User exists");

      const isMatch = await bcrypt.compare(req.body.password, user.password);
      if (isMatch) {
        req.session.user = req.body.username;
        console.log("Login Success");
        return res.status(200).send('Login successful'); 
      } else {
        console.log("Password mismatch");
        return res.status(401).send('Invalid credentials');
      }
    } else {
      console.log("User does not exist");
      return res.status(404).send('User not found');
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send('Server error');
  }

})
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
