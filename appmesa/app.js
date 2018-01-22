var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bodyParser = require('body-parser');
var cron = require('node-cron');

/*** Data base ***/
// Start mongo db
// Don't export anything
require('./model/db');
var modelUsersSessions = require('./model/user_session');

var index = require('./routes/index');
var formsRouter = require('./routes/forms');
var usersRouter = require('./routes/users');
var postsRouter = require('./routes/posts');
var announcementsRouter = require('./routes/announcements');
var eventsRouter = require('./routes/events');
var searchRouter = require('./routes/search');
var devicesRouter = require('./routes/devices');
var imagesRouter = require('./routes/images');

var app = express();

var handlebars = require('./handlebars');
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: '2C44-4D44-WppQ38S',
    resave: false,
    saveUninitialized: true
}));

/******** Error logger ***********/
// creates a global variable : "global.logger",
// don't export anything
require('./logger');

/********  Presentation Variables  *******/
// initialize the sockets for devices to bind,
// creates a global variable : "global.sockets",
// don't export anything
require('./socket');
// global variables for start/stop presentation
global.presentationRunning = false;
global.promiseResolve;
global.timeoutArray;

/***************	Home 	***************/
app.get('/', index.home);
app.get('/signout', index.signout(modelUsersSessions));

/***************	Forms 	***************/
app.get('/forms/signup', formsRouter.signUp('GET', modelUsersSessions));
app.post('/forms/signup', formsRouter.signUp('POST', modelUsersSessions));

app.get('/forms/signin', formsRouter.signIn('GET', modelUsersSessions));
app.post('/forms/signin', formsRouter.signIn('POST', modelUsersSessions));

app.get('/forms/editprofile/:id', formsRouter.editProfile('GET', modelUsersSessions));
app.post('/forms/editprofile/:id', formsRouter.editProfile('POST', modelUsersSessions));

/***************	Users 	***************/
app.get('/users/myprofile', usersRouter.myProfile(modelUsersSessions));

app.get('/users/userprofile/:id', usersRouter.userProfile(modelUsersSessions));

app.get('/users/deletemyprofile', usersRouter.deleteMyProfile(modelUsersSessions));

app.delete('/admin_users/deleteuser/:id', usersRouter.deleteUser(modelUsersSessions));

app.get('/admin_users/allusers', usersRouter.allUsers(modelUsersSessions));

/***************	Admin users / devices	***************/
app.get('/admin_users/showdevices', usersRouter.showDevices(global.sockets, modelUsersSessions));

app.post('/admin_users/showonscreen', usersRouter.showOnScreen(global.sockets, modelUsersSessions));

app.get('/admin_users/startpresentation', usersRouter.startPresentation(modelUsersSessions));

app.get('/admin_users/stoppresentation', usersRouter.stopPresentation(modelUsersSessions));

app.get('/admin_users/restartpresentation', usersRouter.restartPresentation(modelUsersSessions));

app.delete('/admin_users/deletedevice/:id', usersRouter.deleteDevice(modelUsersSessions));

/***************	Posts 	***************/
app.get('/posts/all', postsRouter.all(modelUsersSessions));

app.get('/posts/all/next_posts/:page', postsRouter.nextAll(modelUsersSessions));

app.get('/posts/userposts', postsRouter.userPosts(modelUsersSessions));

app.get('/posts/next_userposts/:page', postsRouter.nextUserPosts(modelUsersSessions));

app.get('/posts/otherusersposts', postsRouter.otherUsersPosts(modelUsersSessions));

app.get('/posts/next_otherusersposts/:page', postsRouter.nextOtherUsersPosts(modelUsersSessions));

app.get('/posts/important', postsRouter.importantPosts(modelUsersSessions));

/***************	Announcements 	***************/
app.get('/announcements/all', announcementsRouter.all(modelUsersSessions));

app.get('/announcements/all/next_announcements/:page', announcementsRouter.nextAll(modelUsersSessions));

app.get('/announcements/announcement/:id', announcementsRouter.current(modelUsersSessions));

app.get('/announcements/new', announcementsRouter.new('GET', modelUsersSessions));
app.post('/announcements/new', announcementsRouter.new('POST', modelUsersSessions));

app.get('/announcements/edit/:id', announcementsRouter.edit('GET', modelUsersSessions));
app.post('/announcements/edit/:id', announcementsRouter.edit('POST', modelUsersSessions));

app.delete('/announcements/delete/:id', announcementsRouter.delete(modelUsersSessions));

app.get('/announcements/userannouncements', announcementsRouter.userAnnouncements(modelUsersSessions));

app.get('/announcements/next_userannouncements/:page', announcementsRouter.nextUserAnnouncements(modelUsersSessions));

/***************	Events 	***************/
app.get('/events/all', eventsRouter.all(modelUsersSessions));

app.get('/events/all/next_events/:page', eventsRouter.nextAll(modelUsersSessions));

app.get('/events/event/:id', eventsRouter.current(modelUsersSessions));

app.get('/events/new', eventsRouter.new('GET', modelUsersSessions));
app.post('/events/new', eventsRouter.new('POST', modelUsersSessions));

app.get('/events/edit/:id', eventsRouter.edit('GET', modelUsersSessions));
app.post('/events/edit/:id', eventsRouter.edit('POST', modelUsersSessions));

app.get('/events/cancel/:id', eventsRouter.cancel(modelUsersSessions));

app.delete('/events/delete/:id', eventsRouter.delete(modelUsersSessions));

app.get('/events/userevents', eventsRouter.userEvents(modelUsersSessions));

app.get('/events/next_userevents/:page', eventsRouter.nextUserEvents(modelUsersSessions));

/***************	Search 	***************/
app.get('/search/tag=:tag_name', searchRouter.searchByTag(modelUsersSessions));

app.get('/search/text=:query', searchRouter.searchByText(modelUsersSessions));

/***************	Devices 	***************/
app.get('/devices', devicesRouter.index());

app.get('/devices/authentication', devicesRouter.authentication());

/***************	Images 	***************/
app.get('/image/signup/:filename', imagesRouter.signUpImg(modelUsersSessions));

app.get('/image/userprofile/:username', imagesRouter.userProfileImg(modelUsersSessions));

app.get('/image/profile', imagesRouter.myProfileImg(modelUsersSessions));

app.get('/image/icons/:filename', imagesRouter.icon(modelUsersSessions));

app.get('/image/gallery/media/:folder/:file', imagesRouter.galleryImg(modelUsersSessions));

app.delete('/image/gallery/delete/media/:folder/:file', imagesRouter.galleryDeleteImg(modelUsersSessions));

// catch 404 and forward to error handler
app.use(function(req, res, next) {

  	var err = new Error('Not Found');
  	err.status = 404;
  	next(err);
});

// error handler
app.use(function(err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);

	var isAjaxRequest = req.xhr;
	if(isAjaxRequest) {
		res.send(err.message).end();
	} else {
		var layout = (req.session.layout) ? req.session.layout : 'default';
		var user = req.session.admin_user ? req.session.admin_user : req.session.simple_user;
		res.render('errors/error', {err: err, layout: layout, logged_user: user});
	}
});

cron.schedule('0 30 7 * * *', ()=>{
	
  	eventsRouter.unfinishedToFinished();

});

cron.schedule('0 0 8 * * *', ()=>{
	
	postsRouter.serverStartPresentation(()=>{
	})();

});

cron.schedule('0 0 21 * * *', ()=>{
	
	postsRouter.serverStopPresentation(()=>{
	})();

});

module.exports = app;
