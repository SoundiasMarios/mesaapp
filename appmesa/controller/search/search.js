'use strict';

module.exports = {
	searchByTagMiddleware,
	searchByTextMiddleware
};

function searchByTagMiddleware() {
	return (req, res) => {
		var layout = (req.session.layout) ? req.session.layout : 'default';
		var user = req.session.admin_user ? req.session.admin_user : req.session.simple_user;
  		res.render('search/tag', {posts: req.posts, tag: req.tag, layout: layout, logged_user: user});
  	};
}

function searchByTextMiddleware() {
	return (req, res) => {
		var layout = (req.session.layout) ? req.session.layout : 'default';
		var user = req.session.admin_user ? req.session.admin_user : req.session.simple_user;
  		res.render('search/text', {posts: req.posts, text: req.text, layout: layout, logged_user: user});
  	};
}