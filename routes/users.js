var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

var jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt');
const jwtAuthenticate = expressJwt({secret : 'server secret'});

var User = require('../models/user');

/* GET /gunrange listing. */
router.get('/', jwtAuthenticate, function(req, res, next) {
  User.find({}, function (err, docs) {
    if (err) return next(err);
    console.log(docs);
    res.json(docs);
  });
});

router.get('/:id', jwtAuthenticate, function(req, res, next) {
  User.findById(req.params.id, function (err, docs) {
    if (err) return next(err);
    res.json(docs);
  });
});

module.exports = router;
