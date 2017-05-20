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
  .load('model')
  .into(app);

const { Users } = app.service('System');
const Test = app.service('model/test');

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

    it('should create user with newUser function', () => (
      Users.newUser({ email: 'test2@abc.com', passwd: '1234' }).then((user) => {
        expect(user).to.not.equal(undefined);
        expect(user.email).to.equal('test2@abc.com');
        expect(user.passwd).to.equal(undefined);
        expect(user.hash).to.not.equal(undefined);
        expect(user.salt).to.not.equal(undefined);
      })
    ));

    it('should not create user with same email', (done) => {
      const testUser = { email: 'test3@abc.com', passwd: '1234' };
      Users.newUser(testUser)
        .then((user) => {
          expect(user).to.not.equal(undefined);
          expect(user.email).to.equal('test3@abc.com');
          expect(user.passwd).to.equal(undefined);
          expect(user.hash).to.not.equal(undefined);
          expect(user.salt).to.not.equal(undefined);

          Users.newUser(testUser).then(done).catch((err) => {
            const message = err.message.includes('E11000');
            expect(message).to.equal(true);
            done();
          });
        })
        .catch(done);
    });
  });

  describe('validate', () => {
    it('should validate schema', (done) => {
      const test = new Test({ name: '', email: 'test', slug: '!123*=' });
      test.save()
        .then(done)
        .catch((err) => {
          try {
            expect(err.errors.name.message).to.equal('The name field is required.');
            expect(err.errors.email.message).to.equal('The email format is invalid.');
            expect(err.errors.slug.message).to.equal('The slug field may only contain alpha-numeric characters, as well as dashes and underscores.');
            done();
          } catch (e) {
            done(e);
          }
        });
    });

    it('should validate schema, en', (done) => {
      const test = new Test({ name: '', email: 'test', slug: '!123*=', i18n: 'en' });
      test.save()
        .then(done)
        .catch((err) => {
          try {
            expect(err.errors.name.message).to.equal('The Name field is required.');
            expect(err.errors.email.message).to.equal('The E-mail format is invalid.');
            expect(err.errors.slug.message).to.equal('The Slug field may only contain alpha-numeric characters, as well as dashes and underscores.');
            done();
          } catch (e) {
            done(e);
          }
        });
    });

    it('should validate schema, tr', (done) => {
      const test = new Test({ name: '', email: 'test', slug: '!123*=', i18n: 'tr' });
      test.save()
        .then(done)
        .catch((err) => {
          try {
            expect(err.errors.name.message).to.equal('İsim alanı gerekli.');
            expect(err.errors.email.message).to.equal('E-posta formatı geçersiz.');
            expect(err.errors.slug.message).to.equal('Slag alanı sadece alfa-nümerik, tire ve alt çizgi karakterlerden oluşabilir.');
            done();
          } catch (e) {
            done(e);
          }
        });
    });
  });
});

function dropDatabase(done) {
  this.timeout(0);
  app.service('Mongoose').connection.dropDatabase();
  done();
}

after(dropDatabase);
