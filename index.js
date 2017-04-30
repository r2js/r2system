const users = require('./model/users');
const validate = require('./lib/validate');

module.exports = function System(app) {
  const Users = users(app);
  const Validate = validate(app);
  return { Users, Validate };
};
