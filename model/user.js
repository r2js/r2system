const crypto = require('crypto');
const uuid = require('uuid');
const log = require('debug')('r2:system:user');

module.exports = (app, Validate, conf) => {
  const mongoose = app.service('Mongoose');
  if (!mongoose) {
    return log('service [Mongoose] not found!');
  }

  const getConf = Object.assign(app.config('users') || {}, conf);
  const { Schema } = mongoose;
  const schema = Schema({
    email: { type: String, required: true, unique: true },
    passwd: { type: String },
    uname: { type: String },
    salt: { type: String },
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

  schema.pre('save', function preSave(next) {
    this.email = this.email.toLowerCase();

    if (this.isModified('passwd')) {
      this.salt = uuid.v1();
      this.passwd = crypto.createHmac('sha256', this.salt).update(this.passwd).digest('hex');
    }

    if ((this.isModified('isVerified') || this.$isDefault('isVerified')) && this.isVerified === false) {
      this.verifyToken = app.utils.random(32);
    }

    this._isNew = this.isNew; // eslint-disable-line
    next();
  });

  let { attributes = {}, rules = {} } = getConf;

  attributes = Object.assign({
    en: {
      email: 'Email',
      passwd: 'Password',
      uname: 'Username',
    },
  }, attributes);

  rules = Object.assign({
    email: 'required|email',
    passwd: 'required|min:4',
  }, rules);

  schema.r2options = { attributes, rules };
  Validate(schema, { attributes, rules });

  return mongoose.model('user', schema);
};
