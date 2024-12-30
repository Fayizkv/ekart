const nocache = require('nocache');
var connectDB = require('./mongo');
var User = require('../models/usermodel')
var bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

// SIGNUP
async function signup(req) {
  
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
        return true;
        
      } catch (err) {
        console.log(err);
        return false;
      }
  
      
  }
  
module.exports = { signup };