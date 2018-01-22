var winston = require('winston');

var config = winston.config;
global.logger = new (winston.Logger)({
  transports: [
    new (winston.transports.File)({
    	filename: 'mesa-debug.log',
    	json: false,
      timestamp: function() {
        return Date.now();
      },
      formatter: function(options) {
        if (options.level === 'error') {
        	return '[{type : ' + options.level + '}, {message : ' + (options.message ? options.message : '') + 
        	'}, {timestamp : ' + options.timestamp() + '}]';
        } else if(options.level === 'info') {
        	return '\t[{type : ' + options.level + '}, {message : ' + (options.message ? options.message : '') + '}]';
        } else {
        	return '[{type : ' + options.level + '}, {message : ' + (options.message ? options.message : '') + 
        	'}, {timestamp : ' + options.timestamp() + '}]';
        }
      }
    })
  ]
});