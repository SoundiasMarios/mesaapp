'use strict';

var modelEvents = require('../../model/events');

module.exports = {
  checkMiddleware
};

function checkMiddleware() {
  return (req, res, next) => {
    if(req.session.admin_user){
      var postID = req.params.id;

      modelEvents.getEventByPostID(postID, (error, event)=> {
        if(error) {
          global.logger.info('In checkMiddleware');
          var errorContainer = {status: 500, message: error}
          next(errorContainer);
        } else if(event === null) {
          var errorContainer = {status: 400, message: 'Η ενέργεια αυτή δε μπορεί να πραγματοποιηθεί.'}
          next(errorContainer);
        } else {
          req.event = event;
          next();
        }
      });
    }
    else {
      var postID = req.params.id;
      var userID = req.current_user_id;

      modelEvents.getEventByPostIDUserID(postID, userID, (error, event)=> {
        if(error) {
          global.logger.info('In checkMiddleware');
          var errorContainer = {status: 500, message: error}
          next(errorContainer);
        } else if(event === null) {
          var errorContainer = {status: 400, message: 'Η ενέργεια αυτή δε μπορεί να πραγματοποιηθεί.'}
          next(errorContainer);
        } else {
          req.event = event;
          next();
        }
      });
    }
  };
}