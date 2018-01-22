'use strict';

var modelPosts = require('../model/posts');
var _ = require('underscore');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var announcementSchema = new Schema({
  title: String,
  text: String,
  en_title: String,
  en_text: String,
  pinned: Boolean
});

announcementSchema.index({"title": "text", "text": "text"}, {"weights": { "title": 3, "text":1 }});

var Announcement = mongoose.model('Announcement', announcementSchema);

// Announcement.collection.dropIndexes();

var contentInfo = {
  type: 'announcement',
  model: 'Announcement'
};

function getAllAnnouncements(num_skip, next) {
  return modelPosts.getPostsByType(contentInfo, num_skip, next);
}

function getAnnouncementByPostID(postID, next) {
  return modelPosts.getPostByTypePostID(contentInfo, postID, next);
}

function getAnnouncementsByUserID(userID, num_skip, next) {
  return modelPosts.getPostsByTypeUserID(contentInfo, userID, num_skip, next);
}

function getAnnouncementByPostIDUserID(postID, userID, next) {
  return modelPosts.getPostByTypePostIDUserID(contentInfo, postID, userID, next);
}

function saveAnnouncement(newAnnouncement, next) {
  newAnnouncement.save((error, announcement)=> {
    if (error) {
      global.logger.error('In saveAnnouncement -> ' + error);
      next('Σφάλμα συστήματος. Η αποθήκευση της ανακοίνωσης δε πραγματοποιήθηκε.', null);
    } else {
      next(null, announcement);
    }
  });
}

function updateAnnouncement(announcementID, updAnnouncement, next) {
  Announcement.update({_id: announcementID}, {$set: updAnnouncement}, (error, status)=> {
    if(error) {
      global.logger.error('In updateAnnouncement -> ' + error);
      next('Σφάλμα συστήματος. Η ενημέρωση της ανακοίνωσης δε πραγματοποιήθηκε.');
    } else
      next();
    }
  );
}

function updateAnnouncementTags(announcementID, tags, next) {
  return modelPosts.updatePostTagsByPostID(announcementID, tags, next);
}

function deleteAnnouncement(announcementID, next) {
  Announcement.remove({_id: announcementID}, (error)=> {
    if (error) {
      global.logger.error('In deleteAnnouncement -> ' + error);
      next('Σφάλμα συστήματος. Η διαγραφή της ανακοίνωσης δε πραγματοποιήθηκε.');
    }
    else {
      next();
    }
  });
}

function getAnnouncementsBySearchQuery(query, next) {
  Announcement.find(
    {$text: {$search: query}},
    {_id: 1}
  )
  .exec(function(error, announcements){
    if(error) {
      global.logger.error('In getAnnouncementsBySearchQuery -> ' + error);
      next('Σφάλμα συστήματος.', null);
    } else if(_.isEmpty(announcements)) {
      next(null, null);
    } else {
      next(null, announcements);
    }
  });
}

function getPinnedAnnouncements(next) {
  return modelPosts.getPinnedAnnouncementsPosts(next);
}

module.exports = {
  Announcement,
  getAllAnnouncements,
  getAnnouncementByPostID,
  getAnnouncementsByUserID,
  getAnnouncementByPostIDUserID,
  saveAnnouncement,
  updateAnnouncement,
  updateAnnouncementTags,
  deleteAnnouncement,
  getAnnouncementsBySearchQuery,
  getPinnedAnnouncements
};