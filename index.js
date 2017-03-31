const users = require('./model/users');

module.exports = function System(app) {
  const Users = users(app);
  return { Users };
};
