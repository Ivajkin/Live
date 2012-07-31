/*globals require: false, exports: false, process: false, console: false */
"use strict";

(function() {
	
	var fs = require('fs'),
		path = require('path'),
		url = require('url'),
		mime = require('mime'),
		gzip = require('gzip');
	
	/*
	 * Main function for file loading.
	 */
	exports.load_static_file = function load_static_file(request, response, homefolder) {
		console.msg.not_important('Request header: ' + JSON.stringify(request.headers));
		
		var uri = url.parse(request.url).pathname;
		
		if(uri === '/') {
			uri = '/index.html';
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
			
			fs.stat(filename, function(err, stats) {
			    if (err || !stats.isFile()) {
			        console.msg.error('Something is wrong. fs.stats fails while loading static file.');
			    } else {
			        var etag = '"' + stats.ino + '-' + stats.size + '-' + Date.parse(stats.mtime) + '"';
					
			        //if etag in header['if-non-match'] => 304
			        //else serve file with etag
			        
					if (request.headers['if-none-match'] == etag) {
						console.msg.warning("304 Already Exist\n");
						response.writeHeader(304, {"Content-Type": "text/plain"});
						//response.write("304 Already Exist\n");
						response.end();
					    return;
					} else {
						fs.readFile(filename, "binary", function(err, file) {
							if(err) {
								console.msg.error(err);
								response.writeHeader(500, {"Content-Type": "text/plain"});
								response.write(err + "\n");
								response.end();
								return;
							}
							// TODO: "Expires: Thu, 01 Jan 1970 00:00:01 GMT"
							var headers = {
								"Content-Type": mime_type_string,
								etag: etag
							};
							// Если на хероку добавляем Expires:
							var at_heroku = !!(process.env.MONGOLAB_URI || process.env.MONGOHQ_URL);
							if(at_heroku) {
								var expiresDate = new Date();
								expiresDate.setMinutes(expiresDate.getMinutes() + 5);
								headers['Expires'] = expiresDate.toGMTString();
							}
							
							function send_data(data, headers) {
								response.writeHeader(200, headers);
								response.write(data, "binary");
								response.end();
							}
							// Если клиент поддерживает gzip сжимаем файл перед отдачей.
							// TODO: проблемы с кодировкой
							if(false) {//mime_type_string.indexOf('text') !== -1 && request.headers['accept-encoding'] && request.headers['accept-encoding'].indexOf('gzip') !== -1) {
								gzip(file, function(err, data) {
									if(err) {
										throw 'Gzip error in http server: ' + err;
									}
									
									headers['Content-Encoding'] = 'gzip';
									send_data(data, headers);
								});
							} else {
								send_data(file, headers);
							}
						});
					}
			    }
			});
		});
	};
}) ();
