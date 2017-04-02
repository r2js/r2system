const chai = require('chai');
const r2base = require('r2base');
const r2mongoose = require('r2mongoose');
const r2system = require('../index');

const expect = chai.expect;
process.chdir(__dirname);

const app = r2base({ baseDir: __dirname });
app.start()
  .serve(r2mongoose, { database: 'r2test' })
  .serve(r2system)
  .into(app);

const { Users } = app.service('System');

describe('r2system', () => {
  describe('users', () => {
    it('should create user', () => {
      const User = new Users({ email: 'test1@abc.com', passwd: '1234' });
      return User.save().then((user) => {
        expect(user).to.not.equal(undefined);
        expect(user.email).to.equal('test1@abc.com');
        expect(user.passwd).to.equal(undefined);
        expect(user.hash).to.not.equal(undefined);
        expect(user.salt).to.not.equal(undefined);
      });
    });

    it('should create user with newUser function', () => {
      return Users.newUser({ email: 'test2@abc.com', passwd: '1234' }).then((user) => {
        expect(user).to.not.equal(undefined);
        expect(user.email).to.equal('test2@abc.com');
        expect(user.passwd).to.equal(undefined);
        expect(user.hash).to.not.equal(undefined);
        expect(user.salt).to.not.equal(undefined);
      });
    });

    it('should not create user with same email', (done) => {
      const test3 = { email: 'test3@abc.com', passwd: '1234' };
      Users.newUser(test3)
        .then((user) => {
          try {
            expect(user).to.not.equal(undefined);
            expect(user.email).to.equal('test3@abc.com');
            expect(user.passwd).to.equal(undefined);
            expect(user.hash).to.not.equal(undefined);
            expect(user.salt).to.not.equal(undefined);
          } catch (e) {
            console.log(e);
          }

          Users.newUser(test3).then(done).catch((err) => {
            const message3 = err.message.includes('E11000');
            expect(message3).to.equal(true);
            done();
          });
        })
        .catch(done);
    });
  });
});

function dropDatabase(done) {
  this.timeout(0);
  app.service('Mongoose').connection.db.dropDatabase();
  done();
}

after(dropDatabase);
