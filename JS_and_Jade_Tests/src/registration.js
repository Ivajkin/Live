var fs = require('fs');

exports.registerUser = function registerUser(info){
    console.log('login: ' + info.body.login);
    console.log('pass: ' + info.body.pass);
};



