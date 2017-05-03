const modelUser = require('./model/user');
const libValidate = require('./lib/validate');

module.exports = function System(app) {
  const Users = modelUser(app);
  const Validate = libValidate(app);
  return { Users, Validate };
};
