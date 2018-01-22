'use strict';

var modelAnnouncements = require('../../model/announcements');
var modelUsers = require('../../model/users');
var mesaAnnouncements = require('../mesa/announcements');
var mesaPosts = require('../mesa/posts');

module.exports = {
	allMiddleware: allAnnouncementsMiddleware,
	nextAllMiddleware: nextAllAnnouncementsMiddleware,
	currentMiddleware: currentAnnouncementMiddleware,
  	newMiddleware: newAnnouncementMiddleware,
  	getEditAnnouncementDataMiddleware,
  	submitEditAnnouncementMiddleware,
  	deleteMiddleware: deleteAnnouncementMiddleware,
  	userMiddleware: userAnnouncementsMiddleware,
  	nextUserMiddleware: nextUserAnnouncementsMiddleware
};

function allAnnouncementsMiddleware() {
	return (req, res, next)=> {
		modelAnnouncements.getAllAnnouncements(0, (error, allAnnouncements)=> {
			if(error) {
				global.logger.info('In allAnnouncementsMiddleware');
				var errorContainer = {status: 500, message: error}
				next(errorContainer);
			} else {
				req.allAnnouncements = allAnnouncements;
				next();
			}
		});
	};
}

function nextAllAnnouncementsMiddleware() {
	return (req, res, next)=> {
		var page = req.params.page;
		
		modelAnnouncements.getAllAnnouncements(page, (error, nextAllAnnouncements)=> {
			if(error) {
				global.logger.info('In nextAllAnnouncementsMiddleware');
				var errorContainer = {status: 500, message: error}
				next(errorContainer);
			} else {
				req.nextPage = (++page);
				req.nextAllAnnouncements = nextAllAnnouncements;
				next();
			}
		});
	};
}

function currentAnnouncementMiddleware() {
	return (req, res, next)=> {
		var postID = req.params.id;

		modelAnnouncements.getAnnouncementByPostID(postID, (error, announcement)=> {
			if(error) {
				global.logger.info('In currentAnnouncementMiddleware');
				var errorContainer = {status: 500, message: error}
				next(errorContainer);
			}
			else {
				req.announcement = announcement;
				next();
			}
		});
	};
}

function newAnnouncementMiddleware() {
	return (req, res, next)=> {
		var userID = req.current_user_id;
		var successSave = function(post) {
			next();
		};

		var newAnnouncement = mesaAnnouncements.newAnnouncementPromises();

		newAnnouncement.readSendData(req, userID)
	    .then(newAnnouncement.saveAnnouncementToDB)
	    .then(mesaPosts.createPost)
	    .then(mesaPosts.savePostToDB)
	    .then(successSave)
	    .catch(function(error) {
	      	next(error);
	    });
	};
}

function getEditAnnouncementDataMiddleware() {
	return (req, res, next)=> {
		var userID = req.current_user_id;

		var postID = req.params.id;

      	modelAnnouncements.getAnnouncementByPostIDUserID(postID, userID, (error, announcement)=> {
	        if(error){
	        	global.logger.info('In getEditAnnouncementDataMiddleware');
	        	var errorContainer = {status: 500, message: error}
				next(errorContainer);
	        } else {
				req.announcement = announcement;
				next();
	        }
      	});
	};
}

function submitEditAnnouncementMiddleware() {
	return (req, res, next)=> {
		var announcementID = req.announcement.content._id;

		var successUpdate = function() {
			next();
		};

		var editAnnouncement = mesaAnnouncements.editAnnouncementPromises();

		editAnnouncement.readSendData(req, announcementID)
	    .then(editAnnouncement.updateAnnouncementToDB)
	    .then(editAnnouncement.updateAnnouncementTags)
	    .then(successUpdate)
	    .catch(function(error) {
	      	next(error);
	    });
	};
}

function deleteAnnouncementMiddleware() {
	return (req, res, next)=> {
		var postID = req.params.id;
		var announcementID = req.announcement.content._id;

		var successDelete = function() {
			next();
		};
		var deleteAnnouncement = mesaAnnouncements.deleteAnnouncementPromises();

	    deleteAnnouncement.deleteAnnouncementFromDB(postID, announcementID)
	    .then(mesaPosts.deletePost)
	    .then(successDelete)
	    .catch(function(error) {
	      	next(error);
	    });
	};
}

function userAnnouncementsMiddleware() {
	return (req, res, next)=> {
		var userID = req.current_user_id;

		modelAnnouncements.getAnnouncementsByUserID(userID, 0,(error, userAnnouncements)=> {
			if(error) {
				global.logger.info('In userAnnouncementsMiddleware');
				var errorContainer = {status: 500, message: error}
				next(errorContainer);
			} else {
				req.userAnnouncements = userAnnouncements;
				next();
			}
		});
	};
}

function nextUserAnnouncementsMiddleware() {
	return (req, res, next)=> {
		var userID = req.current_user_id;

		var page = req.params.page;

		modelAnnouncements.getAnnouncementsByUserID(userID, page,(error, nextUserAnnouncements)=> {
			if(error) {
				global.logger.info('In nextUserAnnouncementsMiddleware');
				var errorContainer = {status: 500, message: error}
				next(errorContainer);
			} else {
				req.nextPage = (++page);
				req.nextUserAnnouncements = nextUserAnnouncements;
				next();
			}
		});
	};
}