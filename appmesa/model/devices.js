'use strict';

var _ = require('underscore');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var deviceSchema = new Schema({
  name: String,
  fingerprint: Number,
  showOnScreen: Boolean
});

var Device = mongoose.model('Device', deviceSchema);

function getDeviceByFingerprint(fingerprint, next) {
  Device.find({fingerprint: fingerprint}, (error, devices)=> {
    if(error) {
      global.logger.error('In getDeviceByFingerprint -> ' + error);
      next('Σφάλμα συστήματος.', null);
    } else if(_.isEmpty(devices)) {
      next(null, null);
    } else {
      next(null, devices[0]);
    }     
  });
}

function saveDevice(newDevice, next) {
  newDevice.save((error, device)=> {
    if (error) {
      global.logger.error('In saveDevice -> ' + error);
      next('Σφάλμα συστήματος. Η αποθήκευση της συσκευής δε πραγματοποιήθηκε.', null);
    } else {
      next(null, device);
    }
  });
}

function updateDevice(fingerprint, showOnScreen, next) {
  Device.update(fingerprint/*, {$set: updUser}*/, (error, status)=> {
    if(error) {
      global.logger.error('In updateDevice -> ' + error);
      next('Υπήρξε πρόβλημα κατα την ενημέρωση της συσκευής στο σύστημα.');
    } else {
      next();
    }
  });
}

function deleteDevice(fingerprint, next) {
  Device.remove({fingerprint: fingerprint}, (error)=> {
    if (error) {
      next('Σφάλμα συστήματος. Η συσκευή δε βρέθηκε');
    } else {
      next();
    }
  });
}

module.exports = {
  Device,
  getDeviceByFingerprint,
  saveDevice,
  updateDevice,
  deleteDevice
};