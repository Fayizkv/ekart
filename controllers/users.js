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
        console.log("signup success"); 
        return true;
        
      } catch (err) {
        console.log(err);
        return false;
      }
}

//  LOGIN
async function login(req,res){

    dotenv.config();
    const secretkey = process.env.SECRET_KEY;
    try {
      await connectDB();
  
      let user = await User.findOne({ email: req.body.email });
      
      if (user) {
  
        const isMatch = await bcrypt.compare(req.body.password, user.password);
        if (isMatch) {
  
          const token = jwt.sign({ id : user._id, username : user.username },
                                    secretkey, {expiresIn: '1hr'});
  
          console.log("Login Success");
          res.cookie('token', token, { httpOnly: true, secure: true }); // Optional 'secure: true' for HTTPS
          return true;
          
        } else {
          res.render('login',{err : "Incorrect Password"});
        }
      } else {
        res.render('login',{err : "Invalid Email"});
      }
    } catch (err) {
      console.log(err);
      res.status(500).send('Server error');
    }
  
}

//LOGOUT
function logout(res){
    res.clearCookie('token');
}

module.exports = { signup, login, logout };