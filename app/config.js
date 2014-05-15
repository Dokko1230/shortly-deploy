var Bookshelf = require('bookshelf');
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');
var crypto = require('crypto');

mongoose.connect(process.env.MONGO_ENV);

var path = require('path');

var linksSchema = new mongoose.Schema({
  url: String,
  base_url: String,
  code: String,
  title: String,
  visits: {type: Number, default: 0},
  createdAt: { type: Date, default: Date.now }
});

linksSchema.pre('save', function(next) {
  var shasum = crypto.createHash('sha1');
  shasum.update(this.url);
  this.code = shasum.digest('hex').slice(0, 5);
  next();
});

exports.linksSchema = linksSchema;

var usersSchema = new mongoose.Schema({
  username: String,
  password: String,
  createdAt: { type: Date, default: Date.now }
});

usersSchema.method('comparePassword', function(attemptedPassword, callback){
  bcrypt.compare(attemptedPassword, this.get('password'), function(err, isMatch) {
      callback(isMatch);
  });
});

usersSchema.method('hashPassword', function(){
  var cipher = Promise.promisify(bcrypt.hash);
  return cipher(this.password, null, null).bind(this);
});

exports.usersSchema = usersSchema;

