const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const connectDB = require('./mongo');

dotenv.config();
const secretkey = process.env.SECRET_KEY;

async function adminLoggedIn(req, res, next){
    if (req.session.email) {
      await connectDB();
      return next(); 
    } else {
      res.render('login', { admin : true, loggedOut : true });
    }
  };

async function verifyToken(req,res,next){
    
  const token = req.cookies.token;
  if (!token) {
    res.render('login',{ loggedOut : true });
  }

  try{

    const decoded = jwt.verify(token,secretkey);
    req.user = decoded;
    await connectDB();
    next();
  } catch(err){
    res.render('login',{ loggedOut : true });
  }
}

module.exports={verifyToken, adminLoggedIn};