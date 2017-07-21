const modelUser = require('./model/user');
const libValidate = require('./lib/validate');

module.exports = function System(app, conf = {}) {
  const { users = {} } = conf;
  const Validate = libValidate(app);
  const Users = modelUser(app, Validate, users);
  return { Users, Validate };
};
