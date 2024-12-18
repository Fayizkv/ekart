const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();
const secretkey = process.env.SECRET_KEY;

function adminLoggedIn(req, res, next){
    if (req.session.email) {
      return next(); 
    } else {
      res.render('login', { admin : true });
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

module.exports={verifyToken, adminLoggedIn};