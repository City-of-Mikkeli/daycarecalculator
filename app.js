var SERVER_ROOT = "/";

var express = require('express')
  , app = express()
  , http = require('http')
  , server = http.createServer(app)
  , path = require('path');

server.listen(8080);

app.use(express.static(path.join(__dirname, 'public')));

app.get(SERVER_ROOT || "/", function (req, res) {
	 res.sendfile(__dirname + '/index.html');
});

