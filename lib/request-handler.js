var request = require('request');
var bcrypt = require('bcrypt-nodejs');
var util = require('../lib/utility');

var db = require('../app/config');
// var User = require('../app/models/user');
var Link = require('../app/models/link');
var User = require('../app/models/user');

var Promise = require('bluebird');
// var Links = require('../app/collections/links');
// var Users = require('../app/collections/users');

exports.renderIndex = function(req, res) {
  res.render('index');
};

exports.signupUserForm = function(req, res) {
  res.render('signup');
};

exports.loginUserForm = function(req, res) {
  res.render('login');
};

exports.logoutUser = function(req, res) {
  req.session.destroy(function(){
    res.redirect('/login');
  });
};

exports.fetchLinks = function(req, res) {
  // Links.reset().fetch().then(function(links) {
  //   res.send(200, links.models);
  // })
  Link.find(function(err, links) {
    if(err) return console.error(err);
    debugger;
    res.send(200, links);
  });
};

exports.saveLink = function(req, res) {
  var uri = req.body.url;

  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.send(404);
  }
  debugger;
  console.log('saving links');

  //search for {url: uri}
  Link.find({url: uri}, function(err, links) {
    if (err) {
      console.log(err);
    } else if (links.length > 0) {
      res.send(200, links[0]);
    } else {
      util.getUrlTitle(uri, function(err, title) {
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.send(404);
        }

        var link = new Link({
          url: uri,
          title: title,
          base_url: req.headers.origin
        });

        console.log('title: ', title, '\nlink: ', link);
        link.save(function(){
          res.send(200, link);
        });
      });
    }
  });

};

exports.loginUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  User.find({username: username}, function(err, users){
    if(err) console.log(err);
    if(users.length > 0){
      var user = users[0];
      user.comparePassword(password, function(match) {
        if(match) {
          util.createSession(req, res, user);
        } else {
          res.redirect('/login');
        }
      });
    } else {
      res.redirect('/login');
    }
  });
};



exports.signupUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  User.find({username: username}, function(err, users) {
    if (err) {
      console.log(err);
    } else if (users.length > 0) {
      console.log('Account exists already');
      res.redirect('/signup');
    } else {
      var user = new User({
        username: username,
        password: password
      });
      user.hashPassword()
      .then(function(hash) {
        this.password = hash;
        return new Promise(function(resolve, reject) {
          resolve();
        });
      })
      .then(function(){
        user.save(function() {
          console.log('User ', username, 'created');
          res.redirect('/login');
        });
      });
    }
  });

};

exports.navToLink = function(req, res) {

  Link.find({ code: req.params[0] }, function(err, links) {
    if(links.length > 0) {
      var link = links[0];
      link.visits++;
      link.save(function() {
        res.redirect(links[0].url);
      });
    } else {
      res.redirect('/');
    }
  });
};
