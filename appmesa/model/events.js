'use strict';

var _ = require('underscore');
var modelPosts = require('../model/posts');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var eventSchema = new Schema({
  title: String,
  text: String,
  en_title: String,
  en_text: String,
  startDate: Date,
  endDate: Date,
  startTime: String,
  endTime: String,
  state: {
    type: String,
    enum: ['default', 'modified', 'canceled', 'finished']
  }
});

eventSchema.index({"title": "text", "text": "text"}, {"weights": { "title": 3, "text":1 }});

var Event = mongoose.model('Event', eventSchema);

// Event.collection.dropIndexes();

var contentInfo = {
  type: 'event',
  model: 'Event'
};

function validateDate(startDate, endDate, next) {
  var now = (new Date()).getTime();
  var start = (new Date(startDate)).getTime();
  var end = (new Date(endDate)).getTime();

  if(isNaN(start) || isNaN(end)){
    next('Οι ημερομηνίες είναι κενές.');
  }else if((now > start) || (start > end)) {
    next('Οι ημερομηνίες δεν είναι έγκυρες.');
  } else {
    next();
  }
}

function getAllEvents(num_skip, next) {
  return modelPosts.getPostsByType(contentInfo, num_skip, next);
}

function getEventByPostID(postID, next) {
  return modelPosts.getPostByTypePostID(contentInfo, postID, next);
}

function getEventsByUserID(userID, num_skip, next) {
  return modelPosts.getPostsByTypeUserID(contentInfo, userID, num_skip, next);
}

function getEventByPostIDUserID(postID, userID, next) {
  return modelPosts.getPostByTypePostIDUserID(contentInfo, postID, userID, next);
}

function saveEvent(newEvent, next) {
  newEvent.save((error, event)=> {
    if (error) {
      global.logger.error('In saveEvent -> ' + error);
      next('Σφάλμα συστήματος. Η αποθήκευση της εκδήλωσης δε πραγματοποιήθηκε.');
    } else
        next(null, event);
  });
}

function updateEvent(eventID, updEvent, next) {
  Event.update({_id: eventID}, {$set: updEvent}, (error, status)=> {
      if(error) {
        global.logger.error('In updateEvent -> ' + error);
        next('Σφάλμα συστήματος. Η ενημέρωση της εκδήλωσης δε πραγματοποιήθηκε.');
      } else
        next();
    }
  );
}

function updateEventTags(eventID, tags, next) {
  return modelPosts.updatePostTagsByPostID(eventID, tags, next);
}

function deleteEvent(eventID, next) {
  Event.remove({_id: eventID}, (error)=> {
    if (error) {
      global.logger.error('In deleteEvent -> ' + error);
      next('Σφάλμα συστήματος. Η διαγραφή της εκδήλωσης δε πραγματοποιήθηκε.');
    }
    else {
      next();
    }
  });
}

function getUpcomingEvents(next) {
  return modelPosts.getUpcomingEventsPosts(next);
}

function getRunningEvents(next) {
  return modelPosts.getRunningEventsPosts(next);
}

function getFinishedEvents(next) {
  return modelPosts.getFinishedEventsPosts(next);
}

function getUnupdatedFinishedEvents(next) {
  var now = new Date();

  Event
  .find({endDate: {$lt: now}, state: {$ne: 'ended'}}, {_id: 1})
  .exec((error, events)=> {
    if(error) {
      global.logger.error('In getUnupdatedFinishedEvents -> ' + error);
      next('Σφάλμα συστήματος.', null);
    } else if(_.isEmpty(events)) {
      next(null, null);
    } else {
      next(null, events);
    }
  });
}

function updateToFinishedEvents(finishedEvents, next) {
  Event.updateMany({_id: {$in: finishedEvents}}, {$set: {state: 'finished'}}, (error, status)=> {
  // Event.updateMany({}, {$set: {state: 'default'}}, (error, status)=> {
      if(error) {
        global.logger.error('In updateToFinishedEvents -> ' + error);
        next('Υπήρξε πρόβλημα κατα την ενημέρωση της Εκδήλωσης στο σύστημα.');
      }else
        next();
    }
  );
}

function getEventsBySearchQuery(query, next) {
  Event.find(
    {$text: {$search: query}},
    {_id: 1}
  )
  .exec(function(error, events){
    if(error) {
      global.logger.error('In getEventsBySearchQuery -> ' + error);
      next('Σφάλμα συστήματος.', null);
    } else if(_.isEmpty(events)) {
      next(null, null);
    } else {
      next(null, events);
    }
  });
}

module.exports = {
  Event,
  validateDate,
  getAllEvents,
  getEventByPostID,
  getEventsByUserID,
  getEventByPostIDUserID,
  saveEvent,
  updateEvent,
  updateEventTags,
  deleteEvent,
  getUpcomingEvents,
  getRunningEvents,
  getFinishedEvents,
  getUnupdatedFinishedEvents,
  updateToFinishedEvents,
  getEventsBySearchQuery
};