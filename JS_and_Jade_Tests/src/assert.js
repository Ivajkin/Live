/*globals exports: false, console: false */

(function() {
	var strict_assertion = true;
	
	exports.assert = function(expression, error_message) {
		if(!expression) {
			console.msg.error(error_message);
			if(strict_assertion) {
				throw error_message;
			}
		}
	};
	exports.ok = function(state, message) {
		if(state) {
			console.msg.info('✔ ' + message);
		} else {
			console.msg.error('✗ ' + message);
			throw -1;
		}
	};
	exports.equal = function(actual, expected, message) {
		if(actual == expected) {
			console.msg.info('✔ ' + message + '\n\tExpected: ' +  JSON.stringify(expected));
		} else {
			console.msg.error('✗ ' + message + '\n\tDifference: ' + JSON.stringify(actual) + "|" + JSON.stringify(expected));
			throw -1;
		}
	};
}) ();
