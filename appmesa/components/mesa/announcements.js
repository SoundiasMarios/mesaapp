'use strict';

var Promise = require('promise');
var assert = require('assert');
var modelAnnouncements = require('../../model/announcements');

module.exports = {
	newAnnouncementPromises: createNewAnnouncementPromises,
  	editAnnouncementPromises: createEditAnnouncementPromises,
  	deleteAnnouncementPromises: createDeleteAnnouncementPromises,
  	importantAnnouncementPromises: createImportantAnnouncementPromises
};

function createNewAnnouncementPromises() {
	return {
		readSendData: function(req, userID) {
			return new Promise((resolve, reject)=> {
			    var title = req.body.title;
			    var content = req.body.content;
			    var en_title = req.body.en_title;
			    var en_content = req.body.en_content;
			    var pinned = req.body.pinned;

			    var tags = req.body.tags.split("#").filter(function(tag) {return tag.length != 0}).map(function(tag) {
				    return tag;
				});

			    en_title = (en_title=='') ? null : en_title;
			    en_content = (en_content=='') ? null : en_content;
			    
			    var newAnnouncement = new modelAnnouncements.Announcement({
			        title: title,
			        text: content,
			        en_title: en_title,
			        en_text: en_content,
			        pinned: pinned
			    });

		    	resolve([newAnnouncement, userID, tags]);
			});
		},
		saveAnnouncementToDB: function(args) {
			var newAnnouncement = args[0];
			var userID = args[1];
			var tags = args[2];

			return new Promise((resolve, reject)=> {
				modelAnnouncements.saveAnnouncement(newAnnouncement, (error, announcement)=> {
					if(error) {
						global.logger.info('In createNewAnnouncementPromises.saveAnnouncementToDB');
						var errorContainer = {status: 500, message: error};
						reject(errorContainer);
					} else
						resolve([announcement, 'announcement', userID, tags]);
				});
			});
		}
	};
}

function createEditAnnouncementPromises() {
	return {
		readSendData: function(req, announcementID) {
			return new Promise((resolve, reject)=> {
			    var title = req.body.title;
			    var content = req.body.content;
			    var en_title = req.body.en_title;
			    var en_content = req.body.en_content;
			    var pinned = req.body.pinned;

			    var tags = req.body.tags.split("#").filter(function(tag) {return tag.length != 0}).map(function(tag) {
				    return tag;
				});

			    en_title = (en_title=='') ? null : en_title;
			    en_content = (en_content=='') ? null : en_content;

			    var updateAnnouncement = ({
			        title : title,
			        text : content,
			        en_title: en_title,
			        en_text: en_content,
			        pinned: pinned
			    });

		    	resolve([announcementID, updateAnnouncement, tags]);
			});
		},
		updateAnnouncementToDB: function(args) {
			var announcementID = args[0];
			var updAnnouncement = args[1];
			var tags = args[2];
			return new Promise((resolve, reject)=> {
			    modelAnnouncements.updateAnnouncement(announcementID, updAnnouncement, (error)=> {
					if(error) {
						global.logger.info('In createEditAnnouncementPromises.updateAnnouncementToDB');
						var errorContainer = {status: 500, message: error};
						reject(errorContainer);
					} else
						resolve([announcementID, tags]);
				});
			});
		},
		updateAnnouncementTags: function(args) {
			var announcementID = args[0];
			var tags = args[1];
			return new Promise((resolve, reject)=> {
			    modelAnnouncements.updateAnnouncementTags(announcementID, tags, (error)=> {
				if(error) {
					global.logger.info('In createEditAnnouncementPromises.updateAnnouncementTags');
					var errorContainer = {status: 500, message: error};
					reject(errorContainer);
				} else
					resolve();
				});
			});
		}
	};
}

function createDeleteAnnouncementPromises() {
	return {
		deleteAnnouncementFromDB: function(postID, announcementID) {
			return new Promise((resolve, reject)=> {
			    modelAnnouncements.deleteAnnouncement(announcementID, (error)=> {
					if(error) {
						global.logger.info('In createDeleteAnnouncementPromises.deleteAnnouncementFromDB');
						var errorContainer = {status: 500, message: error};
						reject(errorContainer);
					} else {
		    			resolve(postID);
					}
				});
			});
		}
	};
}

function createImportantAnnouncementPromises() {
	return {
		pinnedAnnouncements: function(posts) {
			return new Promise((resolve, reject)=> {
			    modelAnnouncements.getPinnedAnnouncements((error, announcements)=> {
					if(error) {
						global.logger.info('In createPinnedAnnouncementPromises.deleteAnnouncementFromDB');
						var errorContainer = {status: 500, message: error};
						reject(errorContainer);
					} else {
						posts.pinnedAnnouncements = announcements;
		    			resolve(posts);
					}
				});
			});
		}
	};
}