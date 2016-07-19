"use strict";

var express = require("express");
var app = express();
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var User = require("./models/user.js");
var Message = require("./models/message.js");

var db = mongoose.connection;
var port = 3001;
var COLLECTION = 'users';
var DATABASE = 'test';
// open db connections 
var mongoAddress, mongoPort
if (!process.env.DB_PORT_27017_TCP_ADDR) { // use localhost if runnig nodemon locally
  mongoAddress = "localhost"
  mongoPort = 27017
  console.log(mongoAddress)
} else { // get enviornment variables for db server
  mongoAddress = process.env.DB_PORT_27017_TCP_ADDR
  mongoPort = process.env.DB_PORT_27017_TCP_PORT
}
console.log("connecting to mongo on " + mongoAddress + ':' + mongoPort)
mongoose.connect('mongodb://' + mongoAddress + ':' + mongoPort + '/' + DATABASE );
db.on('error', console.error.bind(console, 'mongo connection error: '));
db.once('open', function() {
  console.log("connected to db.");
});
// middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  "extended": false
}));

// middleware to add headers for CORS to allow requests from local  http server
app.use(function(req, res, next) {
  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', 'http://127.0.0.1:8000' && 'http://localhost:8000');
  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});
//  top level message
app.get("/", function(req, res) {
  res.json({
    "error": false,
    "message": "Welcome to the Settled API"
  });
});
// method: get all users
app.get("/users", function(req, res) {
  db.collection(COLLECTION).find({}).toArray(function(err, docs) {
    if (err) {
      handleError(res, err.message, "can't get users");
    } else {
      res.status(200).json(docs);
    }
  });
});
// add new user
app.post("/users", function(req, res) {
  var newUser = req.body;
  if (!(req.body.username || req.body.firstName || req.body.lastName)) {
    handleError(res, "invalid input", "must provide username, first name and last name", 400);
  }
  db.collection(COLLECTION).insertOne(newUser, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to add new user.");
    } else {
      res.status(201).json(doc.ops[0]);
    }
  });
});
// delete user
app.delete("/users/:id", function(req, res) {
  var id = req.params.id;
  console.log('deleting user ' + id);
  db.collection(COLLECTION).deleteOne({
    '_id': mongoose.Types.ObjectId(id)
  }, {
    safe: true
  }, function(err, result) {
    if (err) {
      handleError(res, err.message, "Failed to delete user");
    } else {
      res.status(204).end();
      console.log("user " + id + " deleted.")
    }
  })
});
//update users
app.put("/users/:id", function(req, res) {
  var query = {
    _id: mongoose.Types.ObjectId(req.params.id)
  };
  console.log("username " + req.body.username)
  User.findOneAndUpdate(query, {
      username: req.body.username,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email
    }, {
      safe: true
    },
    function(err, result) {
      if (err) {
        handleError(res.err.message, "Failed to update user!");
      } else {
        res.status(204).end();
        console.log("user updated")
      }
    })
}); 

// error handling

function handleError(res, reason, message, code) {
  console.log("ERROR: " + reason);
  res.status(code || 500).json({
    "error": message
  });
}
//start server
app.listen(port);
console.log("Listening to PORT " + port);
