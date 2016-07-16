"use strict";
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
  username: { type: String, required: true},
  password: String,
  firstName: {type: String, required: true},
  lastName: {type: String, required: true},
  createdAt: Date,
  email: String,
  updatedAt: String,
  status: Boolean
  },
  {collection: 'users'}
);

var User = mongoose.model('User', userSchema);
module.exports = User; 