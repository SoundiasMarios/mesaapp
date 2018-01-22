module.exports = {
  indexMiddleware,
  authenticationMiddleware
};

function indexMiddleware() {
	return (req, res) => {
    	res.render('devices/index', {layout: null});
  	};
}

function authenticationMiddleware() {
	return (req, res) => {
    	res.render('devices/authentication', {layout: null});
  	};
}