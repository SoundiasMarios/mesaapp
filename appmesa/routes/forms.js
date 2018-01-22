'use strict';

var userAuthentication = require('../components/user-authentication');
var usersPermissionsValidator = require('../components/permissions-validator/users');
var argumentData = require('../components/argument-validator/forms');
var accessData = require('../components/access-data/forms');
var formsController = require('../controller/forms/forms');

module.exports = {
  signUp: createSignUpMiddlewares,
  signIn: createSignInMiddlewares,
  editProfile: createEditProfileMiddlewares
};

function createSignUpMiddlewares(action, modelUsersSessions) {
	if(action === 'GET') {
		return [
			userAuthentication.checkRemberUserMiddleware(modelUsersSessions),
			usersPermissionsValidator.checkMiddleware('ADMIN'),
			formsController.signupFormMiddleware()
		];
	}else if(action === 'POST') {
		return [
			userAuthentication.checkRemberUserMiddleware(modelUsersSessions),
			usersPermissionsValidator.checkMiddleware('ADMIN'),
			accessData.signupMiddleware(),
			formsController.signupSuccessMiddleware()
		];
	}
}

function createSignInMiddlewares(action, modelUsersSessions) {
	if(action === 'GET') {
		return [
			userAuthentication.checkRemberUserMiddleware(modelUsersSessions),
			usersPermissionsValidator.checkMiddleware('ALL'),
			formsController.signinFormMiddleware()
		];
	}else if(action === 'POST') {
		return [
			userAuthentication.checkRemberUserMiddleware(modelUsersSessions),
			usersPermissionsValidator.checkMiddleware('ALL'),
			accessData.signinMiddleware(modelUsersSessions),
			formsController.signinSuccessMiddleware()
		];
	}
}

function createEditProfileMiddlewares(action, modelUsersSessions) {
	if(action === 'GET') {
		return [
			userAuthentication.checkRemberUserMiddleware(modelUsersSessions),
			usersPermissionsValidator.checkMiddleware('BOTH'),
			argumentData.editProfileArgsMiddleware(),
			accessData.getEditProfileDataMiddleware(),
			formsController.editProfileFormMiddleware()
		];
	}else if(action === 'POST') {
		return [
			userAuthentication.checkRemberUserMiddleware(modelUsersSessions),
			usersPermissionsValidator.checkMiddleware('BOTH'),
			argumentData.editProfileArgsMiddleware(),
			accessData.sumbmitEditProfileMiddleware(),
			formsController.editProfileSuccessMiddleware()
		];
	}
}