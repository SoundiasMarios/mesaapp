'use strict';

var settings = require('./../../settings');
var post_limits = settings.post_limits;

module.exports = {
	allAnnouncementsMiddleware,
	nextAllAnnouncementsMiddleware,
	currentAnnouncementMiddleware,
	newAnnouncementFormMiddleware,
	newAnnouncementSuccessMiddleware,
	editAnnouncementFormMiddleware,
	editAnnouncementSuccessMiddleware,
	deleteAnnouncementMiddleware,
	userAnnouncementsMiddleware,
	nextUserAnnouncementsMiddleware
};

function allAnnouncementsMiddleware() {
	return (req, res) => {
		var layout = (req.session.layout) ? req.session.layout : 'default';
		var user = req.session.admin_user ? req.session.admin_user : req.session.simple_user;
  		res.render('posts/announcements/all', {announcements: req.allAnnouncements, layout: layout, logged_user: user, posts_selected: true, announcements_selected: true, postsLimit: post_limits.page_post_limit});
	};
}

function nextAllAnnouncementsMiddleware() {
	return (req, res) => {
  		res.render('posts/announcements/nextAll', {announcements: req.nextAllAnnouncements, page: req.nextPage, layout: null, postsLimit: post_limits.page_post_limit});
	};
}

function currentAnnouncementMiddleware() {
	return (req, res) => {
  		res.render('posts/announcements/current', {announcement: req.announcement, layout: null});
	};
}

function newAnnouncementFormMiddleware() {
	return (req, res) => {
  		res.render('posts/announcements/new', {layout: req.session.layout, logged_user: req.current_user, newpost_selected: true, newannouncement_selected: true});
	};
}

function newAnnouncementSuccessMiddleware() {
	return (req, res) => {
  		res.send('Η ανακοίνωση δημοσιεύτηκε επιτυχώς.');
	};
}

function editAnnouncementFormMiddleware() {
	return (req, res) => {
  		res.render('posts/announcements/edit', {announcement: req.announcement, layout: req.session.layout, logged_user: req.current_user});
	};
}

function editAnnouncementSuccessMiddleware() {
	return (req, res) => {
		res.send('Οι αλλαγές αποθηκεύτηκαν.');
	};
}

function deleteAnnouncementMiddleware() {
	return (req, res) => {
		res.send('Η ανακοίνωση διαγράφηκε.');
	};
}

function userAnnouncementsMiddleware() {
	return (req, res) => {
		res.render('posts/announcements/userAnnouncements', {userAnnouncements: req.userAnnouncements, layout: req.session.layout, logged_user: req.current_user, myposts_selected: true, myannouncements_selected: true, postsLimit: post_limits.page_post_limit});
	};
}

function nextUserAnnouncementsMiddleware() {
	return (req, res) => {
		res.render('posts/announcements/nextUserAnnouncements', {userAnnouncements: req.nextUserAnnouncements, page: req.nextPage, layout: null, postsLimit: post_limits.page_post_limit});
	};
}