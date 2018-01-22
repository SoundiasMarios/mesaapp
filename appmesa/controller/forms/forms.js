module.exports = {
  signupFormMiddleware,
  signupSuccessMiddleware,
  signinFormMiddleware,
  signinSuccessMiddleware,
  editProfileFormMiddleware,
  editProfileSuccessMiddleware
};

function signupFormMiddleware() {
	return (req, res) => {
    	res.render('forms/signup', {layout: req.session.layout, users_selected: true, createuser_selected: true, logged_user: req.current_user});
  	};
}

function signupSuccessMiddleware() {
	return (req, res) => {
    	res.send('Η εγγραφή του χρήστη έγινε με επιτυχία.');
  	};	
}

function signinFormMiddleware() {
  return (req, res) => {
  	if(req.session.simple_user || req.session.admin_user)
  		res.redirect('/');
    else
    	res.render('forms/signin', {layout: null});
  };
}

function signinSuccessMiddleware() {
	return (req, res) => {
		var role = req.body.role;

		if(role === 'simple_user') {
     	req.session.simple_user = req.username;
      req.session.layout = 'user';
    }
    else{
    	req.session.admin_user = req.username;
      req.session.layout = 'admin';
    }
    
  	res.status(200).end();
	};	
}

function editProfileFormMiddleware() {
	return (req, res) => {
		res.render('forms/editprofile', {user: req.userProfile, current_user: req.current_user, layout: req.session.layout, logged_user: req.current_user});
	};	
}

function editProfileSuccessMiddleware() {
	return (req, res) => {
		res.send('Οι αλλαγές αποθηκεύτηκαν.');
	};
}