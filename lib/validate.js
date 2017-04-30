const Validator = require('validatorjs');
const _ = require('underscore');

const mapAttributes = (obj, parent) => (
  _.mapObject(obj, (v, k) => {
    if (typeof v === 'string') {
      return parent ? `${v}|${parent}.${k}` : `${v}|${k}`;
    } else if (typeof v === 'object') {
      return mapAttributes(v, k);
    }
    return v;
  })
);

module.exports = (app) => {
  if (!app.hasServices('Mongoose')) {
    return false;
  }

  const mongoose = app.service('Mongoose');
  const ValidatorError = mongoose.Error.ValidatorError;

  return (schema, options = {}) => {
    const { attributes = {}, rules = {} } = options;

    /* eslint-disable func-names, no-underscore-dangle */
    schema.virtual('i18n')
      .get(function () {
        return this._i18n;
      })
      .set(function (value) {
        this._i18n = value;
      });
    /* eslint-enable func-names, no-underscore-dangle */

    schema.pre('validate', function (next) { // eslint-disable-line
      const self = this;
      const parent = typeof this.parent !== 'undefined' ? this.parent() : {};
      const lang = this.i18n || parent.i18n;
      let messages = {};
      if (lang) {
        Object.assign(messages, Validator.getMessages(lang));
      }

      messages = mapAttributes(messages);

      const validator = new Validator(this.toJSON(), rules, messages);
      validator.setAttributeNames(attributes[lang] || attributes);

      if (validator.fails()) {
        const errors = validator.errors.all();
        _.each(errors, (value, path) => {
          _.each(value, (message) => {
            const messageArr = message.split('|');
            self.invalidate(path, new ValidatorError({
              path,
              message: messageArr[0],
              type: messageArr[1],
            }));
          });
        });
      }

      next();
    });
  };
};
