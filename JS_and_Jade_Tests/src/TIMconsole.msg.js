/*globals require: false, exports: false */
/*
 * Console colorise module.
 */
var sys = require('sys'),
	fs = require('fs'),
	colors = require('colors'),
	winston = require('winston'),
	assert = require('./assert').assert;

function create_filelog(/** string */path) {
	assert( typeof path === 'string', 'Wrong argument in create_filelog() in console.msg.js');
	var logger = new (winston.Logger)({
		levels : {
			error : 0,
			warning : 1,
			info : 2,
			not_important : 3
		},
		transports : [
			new (winston.transports.File)({
				filename : "./logs/" + path,
				handleExceptions : true
			})]
	});
	winston.addColors({
		error : 'red',
		warning : 'yellow',
		info : 'green',
		not_important : 'blue'
	});
	return logger;
}

/**
 * Console info coloring for better usability. 
 */
var msg = {
	filelogger: create_filelog("common.log"),
	//filelog: function( /** string */ message, /** string */ logpath, /** boolean or undefined */ write_time) {
	//	assert(typeof message === 'string', 'Wrong 1st argument in console.msg.filelog() in console.msg.js file. message: ' + message);
	//	assert(typeof logpath === 'string', 'Wrong 2nd argument in console.msg.filelog() in console.msg.js file. logpath: ' + logpath);
	//	assert(typeof write_time === 'boolean' || typeof write_time === 'undefined', 'Wrong 3rd argument in console.msg.filelog() in console.msg.js file. write_time: ' + write_time);
	//	
	//	/*fs.open(logpath, 'a+', 0666, function(err, fd) {
	//		assert(!err, 'Error during filelog(): ' + err);
	//		var today = new Date();
	//
	//		fs.write(fd, ( write_time ? today.toUTCString() + ': ' : '') + message + '\n', null, 'utf8', function(err, written, buffer) {
	//			fs.close(fd);
	//		});
	//	});*/
	//	if(write_time) {
	//		var today = new Date();
	//		message = today.toUTCString() + ': ' + message;
	//	}
	//	this._fileloggers[logpath].info(message);
	//},
	/*
	 * Simple success information, green.
	 */
	info: function(message) {
		var messages = message.toString().split('\n');
		messages.forEach(function(message) {
			sys.puts(message.green);
			//this.filelog(message, "./logs/info.log", true);
			//this.filelog(message, "./logs/common.log", true);
			this.filelogger.info(message);
		}.bind(this));
	},
	/*
	 * Warning messages, yellow.
	 */
	warning: function(message) {
		var messages = message.toString().split('\n');
		messages.forEach(function(message) {
			sys.puts(message.yellow);
			//this.filelog(message, "./logs/warning.log", true);
			//this.filelog(message, "./logs/common.log", true);
			this.filelogger.warning(message);
		}.bind(this));
	},
	/*
	 * Errors, red.
	 */
	error: function(message) {
		var messages = message.toString().split('\n');
		messages.forEach(function(message) {
			sys.puts(message.red);
			//this.filelog(message, "./logs/error.log", true);
			//this.filelog(message, "./logs/common.log", true);
			this.filelogger.error(message);
		}.bind(this));
	},
	/*
	 * Not important, gray.
	 */
	not_important: function(message) {
		// !!!
		return;
		var messages = message.toString().split('\n');
		messages.forEach(function(message) {
			sys.puts(message.blue);
			//this.filelog(message, "./logs/not_important.log", true);
			//this.filelog(message, "./logs/common.log", true);
			this.filelogger.not_important(message);
		}.bind(this));
	}
};
// РќР° СЌРєСЃРїРѕСЂС‚.
exports.msg = msg;
