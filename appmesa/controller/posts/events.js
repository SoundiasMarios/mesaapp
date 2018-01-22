'use strict';

var settings = require('./../../settings');
var post_limits = settings.post_limits;

module.exports = {
	allEventsMiddleware,
	nextAllEventsMiddleware,
	currentEventMiddleware,
	newEventFormMiddleware,
	newEventSuccessMiddleware,
	editEventFormMiddleware,
	editEventSuccessMiddleware,
	cancelEventMiddleware,
	deleteEventMiddleware,
	userEventsMiddleware,
	nextUserEventsMiddleware
};

function allEventsMiddleware() {
	return (req, res) => {
		var layout = (req.session.layout) ? req.session.layout : 'default';
		var user = req.session.admin_user ? req.session.admin_user : req.session.simple_user;
  		res.render('posts/events/all', {events: req.allEvents, layout: layout, logged_user: user, posts_selected: true, events_selected: true, postsLimit: post_limits.page_post_limit});
	};
}

function nextAllEventsMiddleware() {
	return (req, res) => {
  		res.render('posts/events/nextAll', {events: req.nextAllEvents, page: req.nextPage, layout: null, postsLimit: post_limits.page_post_limit});
	};
}

function currentEventMiddleware() {
	return (req, res) => {
  		res.render('posts/events/current', {event: req.event, gallery: req.gallery, layout: null});
	};
}

function newEventFormMiddleware() {
	return (req, res) => {
  		res.render('posts/events/new', {layout: req.session.layout, logged_user: req.current_user, newpost_selected: true, newevent_selected: true});
	};
}

function newEventSuccessMiddleware() {
	return (req, res) => {
  		res.send('Η εκδήλωση δημοσιεύτηκε επιτυχώς.');
	};
}

function editEventFormMiddleware() {
	return (req, res) => {
  		res.render('posts/events/edit', {event: req.event, layout: req.session.layout, logged_user: req.current_user, gallery: req.gallery});
	};
}

function editEventSuccessMiddleware() {
	return (req, res) => {
		res.send('Οι αλλαγές αποθηκεύτηκαν.');
	};
}

function cancelEventMiddleware() {
	return (req, res) => {
		res.send('Η εκδήλωση ακυρώθηκε.');
	};
}

function deleteEventMiddleware() {
	return (req, res) => {
		res.send('Η εκδήλωση διαγράφηκε.');
	};
}

function userEventsMiddleware() {
	return (req, res) => {
		res.render('posts/events/userEvents', {userEvents: req.userEvents, layout: req.session.layout, logged_user: req.current_user, myposts_selected: true, myevents_selected: true, postsLimit: post_limits.page_post_limit});
	};
}

function nextUserEventsMiddleware() {
	return (req, res) => {
		res.render('posts/events/nextUserEvents', {userEvents: req.nextUserEvents, page: req.nextPage, layout: null, postsLimit: post_limits.page_post_limit});
	};
}