'use strict';

var Promise = require('promise');
var modelUsers = require('../../model/users');
var modelPosts = require('../../model/posts');

module.exports = {
  createPost,
  savePostToDB,
  deletePost
};

function createPost(args) {
	var content = args[0];
	var contentType = args[1];
	var userID = args[2];
	var tags = args[3];

	return new Promise((resolve, reject)=> {
		var newPost = new modelPosts.Post({
			type: contentType,
	        postedBy: userID,
	        content: content._id,
	        tags: tags
	    });
		return resolve(newPost);
	});
}

function savePostToDB(newPost) {
	return new Promise((resolve, reject)=> {
		modelPosts.savePost(newPost, (error, post)=>{
			if(error)
				return reject(error);
			else
				return resolve(post);
		});
	});
}

function deletePost(postID) {
	return new Promise((resolve, reject)=> {
		modelPosts.deletePost(postID, (error)=>{
			if(error)
				return reject(error);
			else
				return resolve();
		});
	});
}