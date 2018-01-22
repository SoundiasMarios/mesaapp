'use strict';

module.exports = {
  checkRemberUserMiddleware
}

function checkRemberUserMiddleware(modelUsersSessions) {
    return (req, res, next)=> {
      var sessionID = req.cookies['stay_logged_in'];

      if(sessionID && (!req.session.simple_user) && (!req.session.admin_user)) {
        modelUsersSessions.getSessionByID(sessionID, (error, session)=> {
          if(error) {
            global.logger.info('In checkRemberUserMiddleware');
            var errorContainer = {status: 500, message: error};
            next(errorContainer);
          } else if(session===null) {
            next();
          } else {
            res.cookie('stay_logged_in', sessionID, { maxAge: 365 * 24 * 60 * 60 * 1000});
            if(session.user_role === 'simple_user') {
              req.session.simple_user = session.username;
              req.session.layout = 'user';
            }
            else {
              req.session.admin_user = session.username;
              req.session.layout = 'admin';
            }
            next();
          }
        });
      } else {
        next();
      }
    };
}