var express = require('express');

var app = express();
var server = require('http').createServer(app);

server.listen(1337);

var dir = function dir(req, res){
  res.sendfile('./window.html');
};

app.use('/',express.static(__dirname));

app.get('/',dir);
