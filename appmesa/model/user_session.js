'use strict';

var _ = require('underscore');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSessionSchema = new Schema({
  username: {
  	type: String,
    unique: true
  },
  user_role: String
});

var UsersSessions = mongoose.model('UsersSession', userSessionSchema);

function getAllSessions(next) {
	UsersSessions.find((error, sessions)=> {
	    if(error) {
	      global.logger.error('In getAllSessions -> ' + error);
	      next('Σφάλμα συστήματος.', null);
	    } else if(_.isEmpty(sessions)) {
	      next(null, null);
	    } else {
	      next(null, sessions);
	    }   
  	});
}

function getSessionByID(id, next) {
	UsersSessions.find({_id : id}, (error, session)=> {
		if(error) {
		  global.logger.error('In getSessionByID -> ' + error);
		  next('Σφάλμα συστήματος.', null);
		} else if(_.isEmpty(session)) {
		  next(null, null);
		} else {
		  next(null, session[0]);
		}     
	});
}

function getSessionIDByUsername(username, next) {
	UsersSessions.find({username : username}, {"_id": 1}, (error, id)=> {
		if(error) {
		  global.logger.error('In getSessionIDByUsername -> ' + error);
		  next('Σφάλμα συστήματος.', null);
		} else if(_.isEmpty(id)) {
		  next(null, null);
		} else {
			console.log(id);
		  next(null, id);
		}     
	});
}

function saveSession(username, role, next) {
	var newSession = new UsersSessions({
        username: username,
        user_role: role
    });

	newSession.save((error, session)=> {
	    if (error) {
	      global.logger.error('In saveSession -> ' + error);
	      next('Σφάλμα συστήματος.', null);
	    } else
	      next(null, session);
	});

}

function deleteSession(username, next) {
	UsersSessions.remove({username: username}, (error)=> {
	    if (error) {
	      global.logger.error('In deleteSession -> ' + error);
	      next('Σφάλμα συστήματος.');
	    } else {
	      next();
	    }
  	});
}

module.exports = {
	getAllSessions,
	getSessionByID,
	getSessionIDByUsername,
	saveSession,
	deleteSession
};