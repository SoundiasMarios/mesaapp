'use strict';

var settings = require('./../../settings');
var post_limits = settings.post_limits;

module.exports = {
	allPostsMiddleware,
	nextAllPostsMiddleware,
	userPostsMiddleware,
	nextUserPostsMiddleware,
	otherUsersPostsMiddleware,
	importantPostsMiddleware
};

function allPostsMiddleware() {
	return (req, res) => {
		var layout = (req.session.layout) ? req.session.layout : 'default';
		var user = req.session.admin_user ? req.session.admin_user : req.session.simple_user;
		res.render('posts/all', {posts: req.allPosts, layout: layout, logged_user: user, posts_selected: true, allposts_selected: true, postsLimit: post_limits.page_post_limit});
	};
}

function nextAllPostsMiddleware() {
	return (req, res) => {
  		res.render('posts/nextAll', {posts: req.nextAllPosts, page: req.nextPage, layout: null, postsLimit: post_limits.page_post_limit});
	};
}

function userPostsMiddleware() {
	return (req, res) => {
		res.render('posts/userPosts', {userPosts: req.userPosts, layout: req.session.layout, logged_user: req.current_user, myposts_selected: true, allmyposts_selected: true, postsLimit: post_limits.page_post_limit});
	};
}

function nextUserPostsMiddleware() {
	return (req, res) => {
		res.render('posts/nextUserPosts', {userPosts: req.nextUserPosts, page: req.nextPage, layout: null, postsLimit: post_limits.page_post_limit});
	};
}

function otherUsersPostsMiddleware() {
	return (req, res) => {
		res.render('posts/userPosts', {userPosts: req.userPosts, layout: req.session.layout, logged_user: req.current_user, users_selected: true,
			otherusersposts_selected: true, postsLimit: post_limits.page_post_limit});
	};
}

function importantPostsMiddleware() {
	return (req, res) => {
		res.end();
	};
}