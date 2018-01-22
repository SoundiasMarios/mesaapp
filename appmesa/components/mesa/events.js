'use strict';

var Promise = require('promise');
var assert = require('assert');
var formidable = require('formidable');
var _ = require('underscore');
var fs = require('fs');
var async = require('async');

var modelEvents = require('../../model/events');

module.exports = {
	newEventPromises: createNewEventPromises,
  	editEventPromises: createEditEventPromises,
  	deleteEventPromises: createDeleteEventPromises,
  	importantEventPromises: createImportantEventPromises,
  	finishedEventPromises: createFinishedEventPromises
};

function createNewEventPromises() {
	return {
		readSendData: function(req, res, userID) {
			return new Promise((resolve, reject)=> {
			    var title = req.body.title;
			    var content = req.body.content;
			    var en_title = req.body.en_title;
			    var en_content = req.body.en_content;
			    var startDate = req.body.startdate;
			    var endDate = req.body.enddate;
			    var startTime = req.body.starttime;
			    var endTime = req.body.endtime;

			    var tags = req.body.tags.split("#").filter(function(tag) {return tag.length != 0}).map(function(tag) {
				    return tag;
				});

			    en_title = (en_title=='') ? null : en_title;
			    en_content = (en_content=='') ? null : en_content;

			    var newEvent = new modelEvents.Event({
			        title: title,
			        text: content,
			        en_title: en_title,
			        en_text: en_content,
			        startDate: startDate,
			        endDate: endDate,
			        startTime: startTime,
			        endTime: endTime,
			        state: 'default'
			    });

			    modelEvents.validateDate(startDate, endDate, (error) => {
	              	if (error) {
	              		var errorContainer = {status: 400, message: "Υπήρξε πρόβλημα κατα την δημιουργία της εκδήλωσης.<br>" + error};
	              		reject(errorContainer);
	              	} else {
	                	resolve([newEvent, userID, tags]);
	              	}
	          	});
			});
		},
		saveEventToDB: function(args) {
			var newEvent = args[0];
			var userID = args[1];
			var tags = args[2];

			return new Promise((resolve, reject)=> {
				modelEvents.saveEvent(newEvent, (error, event)=> {
					if(error) {
						global.logger.info('In createNewEventPromises.saveEventToDB');
						var errorContainer = {status: 500, message: error};
						reject(errorContainer);
					} else {
						resolve([event, 'event', userID, tags]);
					}
				});
			});
		}
	};
}

function createEditEventPromises() {
	return {
		readSendData: function(req, res, eventID, eventState, postID) {
			return new Promise((resolve, reject)=> {
				var form = new formidable.IncomingForm();
	        	form.parse(req, (error, fields, files)=> {
		            if (error) {
		            	global.logger.error('In createEditEventPromises.readSendData.parse -> ', error);
						var errorContainer = {status: 500, message: 'Σφάλμα συστήματος.'};
						reject(errorContainer);
					}

				    var en_title = fields.en_title;
				    var en_content = fields.en_content;
				    var reset = fields.reset;

				    var state;
				   	if (reset=='true') {
				   		state = 'modified';
				   	} else {
				   		state = (eventState=='default') ? 'modified' : eventState;
				   	}

				    var tags = fields.tags.split("#").filter(function(tag) {return tag.length != 0}).map(function(tag) {
					    return tag;
					});

				    en_title = (en_title=='') ? null : en_title;
				    en_content = (en_content=='') ? null : en_content;

				    var updateEvent = ({
				        title : fields.title,
				        text : fields.content,
				        en_title: en_title,
				        en_text: en_content,
				        startDate: fields.startDate,
				        endDate: fields.endDate,
				        startTime: fields.startTime,
				        endTime: fields.endTime,
				        state: state
				    });

				    /*
						// edw elegxw tis hmeromhnies, prepei na ginei tropopoihsh gia na elegxete mono an to startDate<endDate
							kai na parablepsw ton elegxo now<startDate
				    modelEvents.validateDate(startDate, endDate, (error) => {
		              if (error) {
		                res.status(400).send("Υπήρξε πρόβλημα κατα την ενημέρωση της Εκδήλωσης.<br>" + error);
		              }else {
		                resolve([eventID, updateEvent]);
		              }
		          	});*/
		          	resolve([eventID, updateEvent, tags, files, postID]);
	          	});
			});
		},
		saveEventImages: function(args) {
			var eventID = args[0];
			var updateEvent = args[1];
			var tags = args[2];
			var files = args[3];
			var postID = args[4];

			Object.size = function(obj) {
			    var size = 0, key;
			    for (key in obj) {
			        if (obj.hasOwnProperty(key)) size++;
			    }
			    return size;
			};

			return new Promise((resolve, reject)=> {
				if((!_.isEmpty(files))) {
					var biggerImgNumberName = 0;

					var galleryDir = __dirname + '/../../media/' + eventID;
					if (!fs.existsSync(galleryDir)){
					    fs.mkdirSync(galleryDir);
					} else {
					    var getNumberFileNames = function(dirPath) {
					      	try { var files = fs.readdirSync(dirPath); }
					      	catch(e) { return; }
					      	var numberNames = [];
					      	if (files.length > 0) {
						        for (var i = 0; i < files.length; i++) {
						          // console.log('file : ', files[i]);
						          numberNames.push(Number(files[i].split(".")[0]));
						        }
						        return numberNames;
				        	} else {
				        		return null;
				        	}
					    };

					    var names = getNumberFileNames(galleryDir);
					    biggerImgNumberName = (names) ? (Math.max.apply(Math, names) + 1) : 0;
					}

				    var i = 0, curImg;
					async.whilst(
					    function () {
					    	return (i < Object.size(files));
					    },
					    function (nextLoop) {
					    	curImg = files['' + i + ''];

							fs.readFile(curImg.path, (error, data) => {
								if(error) {
							    	global.logger.error('In createEditEventPromises.saveEventImages.readFile -> ', error);
							    	var errorContainer = {status: 500, message: 'Σφάλμα συστήματος.'};
									reject(errorContainer);
							    }

								var extend = curImg.name.split('.').pop();
								var path = galleryDir + '/' + (i + biggerImgNumberName) + '.' + extend;
								fs.writeFile(path, data, (error) => {
								    if (error) {
								    	global.logger.error('In createEditEventPromises.saveEventImages.writeFile -> ', error);
								    	var errorContainer = {status: 500, message: 'Σφάλμα συστήματος.'};
										reject(errorContainer);
								    } else {
								      	i++;
								      	nextLoop();
								    }
							  	});
							});
					    },
					    function (error) {
					    	if (error)  {
					    		global.logger.error('In createEditEventPromises.saveEventImages.whilst -> ', error);
								var errorContainer = {status: 500, message: 'Σφάλμα συστήματος.'};
								reject(errorContainer);
							} else { 
					    		resolve([eventID, updateEvent, tags]);
					    	}
					    }
					);
				} else {
				  	resolve([eventID, updateEvent, tags]);
				}
			});
		},
		updateEventToDB: function(args) {
			var eventID = args[0];
			var updEvent = args[1];
			var tags = args[2];
			return new Promise((resolve, reject)=> {
			    modelEvents.updateEvent(eventID, updEvent, (error)=> {
					if(error) {
						global.logger.info('In createEditEventPromises.updateEventToDB');
						var errorContainer = {status: 500, message: error};
						reject(errorContainer);
					} else
						resolve([eventID, tags]);
				});
			});
		},
		updateEventTags: function(args) {
			var eventID = args[0];
			var tags = args[1];
			return new Promise((resolve, reject)=> {
			    modelEvents.updateEventTags(eventID, tags, (error)=> {
				if(error) {
					global.logger.info('In createEditEventPromises.updateEventTags');
					var errorContainer = {status: 500, message: error};
					reject(errorContainer);
				} else
					resolve();
				});
			});
		}
	};
}

function createDeleteEventPromises() {
	return {
		deleteEventFromDB: function(postID, eventID) {
			return new Promise((resolve, reject)=> {
			    modelEvents.deleteEvent(eventID, (error)=> {
					if(error) {
						global.logger.info('In createDeleteEventPromises.deleteEventFromDB');
						var errorContainer = {status: 500, message: error};
						reject(errorContainer);
					} else {
		    			resolve([postID, eventID]);
					}
				});
			});
		},
		deleteEventGallery: function(args) {
			var postID = args[0]
			var eventID = args[1];

			return new Promise((resolve, reject)=> {
			    var galleryDir = __dirname + '/../../media/' + eventID;
				if (fs.existsSync(galleryDir)){
					var rmDir = function(dirPath) {
				      	try { var files = fs.readdirSync(dirPath); }
				      	catch(e) { return; }
				      	if (files.length > 0)
				        	for (var i = 0; i < files.length; i++) {
				          		var filePath = dirPath + '/' + files[i];
				          		if (fs.statSync(filePath).isFile()) {
				            		fs.unlinkSync(filePath);
				          		} else {
				            		rmDir(filePath);
				            	}
				        	}
				      	fs.rmdirSync(dirPath);
				    };

				    rmDir(galleryDir);

				    resolve(postID);
				} else {
					resolve(postID);
				}
			});
		}
	};
}

function createImportantEventPromises() {
	return {
		finishedEvents: function(posts) {
			return new Promise((resolve, reject)=>{
				modelEvents.getFinishedEvents((error, events)=> {
					if(error) {
						global.logger.info('In createImportantEventPromises.finishedEvents');
						var errorContainer = {status: 500, message: error};
						reject(errorContainer);
					} else {
						posts.finishedEvents = events;
    					resolve(posts);
					}
				});
			});
		},
		upcomingEvents: function(posts) {
			return new Promise((resolve, reject)=>{
				modelEvents.getUpcomingEvents((error, events)=> {
					if(error) {
						global.logger.info('In createImportantEventPromises.upcomingEvents');
						var errorContainer = {status: 500, message: error};
						reject(errorContainer);
					} else {
						posts.upcomingEvents = events;
		    			resolve(posts);
					}
				});
			});
		},
		runningEvents: function(posts) {
			return new Promise((resolve, reject)=>{
				modelEvents.getRunningEvents((error, events)=> {
					if(error) {
						global.logger.info('In createImportantEventPromises.runningEvents');
						var errorContainer = {status: 500, message: error};
						reject(errorContainer);
					} else {
						posts.runningEvents = events;
						resolve(posts);
					}
				});
			});
		}
	}
}

function createFinishedEventPromises() {
	return {
		getUnupdatedFinishedEvents: function() {
			return new Promise((resolve, reject)=>{
				modelEvents.getUnupdatedFinishedEvents((error, events)=> {
					if(error) {
						global.logger.info('In createFinishedEventPromises.getUnupdatedFinishedEvents');
						var errorContainer = {status: 500, message: error};
						reject(errorContainer);
					} else {
						resolve(events);
					}
				});
			});
		},
		updateFinishedEvents: function(eventsToUpdate) {
			return new Promise((resolve, reject)=>{
				modelEvents.updateToFinishedEvents(eventsToUpdate, (error)=> {
					if(error) {
						global.logger.info('In createFinishedEventPromises.updateFinishedEvents');
						var errorContainer = {status: 500, message: error};
						reject(errorContainer);
					} else {
		    			resolve();
					}
				});
			});
		}
	};
}