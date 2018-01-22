'use strict';

var modelUsers = require('../../model/users');

module.exports = {
  	checkMiddleware
};

function checkMiddleware(access) {
	return (req, res, next) => {
		var username;

		if(access === 'ALL') {
			username = req.session.admin_user ? req.session.admin_user : req.session.simple_user;
			
			if (username !== undefined) {
				modelUsers.getUserIDByUsername(username, (error, userID)=>{
				  	if (error) {
				  		var errorContainer = {status: 400, message: error + 'Ο χρήστης δε βρέθηκε.'};
			          	next(errorContainer);
				  	} else if(userID === null) {
				  		res.redirect('/signout');	//// make signout here and then next
				  	} else {
				    	req.current_user_id = userID;
					    next();
				  	}
				});
			} else {
	      		next();
			}
	    } else if(access === 'ADMIN') {
			username = req.session.admin_user;

			if(username !== undefined) {
				modelUsers.getUserIDByUsername(username, (error, userID)=>{
				  	if (error) {
				  		var errorContainer = {status: 400, message: error};
			          	next(errorContainer);
				  	} else if(userID === null) {
				  		res.redirect('/signout');	//// make signout here and then next
				  	} else {
				    	req.current_user = username;
						req.current_user_id = userID;
					    next();
				  	}
				});
			} else {
				var errorContainer = {status: 500, message: 'Δεν έχετε πρόσβαση στο περιεχόμενο της σελίδας.'};
	          	next(errorContainer);
			}
		} else if(access === 'BOTH'){
			username = (req.session.simple_user) ? req.session.simple_user : req.session.admin_user;

			if(username !== undefined) {
				modelUsers.getUserIDByUsername(username, (error, userID)=>{
				  	if (error) {
				  		var errorContainer = {status: 400, message: error}
			          	next(errorContainer);
				  	} else if(userID === null) {
				  		res.redirect('/signout');	//// make signout here and then next
				  	} else {
				    	req.current_user = username;
						req.current_user_id = userID;
					    next();
				  	}
				});
			} else {
				var errorContainer = {status: 500, message: 'Δεν έχετε πρόσβαση στο περιεχόμενο της σελίδας.'};
				next(errorContainer);
			}
		} else {
			global.logger.info('Error in permissions-validator/users.checkMiddleware : access = ', access, ' is invalid.');
			var errorContainer = {status: 500, message: 'Σφάλμα συστήματος.'};
			next(errorContainer);
		}
	};
}