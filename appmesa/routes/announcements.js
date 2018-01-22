'use strict';

var userAuthentication = require('../components/user-authentication');
var usersPermissionsValidator = require('../components/permissions-validator/users');
var announcementsPermissionsValidator = require('../components/permissions-validator/announcements');
var accessData = require('../components/access-data/announcements');
var announcementsController = require('../controller/posts/announcements');

module.exports = {
  all: createAllAnnouncementsMiddlewares,
  nextAll: createNextAllAnnouncementsMiddlewares,
  current: createCurrentAnnouncementMiddlewares,
  new: createNewAnnouncementMiddlewares,
  edit: createEditAnnouncementMiddlewares,
  delete: createDeleteAnnouncementMiddlewares,
  userAnnouncements: createUserAnnouncementsMiddlewares,
  nextUserAnnouncements: createNextUserAnnouncementsMiddlewares
};

function createAllAnnouncementsMiddlewares(modelUsersSessions) {
	return [
		userAuthentication.checkRemberUserMiddleware(modelUsersSessions),
		usersPermissionsValidator.checkMiddleware('ALL'),
		accessData.allMiddleware(),
		announcementsController.allAnnouncementsMiddleware()
	];
}

function createNextAllAnnouncementsMiddlewares(modelUsersSessions) {
	return [
		userAuthentication.checkRemberUserMiddleware(modelUsersSessions),
		usersPermissionsValidator.checkMiddleware('ALL'),
		accessData.nextAllMiddleware(),
		announcementsController.nextAllAnnouncementsMiddleware()
	];
}

function createCurrentAnnouncementMiddlewares(modelUsersSessions) {
	return [
		userAuthentication.checkRemberUserMiddleware(modelUsersSessions),
		usersPermissionsValidator.checkMiddleware('ALL'),
		accessData.currentMiddleware(),
		announcementsController.currentAnnouncementMiddleware()
	];
}

function createNewAnnouncementMiddlewares(action, modelUsersSessions) {
	if(action === 'GET') {
		return [
			userAuthentication.checkRemberUserMiddleware(modelUsersSessions),
			usersPermissionsValidator.checkMiddleware('BOTH'),
			announcementsController.newAnnouncementFormMiddleware()
		];
	}else if(action === 'POST') {
		return [
			userAuthentication.checkRemberUserMiddleware(modelUsersSessions),
			usersPermissionsValidator.checkMiddleware('BOTH'),
			accessData.newMiddleware(),
			announcementsController.newAnnouncementSuccessMiddleware()
		];
	}
}

function createEditAnnouncementMiddlewares(action, modelUsersSessions) {
	if(action === 'GET') {
		return [
			userAuthentication.checkRemberUserMiddleware(modelUsersSessions),
			usersPermissionsValidator.checkMiddleware('BOTH'),
			announcementsPermissionsValidator.checkMiddleware(),
			announcementsController.editAnnouncementFormMiddleware()
		];
	}else if(action === 'POST') {
		return [
			userAuthentication.checkRemberUserMiddleware(modelUsersSessions),
			usersPermissionsValidator.checkMiddleware('BOTH'),
			announcementsPermissionsValidator.checkMiddleware(),
			accessData.submitEditAnnouncementMiddleware(),
			announcementsController.editAnnouncementSuccessMiddleware()
		];
	}
}

function createDeleteAnnouncementMiddlewares(modelUsersSessions) {
	return [
		userAuthentication.checkRemberUserMiddleware(modelUsersSessions),
		usersPermissionsValidator.checkMiddleware('BOTH'),
		announcementsPermissionsValidator.checkMiddleware(),
		accessData.deleteMiddleware(),
		announcementsController.deleteAnnouncementMiddleware()
	];
}

function createUserAnnouncementsMiddlewares(modelUsersSessions) {
	return [
		userAuthentication.checkRemberUserMiddleware(modelUsersSessions),
		usersPermissionsValidator.checkMiddleware('BOTH'),
		accessData.userMiddleware(),
		announcementsController.userAnnouncementsMiddleware()
	];
}

function createNextUserAnnouncementsMiddlewares(modelUsersSessions) {
	return [
		userAuthentication.checkRemberUserMiddleware(modelUsersSessions),
		usersPermissionsValidator.checkMiddleware('BOTH'),
		accessData.nextUserMiddleware(),
		announcementsController.nextUserAnnouncementsMiddleware()
	];
}