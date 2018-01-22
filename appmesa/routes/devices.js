'use strict';

var devicesController = require('../controller/devices/devices');

module.exports = {
  index: createIndexMiddlewares,
  authentication: createAuthenticationMiddlewares
};

function createIndexMiddlewares() {
	return [
		devicesController.indexMiddleware()
	];
}

function createAuthenticationMiddlewares() {
	return [
		devicesController.authenticationMiddleware()
	];
}