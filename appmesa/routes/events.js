'use strict';

var userAuthentication = require('../components/user-authentication');
var usersPermissionsValidator = require('../components/permissions-validator/users');
var eventsPermissionsValidator = require('../components/permissions-validator/events');
var accessData = require('../components/access-data/events');
var eventsController = require('../controller/posts/events');

module.exports = {
  all: createAllEventsMiddlewares,
  nextAll: createNextAllEventsMiddlewares,
  current: createCurrentEventMiddlewares,
  new: createNewEventMiddlewares,
  edit: createEditEventMiddlewares,
  cancel: createCancelEventMiddlewares,
  delete: createDeleteEventMiddlewares,
  userEvents: createUserEventsMiddlewares,
  nextUserEvents: createNextUserEventsMiddlewares,
  unfinishedToFinished: createUnfinishedToFinishedEventsMiddlewares
};

function createAllEventsMiddlewares(modelUsersSessions) {
	return [
		userAuthentication.checkRemberUserMiddleware(modelUsersSessions),
		usersPermissionsValidator.checkMiddleware('ALL'),
		accessData.allMiddleware(),
		eventsController.allEventsMiddleware()
	];
}

function createNextAllEventsMiddlewares(modelUsersSessions) {
	return [
		userAuthentication.checkRemberUserMiddleware(modelUsersSessions),
		usersPermissionsValidator.checkMiddleware('ALL'),
		accessData.nextAllMiddleware(),
		eventsController.nextAllEventsMiddleware()
	];
}

function createCurrentEventMiddlewares(modelUsersSessions) {
	return [
		userAuthentication.checkRemberUserMiddleware(modelUsersSessions),
		usersPermissionsValidator.checkMiddleware('ALL'),
		accessData.currentMiddleware(),
		eventsController.currentEventMiddleware()
	];
}

function createNewEventMiddlewares(action, modelUsersSessions) {
	if(action === 'GET') {
		return [
			userAuthentication.checkRemberUserMiddleware(modelUsersSessions),
			usersPermissionsValidator.checkMiddleware('BOTH'),
			eventsController.newEventFormMiddleware()
		];
	}else if(action === 'POST') {
		return [
			userAuthentication.checkRemberUserMiddleware(modelUsersSessions),
			usersPermissionsValidator.checkMiddleware('BOTH'),
			accessData.newMiddleware(),
			eventsController.newEventSuccessMiddleware()
		];
	}
}

function createEditEventMiddlewares(action, modelUsersSessions) {
	if(action === 'GET') {
		return [
			userAuthentication.checkRemberUserMiddleware(modelUsersSessions),
			usersPermissionsValidator.checkMiddleware('BOTH'),
			eventsPermissionsValidator.checkMiddleware(),
			accessData.getEditEventDataMiddleware(),
			eventsController.editEventFormMiddleware()
		];
	}else if(action === 'POST') {
		return [
			userAuthentication.checkRemberUserMiddleware(modelUsersSessions),
			usersPermissionsValidator.checkMiddleware('BOTH'),
			eventsPermissionsValidator.checkMiddleware(),
			accessData.submitEditEventMiddleware(),
			eventsController.editEventSuccessMiddleware()
		];
	}
}

function createCancelEventMiddlewares(modelUsersSessions) {
	return [
		userAuthentication.checkRemberUserMiddleware(modelUsersSessions),
		usersPermissionsValidator.checkMiddleware('BOTH'),
		eventsPermissionsValidator.checkMiddleware(),
		accessData.cancelMiddleware(),
		eventsController.cancelEventMiddleware()
	];
}

function createDeleteEventMiddlewares(modelUsersSessions) {
	return [
		userAuthentication.checkRemberUserMiddleware(modelUsersSessions),
		usersPermissionsValidator.checkMiddleware('BOTH'),
		eventsPermissionsValidator.checkMiddleware(),
		accessData.deleteMiddleware(),
		eventsController.deleteEventMiddleware()
	];
}

function createUserEventsMiddlewares(modelUsersSessions) {
	return [
		userAuthentication.checkRemberUserMiddleware(modelUsersSessions),
		usersPermissionsValidator.checkMiddleware('BOTH'),
		accessData.userMiddleware(),
		eventsController.userEventsMiddleware()
	];
}

function createNextUserEventsMiddlewares(modelUsersSessions) {
	return [
		userAuthentication.checkRemberUserMiddleware(modelUsersSessions),
		usersPermissionsValidator.checkMiddleware('BOTH'),
		accessData.nextUserMiddleware(),
		eventsController.nextUserEventsMiddleware()
	];
}

function createUnfinishedToFinishedEventsMiddlewares() {
	return [
		accessData.unfinishedToFinishedMiddleware()
	];
}