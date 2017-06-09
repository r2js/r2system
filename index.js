const modelUser = require('./model/user');
const libValidate = require('./lib/validate');

module.exports = function System(app) {
  const Validate = libValidate(app);
  const Users = modelUser(app, Validate);
  return { Users, Validate };
};
