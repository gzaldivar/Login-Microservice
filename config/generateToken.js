var jwt = require('jsonwebtoken');
const SECRET = 'server secret';
const TOKENTIME = 60*60*24; // in seconds
const crypto = require('crypto');

//////////////////////
// token generation //
//////////////////////
module.exports = {
  generateAccessToken :
    function generateAccessToken(user, next) {
      var clientid = '12345';

      if (user.local) {
        clientid = user.local.email;
      } else if (user.facebook) {
        clientid = user.facebook.id;
      } else if (user.twitter) {
        clientid = user.twitter.id;
      } else if (user.google) {
        user.google.id;
      }

      var token = jwt.sign({
        id: user._id,
        clientId: clientid
      }, SECRET, {
        expiresIn: TOKENTIME
      });

      next(token);
    },

    generateRefreshToken :
      function generateRefreshToken(user, next) {
        var clientid = '12345';

        if (user.local) {
          clientid = user.local.email;
        } else if (user.facebook) {
          clientid = user.facebook.id;
        } else if (user.twitter) {
          clientid = user.twitter.id;
        } else if (user.google) {
          clientid = user.google.id;
        }

        console.log(clientid);
        var refreshToken = clientid.toString() + '.' + crypto.randomBytes(40).toString('hex');

        user.refreshToken.token = refreshToken;
        user.refreshToken.expires = new Date(new Date().setFullYear(new Date().getFullYear() + 1));

        user.save(function(err, user) {
          next(user);
        });
      }

};
