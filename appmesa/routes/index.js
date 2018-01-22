// var express = require('express');
// var router = express.Router();

function home(req, res) {
	/*if(req.session.simple_user) {
		console.log('logged in as user : ', req.session.simple_user);
  		//res.render('users/home', {username : req.session.simple_user, layout: req.session.layout});
		//res.location('forms');
	} else if(req.session.admin_user) {
		console.log('logged in as admin : ', req.session.admin_user);
  		//res.render('admin_users/home', {username : req.session.admin_user, layout: req.session.layout});
	} else {
		console.log('not logged in');
		console.log('cookie', req.cookies['stay_logged_in']);
		//res.render('home');
	}*/
	res.redirect('posts/all');
};

function signout(modelUsersSessions) {
	return (req, res) => {
		/*if(req.session.simple_user || req.session.admin_user) {
			var current_user = (req.session.simple_user) ? req.session.simple_user : req.session.admin_user;
			modelUsersSessions.deleteSession(current_user, (error)=>{
				res.clearCookie('stay_logged_in');
				req.session.destroy();
    			res.redirect('/');
			});
		}else {
			res.redirect('/');
		}*/
		res.clearCookie('stay_logged_in');
		req.session.destroy();
		res.redirect('/');
		// res.status(200).end();
    }
};

module.exports = {
	home,
	signout
};
