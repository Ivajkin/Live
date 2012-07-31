
var express = require("express");
//static html loader by Tim
var load_static_file = require('./src/load_static_file.js').load_static_file;
//jade file loader by express =)
var load_jade_file = require('./src/load_jade_file.js').load_jade_file;
//Console colorizer
console.msg = require('./src/console.msg.js').msg;

var util = require('util'),
    http = require('http'),
    path = require('path');
var port = process.env.PORT || 3000;
//app init and server start
var app = express.createServer();
app.use(express.bodyParser());
app.use(express.cookieParser());


app.get('*', function(request, response){
    console.msg.info("Message received");
    //load_static_file(request, response, '/web/www');
    load_jade_file(request, response, '/web');
    //response.render(path.join(process.cwd() + '/web', '/index.jade'), { title: 'My Site' });
});

app.listen(port, function(){
        console.msg.info('Web server (server.js) running at http://127.0.0.1:' + port + '/');
        console.msg.info('Current path: ' + path.join(process.cwd()));
    });