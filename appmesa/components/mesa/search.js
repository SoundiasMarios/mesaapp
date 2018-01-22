'use strict';

var Promise = require('promise');

var modelPosts = require('../../model/posts');
var modelAnnouncements = require('../../model/announcements');
var modelEvents = require('../../model/events');

module.exports = {
	searchByTextPromises: createSearchByTextPromises
};

function createSearchByTextPromises() {
	return {
		searchAnnouncements: function(text) {
			return new Promise((resolve, reject)=>{
				modelAnnouncements.getAnnouncementsBySearchQuery(text, (error, announcements)=> {
					if(error) {
						global.logger.info('In createSearchByTextPromises');
						var errorContainer = {status: 500, message: error};
						reject(errorContainer);
					} else {
    					resolve([announcements, text]);
					}
				});
			});
		},
		searchEvents: function(args) {
			var announcements = args[0];
			var text = args[1];

			return new Promise((resolve, reject)=>{
				modelEvents.getEventsBySearchQuery(text, (error, events)=> {
					if(error) {
						global.logger.info('In createSearchByTextPromises.searchEvents');
						var errorContainer = {status: 500, message: error};
						reject(errorContainer);
					} else {
						if (announcements && events) {
							var posts = announcements.concat(events);
	    					resolve(posts);	
						} else if (announcements) {
							resolve(announcements);	
						} else {
							resolve(events);	
						}
					}
				});
			});
		},
		getResultIDs: function(posts) {
			return new Promise((resolve, reject)=>{
				if (posts) {
					var ids = posts.map(function(value) {
					  	return value._id;
					});
					resolve(ids);
				} else {
					resolve(null);
				}
			});
		},
		getPosts: function(ids) {
			return new Promise((resolve, reject)=>{
				if (ids) {
					modelPosts.getPostsByIDArray(ids, (error, posts)=> {
						if(error) {
							global.logger.info('In createSearchByTextPromises.getPosts');
							var errorContainer = {status: 500, message: error};
							reject(errorContainer);
						} else{
							resolve(posts);
						}
					});
				} else {
					resolve(null);
				}
			});
		}
	}
}