'use strict';

module.exports = {
  showProfileMiddleware,
  showAllUsersMiddleware,
  deleteUserSuccessMiddleware,
  deleteMyProfileSuccessMiddleware,
  showDevicesMiddleware,
  showOnScreenMiddleware,
  startPresentationMiddleware,
  stopPresentationMiddleware,
  restartPresentationMiddleware,
  deleteDeviceMiddleware
};

function showProfileMiddleware() {
	return (req, res) => {
  		res.render('users/showprofile', {user: req.userProfile, current_user: req.current_user, layout: req.session.layout, logged_user: req.current_user});
	};
}

function showAllUsersMiddleware() {
	return (req, res) => {
		res.render('admin_users/allusers', {users: req.allUsers, layout: req.session.layout, users_selected: true, allusers_selected: true, logged_user: req.current_user});
	};
}

function deleteUserSuccessMiddleware() {
	return (req, res) => {
		res.send('Ο χρήστης διαγράφηκε.');
	};
}

function deleteMyProfileSuccessMiddleware() {
	return (req, res) => {
		res.end();
	};
}

function showDevicesMiddleware(sockets) {
	return (req, res) => {
		res.render('admin_users/devices', {devices: sockets, layout: req.session.layout, logged_user: req.current_user, devices_selected: true,
			presentation_running: global.presentationRunning});
	};
}

function showOnScreenMiddleware(sockets) {
	return (req, res) => {
		var fingerprint = req.body.fingerprint;
	    var show = req.body.show;
	    
		if(sockets[fingerprint]){
			sockets[fingerprint].showOnScreen = (show == 'true');
			res.end();
		}
		else
			res.status(400).send('Device not found');
	};
}

function startPresentationMiddleware() {
	return (req, res) => {
		// console.log('PRESENTATION STARTED LOOK HERE');
		var startedBefore = req.startedBefore;
		if (startedBefore) {
			res.status(400).send('Η παρουσίαση έχει ήδη ξεκινήσει. Παρακαλώ κάνετε ανανέωση τη σελίδα.');
		} else {
			res.send('Η παρουσίαση ξεκίνησε.');
		}
    	
	};
}

function stopPresentationMiddleware() {
	return (req, res) => {
		// console.log('PRESENTATION ENDED LOOK HERE');
		var stoppedBefore = req.stoppedBefore;
		if (stoppedBefore) {
			res.status(400).send('Η παρουσίαση έχει ήδη τερματιστεί. Παρακαλώ κάνετε ανανέωση τη σελίδα.');
		} else {
			res.send('Η παρουσίαση τερματίστηκε.');
		}
	};
}

function restartPresentationMiddleware() {
	return (req, res) => {
		// console.log('RESTART PRESENTATION LOOK HERE');
		var stoppedBefore = req.stoppedBefore;
		if (stoppedBefore) {
			res.status(400).send('Η παρουσίαση έχει τερματιστεί. Παρακαλώ κάνετε ανανέωση τη σελίδα.');
		} else {
			res.send('Η παρουσίαση επανεκκίνηθηκε.');
		}
	};
}

function deleteDeviceMiddleware() {
	return (req, res) => {
		res.end('H συσκευή διαγράφηκε από τη λίστα.');
	};
}