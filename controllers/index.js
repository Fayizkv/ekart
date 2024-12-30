var isLoggedIn = require('./middleware').verifyToken;
var adminLoggedIn = require('./middleware').adminLoggedIn;
var connectDB = require('./mongo');
const productSchema = require('../models/productmodel');
var dotenv = require('dotenv');

//GET HOME PAGE
async function indexPage(){
await connectDB();
const products = await productSchema.find();
return products;
}

//ADMIN LOGIN
function adminLogin(req,res){

  dotenv.config();
  if (req.body.email == process.env.ADMIN_EMAIL) {
    if (req.body.password == process.env.ADMIN_PASSWORD) {
      req.session.email = req.body.email;
      return true;
    }
    else {
      res.render('login', { admin: true, err: "Password Incorrect", loggedOut : true });
    }
  }
  else {
    res.render('login', { admin: true, err: "Invalid Admin", loggedOut : true });
  }
}
module.exports = { indexPage, adminLogin };


