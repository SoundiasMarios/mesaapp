'use strict';

var async = require('async');

var mesaPosts = require('../mesa/posts');
var mesaEvents = require('../mesa/events');
var mesaAnnouncements = require('../mesa/announcements');
var modelPosts = require('../../model/posts');
var modelEvents = require('../../model/events');
var settings = require('./../../settings');
var presentation = settings.presentation;

module.exports = {
	allMiddleware: allPostsMiddleware,
	nextAllMiddleware: nextAllPostsMiddleware,
	userPostsMiddleware,
	nextUserPostsMiddleware,
	otherUsersPostsMiddleware,
	allImportantMiddleware: allImportantPostsMiddleware,
	startPresentationMiddleware,
	stopPresentationMiddleware,
	serverStartPresentationMiddleware,
	serverStopPresentationMiddleware
};

function allPostsMiddleware() {
	return (req, res, next)=> {
		modelPosts.getAllPostsByPage(0, (error, allPosts)=> {
			if(error) {
  				global.logger.info('In allPostsMiddleware');
				var errorContainer = {status: 500, message: error}
				next(errorContainer);
			} else {
				req.allPosts = allPosts;
				next();
			}
		});
	};
}

function nextAllPostsMiddleware() {
return (req, res, next)=> {
		var page = req.params.page;

		modelPosts.getAllPostsByPage(page, (error, nextAllPosts)=> {
			if(error) {
				global.logger.info('In nextAllPostsMiddleware');
				var errorContainer = {status: 500, message: error}
				next(errorContainer);
			} else {
				req.nextAllPosts = nextAllPosts;
				req.nextPage = (++page);
				next();
			}
		});
	};
}

function userPostsMiddleware() {
	return (req, res, next)=> {
		var userID = req.current_user_id._id;

		modelPosts.getPostsByUserIDPage(userID, 0, (error, userPosts)=> {
			if(error) {
				global.logger.info('In userPostsMiddleware');
				var errorContainer = {status: 500, message: error}
				next(errorContainer);
			} else {
				req.userPosts = userPosts;
				next();
			}
		});
	};
}

function nextUserPostsMiddleware() {
	return (req, res, next)=> {
		var userID = req.current_user_id._id;
		var page = req.params.page;

		modelPosts.getPostsByUserIDPage(userID, page, (error, nextUserPosts)=> {
			if(error) {
				global.logger.info('In nextUserPostsMiddleware');
				var errorContainer = {status: 500, message: error}
				next(errorContainer);
			} else {
				req.nextUserPosts = nextUserPosts;
				req.nextPage = (++page);
				next();
			}
		});
	};
}

function otherUsersPostsMiddleware() {
	return (req, res, next)=> {
		var userID = req.current_user_id._id;

		modelPosts.getPostsExcludedCurUserByPage(userID, 0, (error, userPosts)=> {
			if(error) {
				global.logger.info('In otherUserPostsMiddleware');
				var errorContainer = {status: 500, message: error}
				next(errorContainer);
			} else {
				req.userPosts = userPosts;
				next();
			}
		});
	};
}

function getAllImportantPosts() {
	return (next)=> {
		var successRetrieve = function(importantPosts) {
			next(importantPosts);
		};

		var posts = {runningEvents: null, pinnedAnnouncements: null, upcomingEvents: null, finishedEvents: null};
		var importantEvents = mesaEvents.importantEventPromises();
		var importantAnnouncements = mesaAnnouncements.importantAnnouncementPromises();

		importantEvents.finishedEvents(posts)
		.then(importantAnnouncements.pinnedAnnouncements)
	    .then(importantEvents.upcomingEvents)
	    .then(importantEvents.runningEvents)
	    .then(successRetrieve)
	    .catch(function(error) {
	      	next(error);
	    });
	};
}

function getAllWithoutImportantPosts() {
	return (importantPosts, next)=> {
		modelPosts.getAllPostsWithoutImportant(0, importantPosts, (error, allPosts)=> {
			if(error) {
				global.logger.info('In getAllWithoutImportantPosts');
				var errorContainer = {status: 500, message: error}
				next(errorContainer);
			} else{
				next(allPosts);
			}
		});
	};
}


function allImportantPostsMiddleware() {
	return (req, res, next)=> {
		getAllImportantPosts()((importantPosts)=>{
        	console.log('importantPosts : ', importantPosts);
            next();
    	});
	};
}

function startPresentationMiddleware() {
	return (req, res, next)=> {
		if (!global.presentationRunning) {
			req.startedBefore = false;
			global.presentationRunning = true;

			var getPosts = createGetPostsPromises();
			var iteratePosts = createIteratePostsPromises();

			async.whilst(
			    function () {
			    	return global.presentationRunning;
			    },
			    function (nextLoop) {
					getPosts.getImportantPosts()
					.then(getPosts.getOtherPosts)
					.then(iteratePosts.allPosts)
					.then(nextLoop)
				    .catch(function(error) {
				      next(error);
				    });
			    },
			    function (err) {
			    }
			);
		} else {
			req.startedBefore = true;
		}

		next();
	}
}

function stopPresentationMiddleware() {
	return (req, res, next)=> {
		if (global.presentationRunning) {
			req.stoppedBefore = false;

			global.presentationRunning = false;
			global.promiseResolve();
			Object.keys(global.timeoutArray).forEach(function(i) {
				clearTimeout(global.timeoutArray[i]);
			});

			var data = {msg: 'server : STOP PRESENTATION'};
			
			Object.keys(global.sockets).forEach(function(index) {
				if(global.sockets[index].socket.connected) {	// && global.sockets[index].showOnScreen
					global.sockets[index].socket.emit('stop presentation', data);
				}
				else {
					console.log('NOT CONNECTED Status : ', global.sockets[index].socket.connected);
					console.log('NOT CONNECTED : ', index);
				}
			});
		} else {
			req.stoppedBefore = true;
		}

		next();
	}
}

function serverStartPresentationMiddleware(next) {
	return ()=> {
		if (!global.presentationRunning) {
			global.presentationRunning = true;

			var getPosts = createGetPostsPromises();
			var iteratePosts = createIteratePostsPromises();

			async.whilst(
			    function () {
			    	return global.presentationRunning;
			    },
			    function (nextLoop) {
					getPosts.getImportantPosts()
					.then(getPosts.getOtherPosts)
					.then(iteratePosts.allPosts)
					.then(nextLoop)
				    .catch(function(error) {
				      next(error);
				    });
			    },
			    function (err) {
			    }
			);
		}

		next();
	}
}

function serverStopPresentationMiddleware(next) {
	return ()=> {
		if (global.presentationRunning) {

			global.presentationRunning = false;
			global.promiseResolve();
			Object.keys(global.timeoutArray).forEach(function(i) {
				clearTimeout(global.timeoutArray[i]);
			});

			var data = {msg: 'server : STOP PRESENTATION'};
			
			Object.keys(global.sockets).forEach(function(index) {
				if(global.sockets[index].socket.connected) {	// && global.sockets[index].showOnScreen
					global.sockets[index].socket.emit('stop presentation', data);
				}
				else {
					console.log('NOT CONNECTED Status : ', global.sockets[index].socket.connected);
					console.log('NOT CONNECTED : ', index);
				}
			});
		}

		next();
	}
}

function createGetPostsPromises() {
	return {
		getImportantPosts: function() {
			return new Promise((resolve, reject)=> {
	            // console.log('\n\n\n\nIn getImportantPosts\n\n\n\n\n');
	            getAllImportantPosts()((importantPosts)=>{
	            	// console.log('importantPosts : ', importantPosts);
		            resolve(importantPosts);
	        	});
			});
		},
		getOtherPosts: function(importantPosts) {
			return new Promise((resolve, reject)=> {
				var importantPostsIDs = getImportantPostsIDs(importantPosts);
				getAllWithoutImportantPosts()(importantPostsIDs, (posts)=>{
					var otherPosts = {index: 0, step: presentation.simplePostLimit, length: posts.length, posts: posts};
					// console.log(posts, 'and importantPosts : ', importantPosts);
					var allPosts = {importantPosts: importantPosts, otherPosts: otherPosts};
					resolve(allPosts);
				});
			});
		}
	};
}

function createIteratePostsPromises() {
	return {
		allPosts: function(args) {
			var importantPosts = args.importantPosts;
			var otherPosts = args.otherPosts;

			var iteratePosts = createIteratePostsPromises();

			return new Promise((resolve, reject)=> {
				async.whilst(
				    function () {
				    	// console.log('index : ', otherPosts.index, ' and length : ', otherPosts.length);
				    	return (otherPosts.index < otherPosts.length) && (global.presentationRunning);
				    },
				    function (nextLoop) {

						iteratePosts.importantPosts(importantPosts, otherPosts)
						.then(iteratePosts.otherPosts)
						.then(nextLoop)
					    .catch(function(error) {
					      global.logger.info('In createIteratePostsPromises');
					    });
				        
				    },
				    function (err) {
				    	// console.log('Loop Iterate All Posts finished');
				    	resolve();
				    }
				);
			});
		},
		importantPosts: function(importantPosts, otherPosts) {
			return new Promise((resolve, reject)=> {
				if(global.global.presentationRunning) {
					var index = 0;
					var timeout;
					global.timeoutArray = [];

					Object.keys(importantPosts).forEach(function(i) {
						if (importantPosts[i]) {
							Object.keys(importantPosts[i]).forEach(function(j) {

					            timeout = setTimeout(function() {
									sendPost(importantPosts[i][j]);
									// console.log('qqqqqq : ', importantPosts[i][j], '\n\n');
					            }, (index)*presentation.sendPostTime);
					            global.timeoutArray.push(timeout);

					            index++;
							});
						}
					});

					timeout = setTimeout(function() {
						resolve(otherPosts);
				    }, index*presentation.sendPostTime)
				    global.timeoutArray.push(timeout);

					global.promiseResolve = resolve;
				} else {
					resolve();
				}
			});
		},
		otherPosts: function(otherPosts) {
			return new Promise((resolve, reject)=> {
				if(global.presentationRunning) {
					var index = otherPosts.index;
					var timeout;

					global.timeoutArray = [];

					for (var j = 0; (j < otherPosts.step) && ((index+j) < otherPosts.length); j++) {
						timeout = setTimeout(function() {
							// console.log('INDEX : ', index);
							sendPost(otherPosts.posts[index]);
							index++;
			            }, (j)*presentation.sendPostTime);

			            global.timeoutArray.push(timeout);
					}

					timeout = setTimeout(function() {
						otherPosts.index = otherPosts.index + j;
						resolve();
				    }, (j)*presentation.sendPostTime);
					global.timeoutArray.push(timeout);

					global.promiseResolve = resolve;
				} else {
					resolve();
				}
			});
		}
	};
}

function getImportantPostsIDs(importantPosts) {
	var importantPostsIDs = [];

	Object.keys(importantPosts).forEach(function(i) {
		if (importantPosts[i]) {
			Object.keys(importantPosts[i]).forEach(function(j) {
				importantPostsIDs.push(importantPosts[i][j]._id);
			});
		}
	});

	return importantPostsIDs;
}

function sendPost(post) {
	var epochTime = (new Date()).getTime();
	var data = {rtt: 0, posts: post};
		
	Object.keys(global.sockets).forEach(function(index) {
		if(global.sockets[index].socket.connected && global.sockets[index].showOnScreen) {
			data.rtt = global.sockets[index].rtt;
			global.sockets[index].socket.emit('start presentation', data);	//global.sockets[socket].socket.disconnect(true);
		} else {
			console.log('111111NOT CONNECTED Status : ', global.sockets[index].socket.connected);
			console.log('111111NOT CONNECTED : ', index);
		}
	});
}