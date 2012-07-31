var ansicodes = {
	'reset': '\033[0m',
	'bold': '\033[1m',
	'italic': '\033[3m',
	'underline': '\033[4m',
	'blink': '\033[5m',
	'black': '\033[30m',
	'red': '\033[31m',
	'green': '\033[32m',
	'yellow': '\033[33m',
	'blue': '\033[34m',
	'magenta': '\033[35m',
	'cyan': '\033[36m',
	'white': '\033[37m'
};
msg = {
    info: function(message){
        console.log(ansicodes['green'] + message + ansicodes['reset']);
    },
    warning:  function(message){
        console.log(ansicodes['yellow'] + message + ansicodes['reset']);
    },
    not_important:  function(message){
        console.log(ansicodes['white'] + message + ansicodes['reset']);
    },
    error: function(message){
        console.log(ansicodes['red']  + message + ansicodes['reset'] );
    }
};

exports.msg = msg;