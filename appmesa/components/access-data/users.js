"use strict";

var _ = require('underscore');
var glob = require('glob');
var fs = require('fs');
var modelUsers = require('../../model/users');
var modelDevices = require('../../model/devices');

module.exports = {
	myProfileMiddleware,
	profileMiddleware,
	allUsersMiddleware,
	deleteUserMiddleware,
	deleteMyProfileMiddleware,
	deleteDeviceMiddleware
};

function myProfileMiddleware() {
	return (req, res, next) => {
		var username = req.current_user;
		modelUsers.getUserByUsername(username, (error, user)=> {
			if(error) {
				global.logger.info('In myProfileMiddleware');
				var errorContainer = {status: 500, message: error}
				next(errorContainer);
			} else {
				req.userProfile = user;
				req.showBtn = true;
				next();
			}
		});
	};
}

function profileMiddleware() {
	return (req, res, next) => {
		var username = req.reqUser;
		modelUsers.getUserByUsername(username, (error, user)=> {
			if(error) {
				global.logger.info('In profileMiddleware');
				var errorContainer = {status: 500, message: error}
				next(errorContainer);
			} else {
				req.userProfile = user;
				next();
			}
		});
	};
}

function allUsersMiddleware() {
	return (req, res, next) => {
		modelUsers.getAllUsers((error, users)=> {
			if(error) {
				global.logger.info('In allUsersMiddleware');
				var errorContainer = {status: 500, message: error}
				next(errorContainer);
			} else {
				req.allUsers = users;
				next();
			}
		});
	};
}

function deleteUserMiddleware() {
	return (req, res, next) => {
	  	var reqUser = req.params.id;
	  	
	  	modelUsers.getUserIDByUsername(reqUser, (error, userID)=> {
	  		if(error) {
	  			global.logger.info('In deleteUserMiddleware');
				var errorContainer = {status: 500, message: error}
				next(errorContainer);
			} else if(userID === null) {
				var errorContainer = {status: 400, message: 'Ο χρήστης δε βρέθηκε.'}
				next(errorContainer);
			} else {
				modelUsers.deleteUser(userID, (error)=>{
					if(error) {
						global.logger.info('In deleteUserMiddleware');
						var errorContainer = {status: 500, message: error}
						next(errorContainer);
					}  else {
						glob('media/' + reqUser + '.*', null, (error, files)=> {
							if(error) {
								global.logger.error('In deleteUserMiddleware.glob -> ', error);
								var errorContainer = {status: 500, message: 'Σφάλμα συστήματος. '}
								next(errorContainer);
							} else if (!_.isEmpty(files)) {
								fs.unlink(files[0], (error)=>{
									if(error) {
										global.logger.error('In deleteUserMiddleware.unlink -> ', error);
										var errorContainer = {status: 500, message: 'Σφάλμα συστήματος.'}
										next(errorContainer);
									} else {
						    			next();
									}
								});
							} else {
						    	next();
							}
						});
					}
				});
			}
	  	});
	};
}

function deleteMyProfileMiddleware() {
	return (req, res, next) => {
	  	var reqUser = req.current_user;
	  	modelUsers.getUserIDByUsername(reqUser, (error, userID)=> {
	  		if(error) {
	  			global.logger.info('In deleteMyProfileMiddleware');
				var errorContainer = {status: 500, message: error}
				next(errorContainer);
			} else {
				modelUsers.deleteUser(userID, (error)=>{
					if(error) {
			  			global.logger.info('In deleteMyProfileMiddleware');
						var errorContainer = {status: 500, message: error}
						next(errorContainer);
					} else {
						glob('media/' + reqUser + '.*', null, (error, files)=> {
							if(error) {
					  			global.logger.error('In deleteMyProfileMiddleware.glob -> ', error);
								var errorContainer = {status: 500, message: 'Σφάλμα συστήματος.'}
								next(errorContainer);
							} else if (!_.isEmpty(files)) {
								fs.unlink(files[0], (error)=>{
									if(error) {
							  			global.logger.info('In deleteMyProfileMiddleware.unlink -> ', error);
										var errorContainer = {status: 500, message: 'Σφάλμα συστήματος.'}
										next(errorContainer);
									} else {
						    			next();
									}
								});
							} else 
						    	next();
						});
					}
				});
			}
	  	});
	};
}

function deleteDeviceMiddleware() {
	return (req, res, next) => {
		var device = req.params.id;

		if (!global.sockets[device]) {
			var errorContainer = {status: 400, message: 'Αποτυχία διαγραφής. Η συσκευή δε βρέθηκε.'}
			next(errorContainer);
		} else  {
			global.sockets[device].socket.emit('refresh');
			delete global.sockets[device];

			modelDevices.deleteDevice(device, (error)=>{
				next();
			});
		}
	};
}