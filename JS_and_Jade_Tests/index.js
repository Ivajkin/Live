
var express = require("express");
//static html loader by Tim
var load_static_file = require('./src/load_static_file.js').load_static_file;
//jade file loader by express =)
var load_jade_file = require('./src/load_jade_file.js').load_jade_file;
//Console colorizer
console.msg = require('./src/console.msg.js').msg;
//register
var register = require('./src/registration.js').registerUser;
var postAction = {};
postAction['/register'] = register;


var util = require('util'),
    http = require('http'),
    path = require('path');
var port = process.env.PORT || 3000;
//app init and server start
var app = express();
app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(express.static(__dirname + '/public'));
app.set('views', __dirname + '/web');
app.set('view engine', 'jade');

app.post('/register', function(request, response){
        //register(request);
        response.send('Hello World');
    });
app.get('*', function(request, response){
    console.msg.info("Message received");
    //load_static_file(request, response, '/web/www');
    if(request == "receive"){
        console.msg.info("Data received");
    }
    else load_jade_file(request, response, '/web');
    //response.render(path.join(process.cwd() + '/web', '/index.jade'), { title: 'My Site' });
});

app.listen(port, function(){
        console.msg.info('Web server (server.js) running at http://127.0.0.1:' + port + '/');
        console.msg.info('Current path: ' + __dirname);
    });