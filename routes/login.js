var express = require('express');
var router = express.Router();
var urlencode = require('urlencode');

var mongoose = require('mongoose');
var createToken = require('../config/generateToken.js')

const expressJwt = require('express-jwt');
const SECRET = 'server secret';
const jwtAuthenticate = expressJwt({secret : SECRET});

var User = require('../models/user');

router.post('/auth/signup', function(req, res, next) {
  console.log(req.body.user);
  console.log(req.body.user.local);

  if (req.body.user && req.body.user.local) {

    // see if the user already exists. If not, add the user
    User.findOne({ "local.email" : req.body.user.local.email }, function(err, user) {
      if (user) {
        res.json({ "status": "error", "message": "Email already exists"});
      } else {
        var newUser = new User();

        // set the user's local credentials
        newUser.local.email = req.body.user.local.email;
        newUser.local.password = newUser.generateHash(req.body.user.local.password);

        // save the user
        User.create(newUser, function(err, user) {
            if (err) {
              res.json({ error: "Error - " + err.message })
            } else {
              res.json({ status: "success", user: user });
            }
        });
      }
    });
  } else {
    res.json({ 'status': 'error'})
  }
});

router.post('/auth/login', function(req, res, next) {
  if (req.body.user.local) {
    User.findOne({ 'local.email' : req.body.user.local.email }, function(err, user) {
      if (err) {
        return next(err)
      }

      processUser(user, res);

    });
  } else if (req.body.user.facebook) {
    // see if the user already exists. If not, add the user
    User.findOne({ "facebook.id" : req.body.user.facebook.id }, function(err, user) {
      if (user) {
        user.facebook.token = req.body.user.facebook.token;

        user.save(function(err, user) {
          if (err) {
            throw err;
          } else {
            processUser(user, res);
          }
        });
      } else {
        var newUser = new User();

        // set the user's local credentials
        newUser.facebook.token = req.body.user.facebook.token;
        newUser.facebook.name = req.body.user.facebook.name;
        newUser.facebook.id = req.body.user.facebook.id;

        // save the user
        newUser.save(function(err, user) {
            if (err)
                throw err;

            processUser(user, res);
        });
      }
    });
  } else if (req.body.user.twitter) {
    // see if the user already exists. If not, add the user
    User.findOne({ "twitter.username" : req.body.user.twitter.username }, function(err, user) {
      if (user) {
        res.json({ "status": "error", "message": "Twitter account already exists"});
      } else {
        var newUser = new User();

        // set the user's local credentials
        newUser.twitter.displayName = req.body.user.twitter.displayName;
        newUser.twitter.token = req.body.user.twitter.token;
        newUser.twitter.username = req.body.user.twitter.username;

        // save the user
        newUser.save(function(err, user) {
            if (err)
                throw err;
            processUser(user, res);
        });
      }
    });
  } else {
    res.json({ "status": "error" });
  }
});

router.post('/auth/logout', function(req, res, next) {
  console.log("logging out " + req.body.user);

  if (req.body.user && req.body.user.local) {
    res.json({ status: "success", message: "logged out" });
  } else if (req.body.user && req.body.user.facebook) {
    User.findOne({
      'facebook.token' : req.body.user.facebook.token }, function(err, user) {
      if (err) {
        return next(err)
      }

      user.token = null;
      user.save(function(err, user) {
        if (err)
            throw err;

        res.json({ status: "success", message: "logged out" });
      });
    });
  } else if (req.body.user && req.body.user.twitter) {

  }
});

router.get('/auth/authenticate', jwtAuthenticate, function(req, res, next) {
  res.json({ "status": "ok" });
});

var processUser = function(user, res) {
  if (!user) {
    res.status(200).json({ status: "failed" });
  } else {

    //user has authenticated correctly thus we create a JWT token
    createToken.generateAccessToken(user, function(token) {
      createToken.generateRefreshToken(user, function(aUser) {
        console.log(aUser);
        res.json({ status: "success", token: token, user: aUser });
      });
    });
  }
};

module.exports = router;
