'use strict';

module.exports = {
  editProfileArgsMiddleware: checkEditProfileArgsMiddleware
}

function checkEditProfileArgsMiddleware() {
  return (req, res, next) => {
  	var reqUser = req.params.id;

  	if(!reqUser) {
  		res.status(400).render('Σφάλμα. Παρακαλώ κάντε ανανέωση τη σελίδα.');
  	}else if((reqUser === req.current_user) || (req.session.admin_user)) {
  		req.reqUser = reqUser;
      req.showBtn = true;
  		next();
  	}else {
  		res.status(400).render('Σφάλμα. Παρακαλώ κάντε ανανέωση τη σελίδα.');
  	}
  };
}