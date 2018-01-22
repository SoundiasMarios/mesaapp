'use strict';

var modelEvents = require('../../model/announcements');

module.exports = {
  checkMiddleware
};

function checkMiddleware() {
  return (req, res, next) => {
    if(req.session.admin_user){
      var postID = req.params.id;

      modelEvents.getAnnouncementByPostID(postID, (error, announcement)=> {
        if(error) {
          global.logger.info('In checkMiddleware');
          var errorContainer = {status: 500, message: error}
          next(errorContainer);
        } else if(announcement === null) {
          var errorContainer = {status: 400, message: 'Η ενέργεια αυτή δε μπορεί να πραγματοποιηθεί.'}
          next(errorContainer);
        } else {
          req.announcement = announcement;
          next();
        }
      });
    }
    else {
      var postID = req.params.id;
      var userID = req.current_user_id;

      modelEvents.getAnnouncementByPostIDUserID(postID, userID, (error, announcement)=> {
        if(error) {
          global.logger.info('In checkMiddleware');
          var errorContainer = {status: 500, message: error}
          next(errorContainer);
        } else if(announcement === null) {
          var errorContainer = {status: 400, message: 'Η ενέργεια αυτή δε μπορεί να πραγματοποιηθεί.'}
          next(errorContainer);
        } else {
          req.announcement = announcement;
          next();
        }
      });
    }
  };
}