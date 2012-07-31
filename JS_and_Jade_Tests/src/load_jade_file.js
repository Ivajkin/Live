/*globals require: false, exports: false, process: false, console: false */
"use strict";

(function() {
    var fs = require('fs'),
        path = require('path'),
        url = require('url'),
        mime = require('mime'),
        gzip = require('gzip');

    exports.load_jade_file = function load_jade_file(request, response, homefolder) {
        console.msg.not_important('Request header: ' + JSON.stringify(request.headers));

        var uri = url.parse(request.url).pathname;

        if(uri === '/' || uri === '/index') {
            uri = '/index.jade';
        }
        var filename = path.join(process.cwd() + homefolder, uri);
        console.msg.info("Loading static file: " + filename);
        path.exists(filename, function(exists) {
            if(!exists) {
                console.msg.error('! Error 404 no file. Path: ' + filename);
                response.writeHeader(404, {"Content-Type": "text/plain"});
                response.write("404 Not Found\n");
                response.end();
                return;
            }

            console.msg.not_important('Trying to detect mime type of file: "'+ uri + '"');
            var mime_type_string = mime.lookup(uri);
            console.msg.info('Mime type detected: "'+ mime_type_string + '"');

            var items = [{name:'Dean',food:'Chicken'}, {name:'Paul',food:'steak'}];
            
            //response.render(path.join(process.cwd() + '/web', uri));
            response.render(path.join(process.cwd() + '/web', uri), {
                items: items
            });
            //response.render(path.join(process.cwd() + '/web', '/index.jade'), { title: 'My Site' });
        });
    };
}) ();