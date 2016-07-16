"use strict";
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var messageSchema = new Schema({
  from: {type: mongoose.Schema.ObjectId, ref: 'User'},
  to: {type: mongoose.Schema.ObjectId, ref: 'User'},
  messageText: String,
  dateSent: Date
  },
 {collection: 'messages'}
);

var Message = mongoose.model('Message', messageSchema);
module.exports = Message;