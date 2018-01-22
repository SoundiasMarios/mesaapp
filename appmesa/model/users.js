"use strict";

var uniqueValidator = require('mongoose-unique-validator');
var _ = require('underscore');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
  firstname: {
    type: String,
    validate: {
      validator: function(v) {
        return /^([a-zα-ωA-ZΑ-Ωά-ώ]){3,20}$/.test(v);
      },
      message: 'Το {VALUE} δεν είναι έγκυρο όνομα!'
    },
    required: [true, 'Το Όνομα είναι υποχρεωτικό!'] 
  },

  lastname: {
    type: String,
    validate: {
      validator: function(v) {
        return /^([a-zα-ωA-ZΑ-Ωά-ώ]){3,20}$/.test(v);
      },
      message: 'Το {VALUE} δεν είναι έγκυρο επώνυμο!'
    },
    required: [true, 'Το Επώνυμο είναι υποχρεωτικό!']
  },

  username: {
    type: String,
    validate: {
      validator: function(v) {
        return /^([a-zα-ωA-ZΑ-Ωά-ώ]){8,}$/.test(v);
      },
      message: 'Το {VALUE} δεν είναι έγκυρο username!'
    },
    required: [true, 'Το Username είναι υποχρεωτικό!'],
    unique: true
  },

  email: {
    type: String,
    validate: {
      validator: function(v) {
        return /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/.test(v);
      },
      message: 'Το {VALUE} δεν είναι έγκυρο email!'
    },
    required: [true, 'Το Email είναι υποχρεωτικό!'],
    unique: true
  },

  password: {
    type: String,
    required: [true, 'Ο Κωδικός Πρόσβασης είναι υποχρεωτικός!']
  },

  birthdate: {
    type: Date,
    validate: {
      validator: function(value) {
        var now = (new Date()).getFullYear();
        var birth = (new Date(value)).getFullYear();
        
        if(now > birth) {
            return true;
        } else {
            return false;
        }
      },
      message: 'Το {VALUE} δεν είναι έγκυρη ημερομηνία γέννησης!'
    },
    required: [true, 'Η ημερομηνία γέννησης είναι υποχρεωτική!']
  },

  gender: {
    type: String,
    enum: ['default', 'male', 'female']
  },

  city: {
    type: String,
    validate: {
      validator: function(v) {
        return /^([a-zα-ωA-ZΑ-Ωά-ώ]){1,51}$/.test(v);
      },
    },
    required: [true, 'Η Πόλη είναι υποχρεωτική!']
  },

  phone: {
    type: String,
    validate: {
      validator: function(v) {
        return /^[0-9]{10}$/.test(v);
      },
      message: 'Το {VALUE} δεν είναι έγκυρος αριθμός τηλεφώνου!'
    },
    required: [true, 'Ο Αριθμός Τηλεφώνου είναι υποχρεωτικός!']
  },

  moreinfo: String,

  role: {
    type: String,
    enum: ['simple_user', 'admin_user']
  },

});


userSchema.plugin(uniqueValidator, { message: 'Το {PATH} "{VALUE}" χρησιμοποιείται ήδη!' });
var User = mongoose.model('User', userSchema);

function validateform(user, next){
  //////////////// remove "return"
  return user.validate((error)=> {
    if (error) {
        var message = '';
        for (var errName in error.errors) {
          message = message + error.errors[errName].message + '<br/>';
        }
        return next(message);
    }else {
      return next();
    }
  });
}

function getAllUsers(next) {
  User.find((error, users)=> {
    if(error) {
      global.logger.error('In getAllUsers -> ' + error);
      next('Σφάλμα συστήματος.', null);
    } else if(_.isEmpty(users)) {
      next(null, null);
    } else {
      next(null, users);
    }   
  });
}

function getUserByUsername(username, next) {
  User.find({username : username}, (error, users)=> {
    if(error) {
      global.logger.error('In getUserByUsername -> ' + error);
      next('Σφάλμα συστήματος.', null);
    } else if(_.isEmpty(users)) {
      next(null, null);
    } else {
      next(null, users[0]);
    }     
  });
}

function getUserIDByUsername(username, next) {
  User.find({username : username}, {_id: 1}, (error, ids)=> {
    if(error) {
      global.logger.error('In getUserIDByUsername -> ' + error);
      next('Σφάλμα συστήματος.', null);
    } else if(_.isEmpty(ids)) {
      next(null, null);
    } else {
      next(null, ids[0]);
    }
  });
}

function getUserByUsernamePasswordRole(username, password, role, next) {
  User.find({username : username, password : password, role : role}, (error, users)=> {
    if (error) {
      global.logger.error('In getUserByUsernamePasswordRole -> ' + error);
      next('Σφάλμα συστήματος.', null);
    } else if(_.isEmpty(users)) {
      next(null, null);
    } else {
      next(null, users[0]);
    }
  });
}

function saveUser(newUser, next) {
  newUser.save((error, user)=> {
    if (error) {
      global.logger.error('In saveUser -> ' + error);
      next('Υπήρξε πρόβλημα κατα την εγγραφή του χρήστη στο σύστημα.', null);
    } else {
      next(null, user);
    }
  });
}

function updateUser(uID, updUser, next) {
  User.update(uID, {$set: updUser}, (error, status)=> {
    if(error) {
      global.logger.error('In updateUser -> ' + error);
      next('Υπήρξε πρόβλημα κατα την ενημέρωση του χρήστη στο σύστημα.');
    } else {
      next();
    }
  });
}

function deleteUser(uID, next) {
  User.remove({_id: uID}, (error)=> {
    if (error) {
      next('Σφάλμα συστήματος. Ο χρήστης δε βρέθηκε');
    } else {
      next();
    }
  });
}

module.exports = {
  User,
  validateform,
  getAllUsers,
  getUserByUsername,
  getUserIDByUsername,
  getUserByUsernamePasswordRole,
  saveUser,
  updateUser,
  deleteUser
};