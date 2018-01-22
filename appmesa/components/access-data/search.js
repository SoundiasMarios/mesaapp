'use strict';

var modelPosts = require('../../model/posts');
var mesaSearch = require('../mesa/search');

module.exports = {
	searchByTagMiddleware,
	searchByTextMiddleware
};

function searchByTagMiddleware() {
	return (req, res, next)=> {
		var tag = req.params.tag_name;
		
		modelPosts.getPostsByTag(tag, (error, posts)=> {
			if(error) {
				global.logger.info('In searchByTagMiddleware');
				var errorContainer = {status: 500, message: error}
				next(errorContainer);
			} else{
				req.posts = posts;
				req.tag = tag;
				next();
			}
		});
	};
}

function searchByTextMiddleware() {
	return (req, res, next)=> {
		var text = req.params.query;
		
		var successRetrieve = function(posts) {
			console.log('search posts : ', posts);
			req.posts = posts;
			req.text = text;
			next();
		};

		var searchPromises = mesaSearch.searchByTextPromises();

		searchPromises.searchAnnouncements(text)
	    .then(searchPromises.searchEvents)
	    .then(searchPromises.getResultIDs)
	    .then(searchPromises.getPosts)
	    .then(successRetrieve)
	    .catch(function(error) {
	      	next(error);
	    });
	};
}