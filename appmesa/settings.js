'use strict';

const post_limits = {
	page_post_limit: 4,	// posts per page
	soon_post_limit: 5,	// soon posts-events limit retrieve documents
	finished_post_limit: 5	// finished posts-events limit retrieve documents
};

const post_offsets = {
	soon_date_offset: 7,	// retrieve soon posts-events based on date offset number
	finished_date_offset: 4	// retrieve finished posts-events based on date_offset number
};

const presentation = {
	sendPostTime: 10000,	// send post to devices every 'sendPostTime'/100 seconds
	simplePostLimit: 2	// show on devices 'simplePostLimit' number of simple posts between important posts
};

const ports = {
	server: 3000,	// bind server to this port
	socket: 8089	// bind devices to listen to this port
}

module.exports = {
	post_limits,
	post_offsets,
	presentation,
	ports
};