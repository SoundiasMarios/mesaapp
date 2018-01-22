'use strict';

var settings = require('./../settings');
var post_limits = settings.post_limits;
var post_offsets = settings.post_offsets;

var _ = require('underscore');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var tagSchema = mongoose.Schema({
    name: String
});

var postSchema = new Schema({
  type: { type: String, enum: ['announcement','event'] },
  uploadDate: { type: Date, default: Date.now },
  postedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  content: { type: Schema.Types.ObjectId },
  tags: [String]
});

var Post = mongoose.model('Post', postSchema);

function getAllPosts(next) {
  Post.aggregate([
    {
        $lookup: {
            "from": "announcements",
            "localField": "content",
            "foreignField": "_id",
            "as": "announcement_content"
        }
    },
    {
        $lookup: {
            "from": "events",
            "localField": "content",
            "foreignField": "_id",
            "as": "event_content"
        }
    }
  ])
  .sort({uploadDate: 'descending'})
  .exec(function(error, result){
    if(error) {
      global.logger.error('In getAllPosts -> ' + error);
      next('Σφάλμα συστήματος', null);
    } else if(_.isEmpty(result)) {
      next(null, null);
    } else {
      Post.populate(result, {path: 'postedBy', select: 'username -_id'}, (error, posts)=>{
        if(error) {
          global.logger.error('In getAllPosts -> ' + error);
          next('Σφάλμα συστήματος', null);
        } else if(_.isEmpty(posts)) {
          next(null, null);
        } else{
          next(null, posts);
        }
      });
    }
  });
}

function getAllPostsByPage(page, next) {
  var num_skip = page*post_limits.page_post_limit;

  Post.aggregate([
    {
        $lookup: {
            "from": "announcements",
            "localField": "content",
            "foreignField": "_id",
            "as": "announcement_content"
        }
    },
    {
        $lookup: {
            "from": "events",
            "localField": "content",
            "foreignField": "_id",
            "as": "event_content"
        }
    }
  ])
  .sort({uploadDate: 'descending'})
  .skip(num_skip)
  .limit(post_limits.page_post_limit)
  .exec(function(error, result){
    if(error) {
      global.logger.error('In getAllPostsByPage -> ' + error);
      next('Σφάλμα συστήματος', null);
    } else if(_.isEmpty(result)) {
      next(null, null);
    } else {
      Post.populate(result, {path: 'postedBy', select: 'username -_id'}, (error, posts)=>{
        if(error) {
          global.logger.error('In getAllPostsByPage -> ' + error);
          next('Σφάλμα συστήματος', null);
        } else if(_.isEmpty(posts)) {
          next(null, null);
        } else{
          next(null, posts);
        }
      });
    }
  });
}

function getAllPostsWithoutImportant(num_skip, importantPosts, next) {
  Post.aggregate([
    {
      $lookup: {
          "from": "announcements",
          "localField": "content",
          "foreignField": "_id",
          "as": "announcement_content"
      }
    },
    {
      $lookup: {
          "from": "events",
          "localField": "content",
          "foreignField": "_id",
          "as": "event_content"
      }
    },
    {
      $match: {
        '_id': {$nin: importantPosts}
      }
    }
  ])
  .sort({uploadDate: 'descending'})
  .exec(function(error, result){
    if(error) {
      global.logger.error('In getAllPostsWithoutImportant -> ' + error);
      next('Σφάλμα συστήματος', null);
    } else if(_.isEmpty(result)) {
      next(null, null);
    } else {
      Post.populate(result, {path: 'postedBy', select: 'username -_id'}, (error, posts)=>{
        if(error) {
          global.logger.error('In getAllPostsWithoutImportant -> ' + error);
          next('Σφάλμα συστήματος', null);
        } else if(_.isEmpty(posts)) {
          next(null, null);
        } else{
          // console.log(posts);
          next(null, posts);
        }
      });
    }
  });
}

function getPostsByUserIDPage(userID, page, next) {
  var num_skip = page*post_limits.page_post_limit;

  Post.aggregate([
    {
      $lookup: {
          "from": "announcements",
          "localField": "content",
          "foreignField": "_id",
          "as": "announcement_content"
      }
    },
    {
      $lookup: {
          "from": "events",
          "localField": "content",
          "foreignField": "_id",
          "as": "event_content"
      }
    },
    {
      $match: {
        "postedBy": {$eq: userID}
      }
    },
    {
      $sort: {
        "uploadDate": -1
      }
    },
    {
      $limit: num_skip + post_limits.page_post_limit
    },
    {
      $skip: num_skip
    }
  ])
  .exec(function(error, result){
    if(error) {
      global.logger.error('In getPostsByUserIDPage -> ' + error);
      next('Σφάλμα συστήματος', null);
    } else if(_.isEmpty(result)) {
      next(null, null);
    } else {
      Post.populate(result, {path: 'postedBy', select: 'username -_id'}, (error, posts)=>{
        if(error) {
          global.logger.error('In getPostsByUserIDPage -> ' + error);
          next('Σφάλμα συστήματος', null);
        } else if(_.isEmpty(posts)) {
          next(null, null);
        } else{
          next(null, posts);
        }
      });
    }
  });
}

function getPostsExcludedCurUserByPage(userID, page, next) {
  var num_skip = page*post_limits.page_post_limit;

  Post.aggregate([
    {
      $lookup: {
          "from": "announcements",
          "localField": "content",
          "foreignField": "_id",
          "as": "announcement_content"
      }
    },
    {
      $lookup: {
          "from": "events",
          "localField": "content",
          "foreignField": "_id",
          "as": "event_content"
      }
    },
    {
      $match: {
        "postedBy": {$ne: userID}
      }
    },
    {
      $sort: {
        "uploadDate": -1
      }
    },
    {
      $limit: num_skip + post_limits.page_post_limit
    },
    {
      $skip: num_skip
    }
  ])
  .exec(function(error, result){
    if(error) {
      global.logger.error('In getPostsByUserIDPage -> ' + error);
      next('Σφάλμα συστήματος', null);
    } else if(_.isEmpty(result)) {
      next(null, null);
    } else {
      Post.populate(result, {path: 'postedBy', select: 'username -_id'}, (error, posts)=>{
        if(error) {
          global.logger.error('In getPostsByUserIDPage -> ' + error);
          next('Σφάλμα συστήματος', null);
        } else if(_.isEmpty(posts)) {
          next(null, null);
        } else{
          next(null, posts);
        }
      });
    }
  });
}

function getPostsByType(contentInfo, num_skip, next) {
  Post
  .find({type: contentInfo.type})
  .sort({uploadDate: 'descending'})
  .populate('postedBy', 'username')
  .populate({
  	path: 'content',
  	model: contentInfo.model
  })
  .skip(num_skip*post_limits.page_post_limit)
  .limit(post_limits.page_post_limit)
  .exec((error, posts)=> {
    if(error) {
      global.logger.error('In getPostsByType -> ' + error);
      next('Σφάλμα συστήματος.', null);
    } else if(_.isEmpty(posts)) {
      next(null, null);
    } else {
      next(null, posts);
    }
  });
}

function getPostByTypePostID(contentInfo, postID, next) {
  Post
  .find({_id: postID, type: contentInfo.type})
  .populate('postedBy', 'username')
  .populate({
  	path: 'content',
  	model: contentInfo.model
  })
  .exec((error, posts)=> {
    if(error) {
      global.logger.error('In getPostByTypePostID -> ' + error);
      next('Σφάλμα συστήματος. Η δημοσίευση δε βρέθηκε.', null);
    } else if(_.isEmpty(posts)) {
      next(null, null);
    } else {
      next(null, posts[0]);
    }
  });
}

function getPostsByTypeUserID(contentInfo, userID, num_skip, next) {
  Post
  .find({postedBy: userID, type: contentInfo.type})
  .sort({uploadDate: 'descending'})
  .populate('postedBy', 'username')
  .populate({
    path: 'content',
    model: contentInfo.model
  })
  .skip(num_skip*post_limits.page_post_limit)
  .limit(post_limits.page_post_limit)
  .exec((error, posts)=> {
    if(error) {
      global.logger.error('In getPostsByTypeUserID -> ' + error);
      next('Σφάλμα συστήματος.', null);
    } else if(_.isEmpty(posts)) {
      next(null, null);
    } else {
      next(null, posts);
    }
  });
}

function getPostByTypePostIDUserID(contentInfo, postID, userID, next) {
  Post
  .find({_id: postID, postedBy: userID, type: contentInfo.type})
  .populate('postedBy', 'username')
  .populate({
    path: 'content',
    model: contentInfo.model
  })
  .exec((error, posts)=> {
    if(error) {
      global.logger.error('In getPostByTypePostIDUserID -> ' + error);
      next('Σφάλμα συστήματος. Η δημοσίευση δε βρέθηκε.', null);
    } else if(_.isEmpty(posts)) {
      next(null, null);
    } else {
      next(null, posts[0]);
    }
  });
}

function savePost(newPost, next) {
  newPost.save((error, post)=> {
    if (error) {
      global.logger.error('In savePost -> ' + error);
      next('Υπήρξε πρόβλημα κατα την αποθήκευση της δημοσίευσης στο σύστημα.');
    } else
        next(null, post);
  });
}

function updatePostTagsByPostID(postID, tags, next) {
  Post.update({content: postID}, {$set: {tags: tags}})
  .exec((error, posts)=> {
    if(error) {
      global.logger.error('In updatePostTagsByPostID -> ' + error);
      next('Σφάλμα συστήματος.', null);
    } else if(_.isEmpty(posts)) {
      next(null, null);
    } else {
      next(null, posts[0]);
    }
  });
}

function deletePost(postID, next) {
  Post.remove({_id: postID}, (error)=> {
    if (error) {
      global.logger.error('In deletePost -> ' + error);
      next('Υπήρξε πρόβλημα κατα τη διαγραφή της δημοσίευσης.');
    }
    else {
      next();
    }
  });
}

function getUpcomingEventsPosts(next) {
  var now = new Date();
  var date_offset = new Date(new Date(now).setDate(now.getDate() + post_offsets.soon_date_offset));

  Post.aggregate([
    {
      $lookup: {
          "from": "events",
          "localField": "content",
          "foreignField": "_id",
          "as": "event_content"
      }
    },
    {
      $match: {
        "event_content.startDate": {$lt : date_offset, $gt : now}
      }
    },
    {
      $sort: {
        "event_content.startDate": 1
      }
    },
    {
      $limit: post_limits.soon_post_limit
    }
  ])
  .exec(function(error, result){
    if(error) {
      global.logger.error('In getUpcomingEventsPosts -> ' + error);
      next('Σφάλμα συστήματος.', null);
    } else if(_.isEmpty(result)) {
      next(null, null);
    } else {
      Post.populate(result, {path: 'postedBy', select: 'username -_id'}, (error, posts)=>{
        if(error) {
          global.logger.error('In getUpcomingEventsPosts -> ' + error);
          next('Σφάλμα συστήματος', null);
        } else if(_.isEmpty(posts)) {
          next(null, null);
        } else {
          next(null, posts);
        }
      });
    }
  });
}

function getRunningEventsPosts(next) {
  var now = new Date();
  var until_date = new Date(new Date(now).setDate(now.getDate() - 1)); // epeidh h hmeromhnia elegxei kai thn WRA

  Post.aggregate([
    {
      $lookup: {
          "from": "events",
          "localField": "content",
          "foreignField": "_id",
          "as": "event_content"
      }
    },
    {
      $match: {
        $and: [
          {"event_content.startDate": {$lte: now}},
          {"event_content.endDate": {$gte: until_date}}
        ]
      }
    },
    {
      $sort: {
        "event_content.startDate": 1
      }
    }
  ])
  .exec(function(error, result){
    if(error) {
      global.logger.error('In getRunningEventsPosts -> ' + error);
      next('Σφάλμα συστήματος.', null);
    } else if(_.isEmpty(result)) {
      next(null, null);
    } else {
      Post.populate(result, {path: 'postedBy', select: 'username -_id'}, (error, posts)=>{
        if(error) {
          global.logger.error('In getRunningEventsPosts -> ' + error);
          next('Σφάλμα συστήματος', null);
        } else if(_.isEmpty(posts)) {
          next(null, null);
        } else {
          next(null, posts);
        }
      });
    }
  });
}

function getFinishedEventsPosts(next) {
  var now = new Date();
  var until_date = new Date(new Date(now).setDate(now.getDate() - post_offsets.finished_date_offset - 1));

  Post.aggregate([
    {
      $lookup: {
          "from": "events",
          "localField": "content",
          "foreignField": "_id",
          "as": "event_content"
      }
    },
    {
      $match: {
        $and: [{
          "event_content.state": {$eq: 'finished'} 
        },{
          "event_content.endDate": {$gte: until_date}
        }]
      }
    },
    {
      $sort: {
        "event_content.endDate": 1
      }
    },
    {
      $limit: post_limits.soon_post_limit
    }
  ])
  .exec(function(error, result){
    if(error) {
      global.logger.error('In getFinishedEventsPosts -> ' + error);
      next('Σφάλμα συστήματος.', null);
    } else if(_.isEmpty(result)) {
      next(null, null);
    } else {
      Post.populate(result, {path: 'postedBy', select: 'username -_id'}, (error, posts)=>{
        if(error) {
          global.logger.error('In getFinishedEventsPosts -> ' + error);
          next('Σφάλμα συστήματος', null);
        } else if(_.isEmpty(posts)) {
          next(null, null);
        } else {
          next(null, posts);
        }
      });
    }
  });
}

function getPostsByTag(tag, next) {
  Post.aggregate([
    {
        $lookup: {
            "from": "announcements",
            "localField": "content",
            "foreignField": "_id",
            "as": "announcement_content"
        }
    },
    {
        $lookup: {
            "from": "events",
            "localField": "content",
            "foreignField": "_id",
            "as": "event_content"
        }
    },
    {
      $match: {
        "tags": {$eq: tag}
      }
    }
  ])
  .sort({uploadDate: 'descending'})
  .exec(function(error, result){
    if(error) {
      global.logger.error('In getPostsByTag -> ' + error);
      next('Σφάλμα συστήματος.', null);
    } else if(_.isEmpty(result)) {
      next(null, null);
    } else {
      Post.populate(result, {path: 'postedBy', select: 'username -_id'}, (error, posts)=>{
        if(error) {
          global.logger.error('In getPostsByTag -> ' + error);
          next('Σφάλμα συστήματος', null);
        } else if(_.isEmpty(posts)) {
          next(null, null);
        } else {
          next(null, posts);
        }
      });
    }
  });
}

function getPostsByIDArray(idArray, next) {
  Post.aggregate([
    {
      $lookup: {
          "from": "announcements",
          "localField": "content",
          "foreignField": "_id",
          "as": "announcement_content"
      }
    },
    {
      $lookup: {
          "from": "events",
          "localField": "content",
          "foreignField": "_id",
          "as": "event_content"
      }
    },
    {
      $match: {
        $or: [{
          'announcement_content._id': {
            $in: idArray
          }
        }, {
          'event_content._id': {
            $in: idArray
          }
        }]
      }
    }
  ])
  .sort({uploadDate: 'descending'})
  .exec(function(error, result){
    if(error) {
      global.logger.error('In getPostsByIDArray -> ' + error);
      next('Σφάλμα συστήματος.', null);
    } else if(_.isEmpty(result)) {
      next(null, null);
    } else {
      Post.populate(result, {path: 'postedBy', select: 'username -_id'}, (error, posts)=>{
        if(error) {
          global.logger.error('In getPostsByIDArray -> ' + error);
          next('Σφάλμα συστήματος', null);
        } else if(_.isEmpty(posts)) {
          next(null, null);
        } else {
          next(null, posts);
        }
      });
    }
  });
}

function getPinnedAnnouncementsPosts(next) {
  Post.aggregate([
    {
      $lookup: {
          "from": "announcements",
          "localField": "content",
          "foreignField": "_id",
          "as": "announcement_content"
      }
    },
    {
      $match: {
        "announcement_content.pinned": {$eq: true}
      }
    }
  ])
  .exec(function(error, result){
    if(error) {
      global.logger.error('In getPinnedAnnouncementsPosts -> ' + error);
      next('Σφάλμα συστήματος.', null);
    } else if(_.isEmpty(result)) {
      next(null, null);
    } else {
      Post.populate(result, {path: 'postedBy', select: 'username -_id'}, (error, posts)=>{
        if(error) {
          global.logger.error('In getPinnedAnnouncementsPosts -> ' + error);
          next('Σφάλμα συστήματος', null);
        } else if(_.isEmpty(posts)) {
          next(null, null);
        } else {
          next(null, posts);
        }
      });
    }
  });
}

module.exports = {
  Post,
  getAllPosts,
  getAllPostsByPage,
  getAllPostsWithoutImportant,
  getPostsByUserIDPage,
  getPostsExcludedCurUserByPage,
  getPostsByType,
  getPostByTypePostID,
  getPostsByTypeUserID,
  getPostByTypePostIDUserID,
  savePost,
  updatePostTagsByPostID,
  deletePost,
  getUpcomingEventsPosts,
  getRunningEventsPosts,
  getFinishedEventsPosts,
  getPostsByTag,
  getPostsByIDArray,
  getPinnedAnnouncementsPosts
};