var express = require('express');
var router = express.Router();
var urlencode = require('urlencode');

var mongoose = require('mongoose');

var jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt');
const jwtAuthenticate = expressJwt({secret : 'server secret'});

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
  } else if (req.body.user && req.body.user.facebook) {
    // see if the user already exists. If not, add the user
    User.findOne({ "facebook.email" : req.body.user.facebook.email }, function(err, user) {
      if (user) {
        res.json({ "status": "error", "message": "Facebook account already exists"});
      } else {
        var newUser = new User();

        // set the user's local credentials
        newUser.facebook.email = req.body.user.facebook.email;
        newUser.facebook.token = req.body.user.facebook.token;
        newUser.facebook.name = req.body.user.facebook.name;

        // save the user
        newUser.save(function(err, user) {
            if (err)
                throw err;
            res.json({ status: "success", user: user });
        });
      }
    });
  } else if (req.body.user && req.body.user.twitter) {
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
            res.json({ status: "success", user: user });
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
    User.findOne({
      'facebook.token' : req.body.user.facebook.token }, function(err, user) {
      if (err) {
        return next(err)
      }

      processUser(user, res);

    });
  } else if (req.body.user.twitter) {
    User.findOne({ 'twitter.token' : req.body.user.twitter.token }, function(err, user) {
      if (err) {
        return next(err)
      }

      processUser(user, res);

    });
  } else {
    res.json({ "status": "error" });
  }
});

router.get('/logout', function(req, res, next) {

});

router.get('/auth/authenticate', jwtAuthenticate, function(req, res, next) {
  res.json({ "status": "ok" });
});

var processUser = function(user, res) {
  if (!user) {
    res.status(200).json({ status: "failed" });
  } else {

    //user has authenticated correctly thus we create a JWT token
    var token = jwt.sign({
        id: user._id,
      }, 'server secret', {
        expiresIn : 60*60*24
      });

    res.json({ status: "success", token: token, user: user });
  }
};

module.exports = router;
