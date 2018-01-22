'use strict';

var fs = require('fs');
var Promise = require('promise');
var _ = require('underscore');
var formidable = require('formidable');
var generatePassword = require('generate-password');
var glob = require('glob');
var email = require('../email');
var modelUsers = require('../../model/users');

module.exports = {
  signUpPromises: createSignUpPromises,
  editProfilePromises: createEditProfilePromises
};

function createSignUpPromises() {
	return {
		readSendData: function(req, res) {
			return new Promise((resolve, reject)=> {
	          	var form = new formidable.IncomingForm();
	        	form.parse(req, (error, fields, files)=> {
		            if (error) {
		            	global.logger.error('In createSignUpPromises.readSendData.parse -> ', error);
						var errorContainer = {status: 500, message: 'Σφάλμα συστήματος.'};
						reject(errorContainer);
					}

		            var password = generatePassword.generate({
		              length: 10,
		              upercase: true,
		              numbers: true
		          	});

		            var newUser = new modelUsers.User({
		                firstname : fields.firstname,
		                lastname : fields.lastname,
		                username : fields.username,
		                email : fields.email,
		                password : password,
		                birthdate : fields.birthdate,
		                gender : fields.gender,
		                city : fields.city,
		                phone : fields.phone,
		                moreinfo : fields.moreinfo,
		                role : fields.role
		            });

		            modelUsers.validateform(newUser, (error) => {
						if (error) {
							var errorContainer = {status: 500, message: 'Υπήρξε πρόβλημα κατα την εγγραφή του χρήστη στο σύστημα.<br>' + error};
							reject(errorContainer);
						} else {
		                	resolve([newUser, files, fields.username]);
		              }
		          	});
	          	});
	        });
		}, saveImage: function(args) {
			var newUser = args[0];
			var files = args[1];
			var imgname = args[2];
			return new Promise((resolve, reject)=> {
				if((!_.isEmpty(files))) {
				  fs.readFile(files.file.path, (error, data) => {
				    if(error) {
		            	global.logger.error('In createSignUpPromises.saveImage.readFile -> ', error);
						var errorContainer = {status: 500, message: 'Σφάλμα συστήματος.'};
						reject(errorContainer);
					}

				    var extend = files.file.name.split('.').pop();
				    var newPath = __dirname + '/../../media/' + imgname + '.' + extend;
				    fs.writeFile(newPath, data, (error) => {
				        if (error) {
					    	global.logger.error('In createSignUpPromises.saveImage.writeFile -> ', error);
					    	var errorContainer = {status: 500, message: 'Σφάλμα συστήματος.'};
							reject(errorContainer);
					    } else {
				          	resolve(newUser);
				        }
				      });
				  });
				} else {
				  	resolve(newUser);
				}
			});
		}, saveUserToDB: function(newUser) {
			return new Promise((resolve, reject)=> {
				modelUsers.saveUser(newUser, (error, user)=> {
					if(error) {
						global.logger.info('In createSignUpPromises.saveUserToDB');
						var errorContainer = {status: 500, message: error};
						reject(errorContainer);
					} else {
						email.sendmail(user.username, user.password, user.role, user.email);
						resolve(user);
					}
				});
			});
		}
	};
}

function createEditProfilePromises() {
	return {
		readSendData: function(req, username) {
			return new Promise((resolve, reject)=> {
				var form = new formidable.IncomingForm();
	        	form.parse(req, (error, fields, files)=> {
		            if (error) {
		            	global.logger.error('In createEditProfilePromises.readSendData.parse -> ', error);
						var errorContainer = {status: 500, message: 'Σφάλμα συστήματος.'};
						reject(errorContainer);
					}

					var updateUser;
		            if( (req.session.admin_user) && (req.session.admin_user!==fields.username) ) {
		            	updateUser = ({
			                firstname : fields.firstname,
			                lastname : fields.lastname,
			                username : fields.username,
			                email : fields.email,
			                birthdate : fields.birthdate,
			                gender : fields.gender,
			                city : fields.city,
			                phone : fields.phone,
			                moreinfo : fields.moreinfo
		            	});
		            }else  {
		            	updateUser = ({
			                firstname : fields.firstname,
			                lastname : fields.lastname,
			                username : fields.username,
			                email : fields.email,
			                password : fields.password,
			                birthdate : fields.birthdate,
			                gender : fields.gender,
			                city : fields.city,
			                phone : fields.phone,
			                moreinfo : fields.moreinfo
		            	});
		            }
		            
		        	resolve([updateUser, files, username, fields.username]);
				});
			});
		}, readImage: function(args) {
			var updateUser = args[0];
			var files = args[1];
			var oldUsername = args[2];
			var newUsername = args[3];
			return new Promise((resolve, reject)=> {
				if((!_.isEmpty(files))) {
				  fs.readFile(files.file.path, (error, data) => {
				    if(error) {
				    	global.logger.error('In createEditProfilePromises.readImage.readFile -> ', error);
				    	var errorContainer = {status: 500, message: 'Σφάλμα συστήματος.'};
						reject(errorContainer);
				    } else{
					    var extend = files.file.name.split('.').pop();
					    var path = __dirname + '/../../media/' + newUsername + '.' + extend;
				    	resolve([updateUser, oldUsername, {path, data}]);
				    }
				  });
				} else {
				  	resolve([updateUser, oldUsername, null]);
				}
			});
		}, updateUserToDB: function(args) {
			var updateUser = args[0];
			var oldUsername = args[1];
			var imgInfo = args[2];
			return new Promise((resolve, reject)=> {
				modelUsers.getUserIDByUsername(oldUsername, (error, userID)=> {
			        if(error) {
			        	global.logger.info('In updateUserToDB');
						var errorContainer = {status: 500, message: error};
						reject(errorContainer);
					} else {
			          	modelUsers.updateUser(userID, updateUser, (error)=> {
				            if(error) {
				            	global.logger.info('In updateUserToDB');
								var errorContainer = {status: 500, message: error};
								reject(errorContainer);
							} else{
				            	if(imgInfo) {
				            		saveImage(oldUsername, imgInfo, (error)=>{
				            			if(error) {
				            				global.logger.info('In updateUserToDB');
											var errorContainer = {status: 500, message: error};
											reject(errorContainer);
										} else {
				            				resolve();
										}
				            		});
				            	} else {
				            		resolve();
				            	}
				            }
			          	});
			        }
				});
			});
		}
	};
}

function saveImage(oldUsername, imgInfo, next) {
	glob('media/' + oldUsername + '.*', null, function (error, files) {
		if(error) {
	      global.logger.error('In saveImage.glob -> ', error);
	      next('Σφάλμα συστήματος.');
	    } else if (!_.isEmpty(files)) {
			fs.unlink(files[0], (error)=>{
				if(error) {
			      global.logger.error('In saveImage.unlink -> ', error);
			      next('Σφάλμα συστήματος.');
			    } else {
        			writeImage(imgInfo, (error)=>{
        				if(error) {
							global.logger.info('In saveImage.writeImage');
							next(error);
						} else {
        					next();
						}
        			});
				}
			});
		} else {
        	writeImage(imgInfo, (error)=>{
				if(error) {
			      global.logger.info('In saveImage.writeImage');
			      next('Σφάλμα συστήματος.');
			    } else {
					next();
				}
			});
    	}
	});
}

function writeImage(imgInfo, next) {
	fs.writeFile(imgInfo.path, imgInfo.data, (error) => {
		if (error) {
	      global.logger.error('In writeImage -> ', error);
	      next('Σφάλμα συστήματος.');
	    } else {
  			next();
		}
	});
}