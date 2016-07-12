var express = require("express");
var app =   express();
var router =   express.Router();
var mongoose = require("mongoose");

// mongoose.connect('')
var bodyParser  =   require("body-parser");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({"extended" : false}));

router.get("/",function(req,res){
    res.json({"error" : false,"message" : "Hello jay"});
});

app.use('/',router);

app.listen(3000);
console.log("Listening to PORT 3000");