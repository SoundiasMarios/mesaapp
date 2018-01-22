'use strict';

var glob = require('glob');
var fs = require('fs');
var _ = require('underscore');

var modelEvents = require('../../model/events');
var modelUsers = require('../../model/users');
var mesaEvents = require('../mesa/events');
var mesaPosts = require('../mesa/posts');

module.exports = {
	allMiddleware: allEventsMiddleware,
	nextAllMiddleware: nextAllEventsMiddleware,
	currentMiddleware: currentEventMiddleware,
  	newMiddleware: newEventMiddleware,
  	getEditEventDataMiddleware,
  	submitEditEventMiddleware,
  	cancelMiddleware: cancelEventMiddleaware,
  	deleteMiddleware: deleteEventMiddleware,
  	userMiddleware: userEventsMiddleware,
  	nextUserMiddleware: nextUserEventsMiddleware,
  	unfinishedToFinishedMiddleware: unfinishedToFinishedEventsMiddleware
};

function allEventsMiddleware() {
	return (req, res, next)=> {
		modelEvents.getAllEvents(0, (error, allEvents)=> {
			if(error) {
				global.logger.info('In allEventsMiddleware');
				var errorContainer = {status: 500, message: error}
				next(errorContainer);
			} else {
				req.allEvents = allEvents;
				next();
			}
		});
	};
}

function nextAllEventsMiddleware() {
return (req, res, next)=> {
		var page = req.params.page;

		modelEvents.getAllEvents(page, (error, nextAllEvents)=> {
			if(error) {
				global.logger.info('In nextAllEventsMiddleware');
				var errorContainer = {status: 500, message: error}
				next(errorContainer);
			} else {
				req.nextAllEvents = nextAllEvents;
				req.nextPage = (++page);
				next();
			}
		});
	};
}

function currentEventMiddleware() {
	return (req, res, next)=> {
		var postID = req.params.id;

		modelEvents.getEventByPostID(postID, (error, event)=> {
			if(error) {
				global.logger.info('In currentEventMiddleware');
				var errorContainer = {status: 500, message: error}
				next(errorContainer);
			} else {
				req.event = event;
				if (event.content.state == 'finished') {
					getGalleryByEventIDMidleware(event.content._id, (error, gallery)=> {
						if (error) {
							global.logger.info('In currentEventMiddleware');
							var errorContainer = {status: 500, message: error}
							next(errorContainer);
						} else {
			    			req.gallery = gallery;
							next();
						}
		    		});
				} else {
					next();
				}
			}
		});
	};
}

function newEventMiddleware() {
	return (req, res, next)=> {
		var userID = req.current_user_id;
		var successSave = function(post) {
			next();
		};

		var newEvent = mesaEvents.newEventPromises();

		newEvent.readSendData(req, res, userID)
	    .then(newEvent.saveEventToDB)
	    .then(mesaPosts.createPost)
	    .then(mesaPosts.savePostToDB)
	    .then(successSave)
	    .catch(function(error) {
	      	next(error);
	    });
	};
}

function getEditEventDataMiddleware() {
	return (req, res, next)=> {
		var id = req.event.content._id;
		var eventState = req.event.content.state;
		
		if (eventState == 'finished') {
    		getGalleryByEventIDMidleware(id, (error, gallery)=> {
    			if (error) {
    				global.logger.info('In getEditEventDataMiddleware');
					var errorContainer = {status: 500, message: error}
					next(errorContainer);
				} else {
	    			req.gallery = gallery;
					next();
				}
    		});
		} else {
			next();
		}
	};
}

function submitEditEventMiddleware() {
	return (req, res, next)=> {
		var eventID = req.event.content._id;
		var eventState = req.event.content.state;
		var postID = req.event._id;
		
		var successUpdate = function() {
			next();
		};

		var editEvent = mesaEvents.editEventPromises();

		editEvent.readSendData(req, res, eventID, eventState, postID)
		.then(editEvent.saveEventImages)
	    .then(editEvent.updateEventToDB)
	    .then(editEvent.updateEventTags)
	    .then(successUpdate)
	    .catch(function(error) {
	      	next(error);
	    });
	};
}

function cancelEventMiddleaware() {
	return (req, res, next)=> {
		var eventID = req.event.content._id;
		var eventState = req.event.content.state;

		if (eventState === 'canceled') {
			var errorContainer = {status: 500, message: 'Η ενέργεια δε μπορεί να πραγματοποιηθεί. Η εκήλωση έχει ήδη ακυρωθεί.'}
			next(errorContainer);
		} else if (eventState === 'finished') {
			var errorContainer = {status: 500, message: 'Η ενέργεια δε μπορεί να πραγματοποιηθεί. Η εκδήλωση έχει ολοκληρωθεί.'}
			next(errorContainer);
		} else {
			var updateEvent = ({
		        state: 'canceled'
		    });

		    modelEvents.updateEvent(eventID, updateEvent, (error)=> {
				if(error) {
					global.logger.info('In cancelEventMiddleaware');
					var errorContainer = {status: 500, message: error}
					next(errorContainer);
				} else {
					next();
				}
			});
		}
	};
}

function deleteEventMiddleware() {
	return (req, res, next)=> {
		var postID = req.params.id;

		var eventID = req.event.content._id;

		var successDelete = function() {
			next();
		};
		var deleteEvent = mesaEvents.deleteEventPromises();

	    deleteEvent.deleteEventFromDB(postID, eventID)
	    .then(deleteEvent.deleteEventGallery)
	    .then(mesaPosts.deletePost)
	    .then(successDelete)
	    .catch(function(error) {
	      	next(error);
	    });
	};
}

function userEventsMiddleware() {
	return (req, res, next)=> {
		var userID = req.current_user_id;
		modelEvents.getEventsByUserID(userID, 0, (error, userEvents)=> {
			if(error) {
				global.logger.info('In userEventsMiddleware');
				var errorContainer = {status: 500, message: error}
				next(errorContainer);
			} else {
				req.userEvents = userEvents;
				next();
			}
		});
	};
}

function nextUserEventsMiddleware() {
	return (req, res, next)=> {
		var userID = req.current_user_id;

		var page = req.params.page;

		modelEvents.getEventsByUserID(userID, page, (error, nextUserEvents)=> {
			if(error) {
				global.logger.info('In nextUserEventsMiddleware');
				var errorContainer = {status: 500, message: error}
				next(errorContainer);
			} else {
				req.nextUserEvents = nextUserEvents;
				req.nextPage = (++page);
				next();
			}
		});
	};
}

function unfinishedToFinishedEventsMiddleware() {
	var successUpdate = function() {
	};

	var finishedEvent = mesaEvents.finishedEventPromises();

	finishedEvent.getUnupdatedFinishedEvents()
    .then(finishedEvent.updateFinishedEvents)
    .then(successUpdate)
    .catch(function(error) {
      	next(error);
    });
}

function getGalleryByEventIDMidleware(id, next) {
	glob('media/' + id + '/*.*', null, function (error, files) {
		if(error) {
			global.logger.error('In getGalleryByEventIDMidleware', error);
			next('Σφάλμα συστήματος.', null);
		} else if (_.isEmpty(files)) {
			next(null, null);
		} else {
			next(null, files);
    	}
	});
}