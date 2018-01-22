'use strict';

var modelUsers = require('../../model/users');
var mesaForms = require('../mesa/forms');

module.exports = {
  signupMiddleware,
  signinMiddleware,
  getEditProfileDataMiddleware,
  sumbmitEditProfileMiddleware
};

function signupMiddleware() {
  return (req, res, next) => { 

    var successSave = function(newUser) {
      next();
    };

    var SignUp = mesaForms.signUpPromises();

    SignUp.readSendData(req, res)
    .then(SignUp.saveImage)
    .then(SignUp.saveUserToDB)
    .then(successSave)
    .catch(function(error) {
      next(error);
    });
  };
}

function signinMiddleware(modelUsersSessions) {
  return (req, res, next) => {
    var username = req.body.username;
    var password = req.body.password;
    var role = req.body.role;
    var stay_logged_in = req.body.stay_logged_in;

    modelUsers.getUserByUsernamePasswordRole(username, password, role, (error, user)=> {
      if(error) {
        global.logger.info('In signinMiddleware');
        var errorContainer = {status: 500, message: error};
        next(errorContainer);
      } else if(user===null) {
        var errorContainer = {status: 400, message: 'Παρακαλώ ελέγξτε πάλι τα στοιχεία σας'};
        next(errorContainer);
      } else {
        if(stay_logged_in == 'true') {
          modelUsersSessions.getSessionIDByUsername(username, (error, sessionID)=> {
            if (error) {
              global.logger.info('In signinMiddleware');
              var errorContainer = {status: 500, message: error};
              next(errorContainer);
            } else if(sessionID) {
              res.cookie('stay_logged_in', sessionID, { maxAge: 365 * 24 * 60 * 60 * 1000});
              req.username = username;
              next();
            } else {
              modelUsersSessions.saveSession(username, role, (error, session)=> {
                if (error) {
                  global.logger.info('In signinMiddleware');
                  var errorContainer = {status: 500, message: error};
                  next(errorContainer);
                } else {
                  res.cookie('stay_logged_in', session._id, { maxAge: 365 * 24 * 60 * 60 * 1000});
                  req.username = username;
                  next();
                }
              });
            }
          });
        } else {
          req.username = username;
          next()
        }
      }
    });
  };
}

function getEditProfileDataMiddleware() {
  return (req, res, next) => {
    var username = req.reqUser;
    modelUsers.getUserByUsername(username, (error, user)=> {
      if(error) {
        global.logger.info('In getEditProfileDataMiddleware');
        var errorContainer = {status: 500, message: error};
        next(errorContainer);
      } else if(user === null)  {
        var errorContainer = {status: 400, message: 'Ο λογαριασμός του χρήστη δε βρέθηκε.'};
        next(errorContainer);
      } else {
        req.userProfile = user;
        next();
      }
    });
  };
}

function sumbmitEditProfileMiddleware() {
  return (req, res, next) => {
    var username = req.reqUser;

    var successUpdate = function() {
      next();
    };

    var EditProfile = mesaForms.editProfilePromises();

    EditProfile.readSendData(req, username)
    .then(EditProfile.readImage)
    .then(EditProfile.updateUserToDB)
    .then(successUpdate)
    .catch(function(error) {
      next(error);
    });
  };
}