'use strict';

var userAuthentication = require('../components/user-authentication');
var usersPermissionsValidator = require('../components/permissions-validator/users');
var accessData = require('../components/access-data/search');
var searchController = require('../controller/search/search');

module.exports = {
  searchByTag: createSearchByTagMiddlewares,
  searchByText: createSearchByTextMiddlewares
};

function createSearchByTagMiddlewares(modelUsersSessions) {
	return [
		userAuthentication.checkRemberUserMiddleware(modelUsersSessions),
		usersPermissionsValidator.checkMiddleware('ALL'),
		accessData.searchByTagMiddleware(),
		searchController.searchByTagMiddleware()
	];
}

function createSearchByTextMiddlewares(modelUsersSessions) {
	return [
		userAuthentication.checkRemberUserMiddleware(modelUsersSessions),
		usersPermissionsValidator.checkMiddleware('ALL'),
		accessData.searchByTextMiddleware(),
		searchController.searchByTextMiddleware()
	];
}