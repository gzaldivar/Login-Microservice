process.env.NODE_ENV = 'test';

var chai = require('chai');
var chaiHttp = require('chai-http');
var mongoose = require('mongoose');

var server = require('../app');
var User = require('../models/user');

var user;

var should = chai.should();
chai.use(chaiHttp);

mongoose.Model.on('index', function(err) {
  if (err) logger.error(err);
});

// Use native Node promises
mongoose.Promise = global.Promise;

describe('Logins', function() {

  User.collection.drop();

  beforeEach(function(done){

    user = new User({
      local : {
        email : "gzaldivar@icloud.com",
        password : "Apollo"
      },
      facebook: {
        token: "foobar",
        email: "apollo@icloud.com",
        name: "apollo"
      },
      twitter: {
        token: "barfoo",
        displayName: "athena",
        username: "Athena"
      }
    })

    user.save(function(err, user) {
      done();
    });

  });

  afterEach(function(done){
    User.collection.drop()
    done();
  });

  it ('should be able to sign up a new local user /login/auth/signup', function(done) {
    chai.request(server)
    .post('/login/auth/signup')
      .send({
        user: {
          local: {
              'email': 'apollo@gmail.com',
              'password': 'Apollo'
            }
          }
        })
      .end(function(err, res){
        console.log(res.body);
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a('object');
        res.body.should.have.property('user');
        res.body.user.local.should.have.property('email');
        res.body.user.local.should.have.property('password');
        res.body.user.local.email.should.equal("apollo@gmail.com");
        done();
      });
  });

  it ('should not be able to sign up an existing local user', function(done) {
    chai.request(server)
    .post('/login/auth/signup')
      .send({
        user: {
          local: {
              'email': 'gzaldivar@icloud.com',
              'password': 'Apollo'
            }
          }
        })
      .end(function(err, res){
        console.log(res.body);
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a('object');
        res.body.should.have.property('status');
        res.body.should.have.property('message');
        res.body.status.should.equal("error");
        res.body.message.should.equal("Email already exists");
        done();
      });
  });

  it('should login a local user /login/auth/login POST', function(done) {

    chai.request(server)
    .post('/login/auth/login')
      .send({
        user: {
          local: {
              'email': 'gzaldivar@icloud.com',
              'password': 'Apollo'
            }
          }
        })
      .end(function(err, res){
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a('object');
        res.body.should.have.property('status');
        res.body.should.have.property('token');
        res.body.should.have.property('user');
        res.body.status.should.equal("success");
        done();
    });
  });

  it ('should be able to sign up a new facebook user /login/auth/signup', function(done) {
    chai.request(server)
    .post('/login/auth/signup')
      .send({
        user: {
          facebook: {
              email: 'apollo@gmail.com',
              name: 'Apollo',
              token: "foobar"
            }
          }
        })
      .end(function(err, res){
        console.log(res.body);
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a('object');
        res.body.should.have.property('user');
        res.body.user.facebook.should.have.property('email');
        res.body.user.facebook.should.have.property('name');
        res.body.user.facebook.should.have.property('token');
        res.body.user.facebook.email.should.equal("apollo@gmail.com");
        res.body.user.facebook.name.should.equal("Apollo");
        done();
      });
  });

  it ('should not be able to sign up an existing facebook user', function(done) {
    chai.request(server)
    .post('/login/auth/signup')
      .send({
        user: {
          facebook: {
              token: "foobar",
              email: "apollo@icloud.com",
              name: "apollo"
            }
          }
        })
      .end(function(err, res){
        console.log(res.body);
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a('object');
        res.body.should.have.property('status');
        res.body.should.have.property('message');
        res.body.status.should.equal("error");
        res.body.message.should.equal("Facebook account already exists");
        done();
      });
  });

  it('should login a facebook user /login/auth/login POST', function(done) {

    chai.request(server)
    .post('/login/auth/login')
      .send({
        user: {
          facebook: {
              token: "foobar",
              email: "apollo@icloud.com",
              name: "apollo"
            }
          }
        })
      .end(function(err, res){
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a('object');
        res.body.should.have.property('status');
        res.body.should.have.property('token');
        res.body.should.have.property('user');
        res.body.status.should.equal("success");
        done();
    });
  });

  it ('should be able to sign up a new twitter user /login/auth/signup', function(done) {
    chai.request(server)
    .post('/login/auth/signup')
      .send({
        user: {
          twitter: {
              token: "fubar",
              displayName: "apollo",
              username: "Apollo"
            }
          }
        })
      .end(function(err, res){
        console.log(res.body);
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a('object');
        res.body.should.have.property('user');
        res.body.user.twitter.should.have.property('username');
        res.body.user.twitter.should.have.property('displayName');
        res.body.user.twitter.should.have.property('token');
        res.body.user.twitter.username.should.equal("Apollo");
        res.body.user.twitter.displayName.should.equal("apollo");
        done();
      });
  });

  it ('should not be able to sign up an existing twitter user', function(done) {
    chai.request(server)
    .post('/login/auth/signup')
      .send({
        user: {
          twitter: {
              token: "barfoo",
              displayName: "athena",
              username: "Athena"
            }
          }
        })
      .end(function(err, res){
        console.log(res.body);
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a('object');
        res.body.should.have.property('status');
        res.body.should.have.property('message');
        res.body.status.should.equal("error");
        res.body.message.should.equal("Twitter account already exists");
        done();
      });
  });

  it('should login a twitter user /login/auth/login POST', function(done) {

    chai.request(server)
    .post('/login/auth/login')
      .send({
        user: {
          twitter: {
              token: "barfoo",
              displayName: "athena",
              username: "Athena"
            }
          }
        })
      .end(function(err, res){
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a('object');
        res.body.should.have.property('status');
        res.body.should.have.property('token');
        res.body.should.have.property('user');
        res.body.status.should.equal("success");
        done();
    });
  });

  it('should login a user /login/auth/login POST and verify the JWT token', function(done) {

    chai.request(server)
    .post('/login/auth/login')
      .send({
        user: {
          twitter: {
              token: "barfoo",
              displayName: "athena",
              username: "Athena"
            }
          }
        })
      .end(function(err, res){
        console.log(res.body);
        chai.request(server)
          .get('/login/auth/authenticate')
          .set("Authorization", 'Bearer ' + res.body.token)
          .end(function(err, res){
            res.should.have.status(200);
            done();
          });
    });
  });

});
