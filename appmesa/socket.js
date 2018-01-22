'use strict';

var http = require('http');
var io = require('socket.io')(http);
var async = require('async');

var server = http.createServer();

var credentials = require('./credentials');
var settings = require('./settings');
var modelDevices = require('./model/devices');

io.attach(server);
server.listen(settings.ports.socket);

global.sockets = {};

io.on('connection', function(socket){

	socket.on('fingerprint', function(fingerprint){	// rename to "saveSocket"
		sockets[fingerprint].socket = socket;

		var rtt = 0;
		var i = 0, prev_index = -1, time_send, time_receive;

		socket.on('receive_rtt', function(){
        	time_receive = (new Date()).getTime();
        	rtt += time_receive - time_send;
        	i++;
        });

		async.whilst(
		    function () {
		    	return (i < 1);
		    },
		    function (nextLoop) {
		    	time_send = (new Date()).getTime();
		    	socket.emit('send_rtt');
		        
    			prev_index++;
		        setTimeout(function() {
	        		console.log('heree : ', i);
	        		
	        		if (prev_index == i) {
	        			nextLoop(true);
	        		}else {
	        			nextLoop();
	        		}
	            }, 1000);
		    },
		    function (err) {
		    	console.log(err);
		    	if (!err) {
					sockets[fingerprint].rtt = (rtt/10);
					var sendPostTime = settings.presentation.sendPostTime;
					socket.emit('rtt calculated', sendPostTime);

					console.log('rtt ; ' , sockets[fingerprint].rtt);
					console.log('device connected : ', socket.handshake.address, ' and fingerprint : ', fingerprint);
		    	}
		    }
		);
	});
	
	socket.on('authentication', (fingerprint)=> {	// rename to "checkAuthentication"
		if(sockets[fingerprint]) {
			socket.emit('AuthenticationStatus', 'SUCCESS');
		}
		else {
			modelDevices.getDeviceByFingerprint(fingerprint, (error, device)=>{
				if (error) {
					console.log('error', error);
				} else if(device) {
					sockets[fingerprint] = {socket: null, fingerprint: fingerprint, deviceName: device.name, showOnScreen: device.showOnScreen, rtt: 0};
					socket.emit('AuthenticationStatus', 'SUCCESS');
				} else {
					socket.emit('AuthenticationStatus', 'FAILED');
				}
			});
		}
	});

	socket.on('NewDevice', (fingerprint, key, deviceName)=> {
		if(key === credentials.authKEY) {
			sockets[fingerprint] = {socket: null, fingerprint: fingerprint, deviceName: deviceName, showOnScreen: false, rtt: 0};

			var newDevice = new modelDevices.Device({
		        name: deviceName,
				fingerprint: fingerprint,
				showOnScreen: false
		    });

		    modelDevices.saveDevice(newDevice, (error)=>{
				socket.emit('NewDeviceStatus', 'SUCCESS');
		    });
		}else {
			socket.emit('NewDeviceStatus', 'FAILED');
		}
	});

	socket.on('disconnect', function(){
		console.log('device disconnected : ', socket.handshake.address);
	});

	socket.emit('connection_established');
});