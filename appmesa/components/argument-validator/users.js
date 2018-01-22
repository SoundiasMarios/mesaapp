'use strict';

module.exports = {
  profileArgsMiddleware: checkProfileArgsMiddleware
}

function checkProfileArgsMiddleware() {
  return (req, res, next) => {
  	var reqUser = req.params.id;

  	if(!reqUser) {
      res.status(400).render('Σφάλμα. Παρακαλώ κάντε ανανέωση τη σελίδα.');
  	}else if(reqUser === req.current_user) {
  		req.reqUser = reqUser;
  		next();
  	} else if(req.session.admin_user) {
  		req.reqUser = reqUser;
  		next();
  	}else {
      res.status(400).render('Σφάλμα. Παρακαλώ κάντε ανανέωση τη σελίδα.');
  	}
  };
}