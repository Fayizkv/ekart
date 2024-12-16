const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();
const secretkey = process.env.SECRET_KEY;

function userLoggedIn(req, res, next){
    // Check if user session exists
    if (req.session.user) {
      return next();  // Continue to the next middleware or route handler
    } else {
      // If user is not logged in, redirect to login page
      res.redirect('/login');
    }
  };

function verifyToken(req,res,next){
    
  const token = req.cookies.token;
  if (!token) {
    res.render('login',{ loggedIn : false });
  }

  try{

    const decoded = jwt.verify(token,secretkey);
    req.user = decoded;
    next();
  } catch(err){
    res.render('login',{ loggedIn : false });
  }
}

module.exports={verifyToken};