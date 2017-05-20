const crypto = require('crypto');
const uuid = require('uuid');
const log = require('debug')('r2:system:users');

module.exports = (app) => {
  const mongoose = app.service('Mongoose');
  if (!mongoose) {
    return log('service [Mongoose] not found!');
  }

  const { Schema } = mongoose;
  const schema = Schema({
    email: { type: String, required: true, unique: true },
    passwd: { type: String },
    uname: { type: String },
    salt: { type: String },
    hash: { type: String },
    lastLogin: { type: Date },
    passwdChanged: { type: Date },
    verifyToken: { type: String },
    isVerified: { type: Boolean, default: false },
    isEnabled: { type: Boolean, default: false },
    resetToken: { type: String },
    resetExpires: { type: Date },
  }, {
    timestamps: true,
    discriminatorKey: 'user',
  });

  schema.index({ uname: 1 }, { unique: true, sparse: true });

  schema.statics.newUser = function (data) { // eslint-disable-line
    const User = new this(data);
    return User.save();
  };

  schema.pre('save', function preSave(next) {
    this.email = this.email.toLowerCase();

    if (this.passwd) {
      this.salt = uuid.v1();
      this.hash = crypto.createHmac('sha256', this.salt).update(this.passwd).digest('hex');
      this.passwd = undefined;
    }

    this._isNew = this.isNew; // eslint-disable-line
    next();
  });

  return mongoose.model('user', schema);
};
