const chai = require('chai');
const r2base = require('r2base');
const r2mongoose = require('r2mongoose');
const r2system = require('../index');

const expect = chai.expect;
process.chdir(__dirname);

const app = r2base();
app.start()
  .serve(r2mongoose, { database: 'r2system' })
  .serve(r2system, {
    users: {
      attributes: { es: { email: 'EMAIL', passwd: 'PASSWORD' } },
    },
  })
  .load('model')
  .into(app);

const { Users } = app.service('System');
const Test = app.service('model/test');

const checkUserAttr = (user) => {
  const { salt, verifyToken } = user;
  expect(salt).to.not.equal(undefined);
  expect(verifyToken).to.not.equal(undefined);
};

describe('r2system', () => {
  describe('users', () => {
    it('should create user', () => (
      Users.create({ email: 'test1@abc.com', passwd: '1234' }).then((user) => {
        expect(user.email).to.equal('test1@abc.com');
        expect(user.passwd).to.not.equal('1234');
        checkUserAttr(user);
      })
    ));

    it('should not create user with same email', (done) => {
      const testUser = { email: 'test3@abc.com', passwd: '1234' };
      Users.create(testUser)
        .then((user) => {
          expect(user.email).to.equal('test3@abc.com');
          expect(user.passwd).to.not.equal('1234');
          checkUserAttr(user);

          Users.create(testUser).then(done).catch((err) => {
            const message = err.message.includes('E11000');
            expect(message).to.equal(true);
            done();
          });
        })
        .catch(done);
    });

    it('should create user with username', () => (
      Users.create({ email: 'test4@abc.com', passwd: '1234', uname: 'test4' }).then((user) => {
        expect(user.email).to.equal('test4@abc.com');
        expect(user.passwd).to.not.equal('1234');
        expect(user.uname).to.equal('test4');
        checkUserAttr(user);
      })
    ));

    it('should validate user data', (done) => {
      Users.create({})
        .then(done)
        .catch((err) => {
          try {
            expect(err.errors.email.message).to.equal('The Email field is required.');
            expect(err.errors.passwd.message).to.equal('The Password field is required.');
            done();
          } catch (e) {
            done(e);
          }
        });
    });

    it('should validate user data via new attributes and rules', (done) => {
      Users.create({ uname: 'xyz', i18n: 'es' })
        .then(done)
        .catch((err) => {
          try {
            expect(err.errors.email.message).to.equal('El campo EMAIL es obligatorio.');
            expect(err.errors.passwd.message).to.equal('El campo PASSWORD es obligatorio.');
            expect(err.errors.uname.message).to.equal('El campo uname debe contener al menos 5 caracteres.');
            done();
          } catch (e) {
            done(e);
          }
        });
    });
  });

  describe('validate', () => {
    it('should validate schema, default lang=en', (done) => {
      Test.create({ name: '', email: 'test', slug: '!123*=' })
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

    it('should validate schema, lang=es', (done) => {
      Test.create({ name: '', email: 'test', slug: '!123*=', i18n: 'es' })
        .then(done)
        .catch((err) => {
          try {
            expect(err.errors.name.message).to.equal('El campo name es obligatorio.');
            expect(err.errors.email.message).to.equal('El campo email no es un correo válido');
            expect(err.errors.slug.message).to.equal('El campo slug solo debe contener letras, números y guiones.');
            done();
          } catch (e) {
            done(e);
          }
        });
    });

    it('should validate schema, lang=tr', (done) => {
      Test.create({ name: '', email: 'test', slug: '!123*=', i18n: 'tr' })
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
