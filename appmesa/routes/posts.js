'use strict';

var userAuthentication = require('../components/user-authentication');
var usersPermissionsValidator = require('../components/permissions-validator/users');
var accessData = require('../components/access-data/posts');
var postsController = require('../controller/posts/posts');

module.exports = {
  all: createAllPostsMiddlewares,
  nextAll: createNextAllPostsMiddlewares,
  userPosts: createUserPostsMiddlewares,
  nextUserPosts: createNextUserPostsMiddlewares,
  otherUsersPosts: createOtherUsersPostsMiddlewares,
  nextOtherUsersPosts: createNextOtherUsersPostsMiddlewares,
  importantPosts: createImportantPostsMiddlewares,
  serverStartPresentation: createServerStartPresentationMiddleware,
  serverStopPresentation: createServerStopPresentationMiddleware
};

function createAllPostsMiddlewares(modelUsersSessions) {
	return [
		userAuthentication.checkRemberUserMiddleware(modelUsersSessions),
		usersPermissionsValidator.checkMiddleware('ALL'),
		accessData.allMiddleware(),
		postsController.allPostsMiddleware()
	];
}

function createNextAllPostsMiddlewares(modelUsersSessions) {
	return [
		userAuthentication.checkRemberUserMiddleware(modelUsersSessions),
		usersPermissionsValidator.checkMiddleware('ALL'),
		accessData.nextAllMiddleware(),
		postsController.nextAllPostsMiddleware()
	];
}

function createUserPostsMiddlewares(modelUsersSessions) {
	return [
		userAuthentication.checkRemberUserMiddleware(modelUsersSessions),
		usersPermissionsValidator.checkMiddleware('BOTH'),
		accessData.userPostsMiddleware(),
		postsController.userPostsMiddleware()
	];
}

function createNextUserPostsMiddlewares(modelUsersSessions) {
	return [
		userAuthentication.checkRemberUserMiddleware(modelUsersSessions),
		usersPermissionsValidator.checkMiddleware('BOTH'),
		accessData.nextUserPostsMiddleware(),
		postsController.nextUserPostsMiddleware()
	];
}

function createOtherUsersPostsMiddlewares(modelUsersSessions) {
	return [
		userAuthentication.checkRemberUserMiddleware(modelUsersSessions),
		usersPermissionsValidator.checkMiddleware('ADMIN'),
		accessData.otherUsersPostsMiddleware(),
		postsController.otherUsersPostsMiddleware()
	];
}

function createNextOtherUsersPostsMiddlewares(modelUsersSessions) {
	return [
		/*userAuthentication.checkRemberUserMiddleware(modelUsersSessions),
		usersPermissionsValidator.checkMiddleware('ADMIN'),
		accessData.otherUsersPostsMiddleware(),
		postsController.otherUsersPostsMiddleware()*/
	];
}

function createImportantPostsMiddlewares(modelUsersSessions) {
	return [
		userAuthentication.checkRemberUserMiddleware(modelUsersSessions),
		usersPermissionsValidator.checkMiddleware('ALL'),
		accessData.allImportantMiddleware(),
		postsController.importantPostsMiddleware()
	];
}

function createServerStartPresentationMiddleware(next) {
	return accessData.serverStartPresentationMiddleware(next);
}

function createServerStopPresentationMiddleware(next) {
	return accessData.serverStopPresentationMiddleware(next);
}