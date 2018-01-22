'use strict';

var fs = require('fs');
var glob = require('glob');
var _ = require('underscore');
var modelUsers = require('../../model/users');

module.exports = {
	signUpImgMiddleware,
	userProfileImgMiddleware,
	myProfileImgMiddleware,
	iconMiddleware,
	galleryImgMiddleware,
	galleryDeleteImgMiddleware
};

function signUpImgMiddleware() {
	return (req, res, next)=> {
		var filename = req.params.filename;
		fs.readFile('media/' + filename + '.jpg', (error, img)=>{
			if(error) {
				global.logger.error('In signUpImgMiddleware -> ', error);
				var errorContainer = {status: 500, message: 'Σφάλμα συστήματος.'};
				next(errorContainer);
			} else {
				req.img = img;
				next();
			}
		});
	};
}

function userProfileImgMiddleware() {
	return (req, res, next)=> {
		var username = req.params.username;
		glob('media/' + username + '.*', null, function (error, files) {
			if(error) {
				global.logger.error('In userProfileImgMiddleware.glob -> ', error);
				var errorContainer = {status: 500, message: 'Σφάλμα συστήματος.'};
				next(errorContainer);
			} else if(!_.isEmpty(files)) {
				fs.readFile(files[0], (error, img)=>{
					if(error) {
						global.logger.error('In userProfileImgMiddleware.readFile -> ', error);
						var errorContainer = {status: 500, message: 'Σφάλμα συστήματος.'};
						next(errorContainer);
					} else {
						req.img = img;
						next();
					}
				});
			} else {
				modelUsers.getUserByUsername(username, (error, user)=>{
					if(error) {
						global.logger.info('In userProfileImgMiddleware');
						var errorContainer = {status: 500, message: error};
						next(errorContainer);
					} else {
						var filename;
						switch (user.gender) {
			                case 'default':
			                    filename = 'd';
			                    break;
			                case 'male':
			                    filename = 'm_d';
			                    break;
			                case 'female':
			                    filename = 'f_d';
			                    break;
			                default:
			                    res.status(500).send('ERROR');
			            }
						fs.readFile('media/' + filename + '.jpg', (error, img)=>{
							if(error) {
								global.logger.error('In userProfileImgMiddleware.readFile -> ', error);
								var errorContainer = {status: 500, message: 'Σφάλμα συστήματος.'};
								next(errorContainer);
							} else {
								req.img = img;
								next();
							}
						});
					}
				});
			}
		});
	};
}

function myProfileImgMiddleware() {
	return (req, res, next)=> {
		var username = req.current_user;
		glob('media/' + username + '.*', null, function (error, files) {
			if(error) {
				global.logger.error('In myProfileImgMiddleware.glob -> ', error);
				var errorContainer = {status: 500, message: 'Σφάλμα συστήματος.'};
				next(errorContainer);
			} else if(!_.isEmpty(files)) {
				fs.readFile(files[0], (error, img)=>{
					if(error) {
						global.logger.error('In myProfileImgMiddleware.readFile -> ', error);
						var errorContainer = {status: 500, message: 'Σφάλμα συστήματος.'};
						next(errorContainer);
					} else {
						req.img = img;
						next();
					}
				});
			}
			else{
				modelUsers.getUserByUsername(username, (error, user)=>{
					if(error) {
						global.logger.info('In myProfileImgMiddleware');
						var errorContainer = {status: 500, message: error};
						next(errorContainer);
					} else {
						var filename;
						switch (user.gender) {
			                case 'default':
			                    filename = 'd';
			                    break;
			                case 'male':
			                    filename = 'm_d';
			                    break;
			                case 'female':
			                    filename = 'f_d';
			                    break;
			                default:
			                    res.status(500).send('ERROR');
			            }
						fs.readFile('media/' + filename + '.jpg', (error, img)=>{
							if(error) {
								global.logger.error('In myProfileImgMiddleware.readFile -> ', error);
								var errorContainer = {status: 500, message: 'Σφάλμα συστήματος.'};
								next(errorContainer);
							} else {
								req.img = img;
								next();
							}
						});
					}
				});
			}
		});
	};
}

function iconMiddleware() {
	return (req, res, next)=> {
		var filename = req.params.filename;
		fs.readFile('media/icons/' + filename, (error, icon)=>{
			if(error) {
				global.logger.error('In iconMiddleware -> ', error);
				var errorContainer = {status: 500, message: 'Σφάλμα συστήματος.'};
				next(errorContainer);
			} else {
				req.icon = icon;
				next();
			}
		});
	};
}

function galleryImgMiddleware() {
	return (req, res, next)=> {
		var folder = req.params.folder;
		var file = req.params.file;
		fs.readFile('media/' + folder + '/' + file, (error, img)=>{
			if(error) {
				global.logger.error('In galleryImgMiddleware -> ', error);
				var errorContainer = {status: 500, message: 'Σφάλμα συστήματος.'};
				next(errorContainer);
			} else {
				req.img = img;
				next();
			}
		});
	};
}

function galleryDeleteImgMiddleware() {
	return (req, res, next)=> {
		var folder = req.params.folder;
		var file = req.params.file;
		fs.unlink('media/' + folder + '/' + file, (error)=>{
			if(error) {
				global.logger.error('In galleryDeleteImgMiddleware -> ', error);
				var errorContainer = {status: 500, message: 'Σφάλμα συστήματος.'};
				next(errorContainer);
			} else {
				next();
			}
		});
	};
}