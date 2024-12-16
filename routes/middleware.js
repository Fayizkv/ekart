var express = require('express');
var router = express.Router();

function userLoggedIn(req, res, next){
    // Check if user session exists
    if (req.session.user) {
      return next();  // Continue to the next middleware or route handler
    } else {
      // If user is not logged in, redirect to login page
      res.redirect('/login');
    }
  };

module.exports={userLoggedIn};