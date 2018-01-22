'use strict';

var userAuthentication = require('../components/user-authentication');
var usersPermissionsValidator = require('../components/permissions-validator/users');
var accessData = require('../components/access-data/images');
var imagesController = require('../controller/images/images');

module.exports = {
	signUpImg: createSignUpImgMiddlewares,
	userProfileImg: createUserProfileImgMiddlewares,
	myProfileImg: createMyProfileImgMiddlewares,
	icon: createIconMiddlewares,
	galleryImg: createGalleryImgMiddlewares,
	galleryDeleteImg: createGalleryDeleteImgMiddlewares
};

function createSignUpImgMiddlewares(modelUsersSessions) {	
	return [
		userAuthentication.checkRemberUserMiddleware(modelUsersSessions),
		usersPermissionsValidator.checkMiddleware('ADMIN'),
		accessData.signUpImgMiddleware(),
		imagesController.showSignUpImgMiddleware()
	];
}

function createUserProfileImgMiddlewares(modelUsersSessions) {	
	return [
		userAuthentication.checkRemberUserMiddleware(modelUsersSessions),
		usersPermissionsValidator.checkMiddleware('BOTH'),
		accessData.userProfileImgMiddleware(),
		imagesController.showUserProfileImgMiddleware()
	];
}

function createMyProfileImgMiddlewares(modelUsersSessions) {	
	return [
		userAuthentication.checkRemberUserMiddleware(modelUsersSessions),
		usersPermissionsValidator.checkMiddleware('BOTH'),
		accessData.myProfileImgMiddleware(),
		imagesController.showMyProfileImgMiddleware()
	];
}

function createIconMiddlewares(modelUsersSessions) {	
	return [
		userAuthentication.checkRemberUserMiddleware(modelUsersSessions),
		usersPermissionsValidator.checkMiddleware('ALL'),
		accessData.iconMiddleware(),
		imagesController.showIconMiddleware()
	];
}

function createGalleryImgMiddlewares(modelUsersSessions) {	
	return [
		userAuthentication.checkRemberUserMiddleware(modelUsersSessions),
		usersPermissionsValidator.checkMiddleware('ALL'),
		accessData.galleryImgMiddleware(),
		imagesController.showGalleryImgMiddleware()
	];
}

function createGalleryDeleteImgMiddlewares(modelUsersSessions) {	
	return [
		userAuthentication.checkRemberUserMiddleware(modelUsersSessions),
		usersPermissionsValidator.checkMiddleware('BOTH'),
		accessData.galleryDeleteImgMiddleware(),
		imagesController.successGalleryDeleteImgMiddleware()
	];
}