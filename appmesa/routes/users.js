'use strict';

var userAuthentication = require('../components/user-authentication');
var permissionsValidator = require('../components/permissions-validator/users');
var argumentData = require('../components/argument-validator/users');
var accessData = require('../components/access-data/users');
var postsAccessData = require('../components/access-data/posts');
var usersController = require('../controller/users/users');

module.exports = {
	myProfile: createMyProfileMiddlewares,
	userProfile: createUserProfileMiddlewares,
	allUsers: createAllUsersMiddlewares,
	deleteUser: createDeleteUserMiddlewares,
	deleteMyProfile : createDeleteMyProfileMiddlewares,
	showDevices: createShowDevicesMiddlewares,
	showOnScreen: createShowOnScreenMiddlewares,
	startPresentation: createStartPresentationMiddlewares,
	stopPresentation: createStopPresentationMiddlewares,
	restartPresentation: createRestartPresentationMiddlewares,
	deleteDevice: createDeleteDeviceMiddlewares
};

function createMyProfileMiddlewares(modelUsersSessions) {	
	return [
		userAuthentication.checkRemberUserMiddleware(modelUsersSessions),
		permissionsValidator.checkMiddleware('BOTH'),
		accessData.myProfileMiddleware(),
		usersController.showProfileMiddleware()
	];
}

function createUserProfileMiddlewares(modelUsersSessions) {	
	return [
		userAuthentication.checkRemberUserMiddleware(modelUsersSessions),
		permissionsValidator.checkMiddleware('ADMIN'),
		argumentData.profileArgsMiddleware(),
		accessData.profileMiddleware(),
		usersController.showProfileMiddleware()
	];
}

function createAllUsersMiddlewares(modelUsersSessions) {	
	return [
		userAuthentication.checkRemberUserMiddleware(modelUsersSessions),
		permissionsValidator.checkMiddleware('ADMIN'),
		accessData.allUsersMiddleware(),
		usersController.showAllUsersMiddleware()
	];
}

function createDeleteUserMiddlewares(modelUsersSessions) {	
	return [
		userAuthentication.checkRemberUserMiddleware(modelUsersSessions),
		permissionsValidator.checkMiddleware('ADMIN'),
		accessData.deleteUserMiddleware(),
		usersController.deleteUserSuccessMiddleware()
	];
}

function createDeleteMyProfileMiddlewares(modelUsersSessions) {	
	return [
		userAuthentication.checkRemberUserMiddleware(modelUsersSessions),
		permissionsValidator.checkMiddleware('BOTH'),
		accessData.deleteMyProfileMiddleware(),
		usersController.deleteUserSuccessMiddleware()
	];
}

/***************** DEVICES *****************/

function createShowDevicesMiddlewares(sockets, modelUsersSessions) {	
	return [
		userAuthentication.checkRemberUserMiddleware(modelUsersSessions),
		permissionsValidator.checkMiddleware('ADMIN'),
		usersController.showDevicesMiddleware(sockets)
	];
}

function createShowOnScreenMiddlewares(sockets, modelUsersSessions) {	
	return [
		userAuthentication.checkRemberUserMiddleware(modelUsersSessions),
		permissionsValidator.checkMiddleware('ADMIN'),
		usersController.showOnScreenMiddleware(sockets)
	];
}

function createStartPresentationMiddlewares(modelUsersSessions) {	
	return [
		userAuthentication.checkRemberUserMiddleware(modelUsersSessions),
		permissionsValidator.checkMiddleware('ADMIN'),
		postsAccessData.startPresentationMiddleware(),
		usersController.startPresentationMiddleware()
	];
}

function createStopPresentationMiddlewares(modelUsersSessions) {	
	return [
		userAuthentication.checkRemberUserMiddleware(modelUsersSessions),
		permissionsValidator.checkMiddleware('ADMIN'),
		postsAccessData.stopPresentationMiddleware(),
		usersController.stopPresentationMiddleware()
	];
}

function createRestartPresentationMiddlewares(modelUsersSessions) {	
	return [
		userAuthentication.checkRemberUserMiddleware(modelUsersSessions),
		permissionsValidator.checkMiddleware('ADMIN'),
		postsAccessData.stopPresentationMiddleware(),
		postsAccessData.startPresentationMiddleware(),
		usersController.restartPresentationMiddleware()
	];
}

function createDeleteDeviceMiddlewares(modelUsersSessions) {	
	return [
		userAuthentication.checkRemberUserMiddleware(modelUsersSessions),
		permissionsValidator.checkMiddleware('ADMIN'),
		accessData.deleteDeviceMiddleware(),
		usersController.deleteDeviceMiddleware()
	];
}