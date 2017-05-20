const _ = require('underscore');

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
      const isFailed = app.utils.isFailed(this.toJSON(), rules, {
        lang, attributes, setMapAttributes: true,
      });

      if (isFailed) {
        _.each(isFailed, (val) => {
          self.invalidate(val.path, new ValidatorError(val));
        });
      }

      next();
    });
  };
};
