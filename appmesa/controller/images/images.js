module.exports = {
	showSignUpImgMiddleware,
	showUserProfileImgMiddleware,
	showMyProfileImgMiddleware,
	showIconMiddleware,
	showGalleryImgMiddleware,
	successGalleryDeleteImgMiddleware
};

function showSignUpImgMiddleware() {
	return (req, res) => {
		res.writeHead(200, {'Content-Type': 'image/jpg' });
		res.end(req.img, 'binary');
  	};
}

function showUserProfileImgMiddleware() {
	return (req, res) => {
		res.writeHead(200, {'Content-Type': 'image/jpg' });
		res.end(req.img, 'binary');
  	};
}

function showMyProfileImgMiddleware() {
	return (req, res) => {
		res.writeHead(200, {'Content-Type': 'image/jpg' });
		res.end(req.img, 'binary');
  	};
}

function showIconMiddleware() {
	return (req, res) => {
		res.writeHead(200, {'Content-Type': 'image/png' });
		res.end(req.icon, 'binary');
  	};
}

function showGalleryImgMiddleware() {
	return (req, res) => {
		res.writeHead(200, {'Content-Type': 'image/png' });
		res.end(req.img, 'binary');
  	};
}

function successGalleryDeleteImgMiddleware() {
	return (req, res) => {
		res.send('Η εικόνα διαγράφηκε.');
  	};
}