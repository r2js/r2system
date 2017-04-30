module.exports = (app) => {
  const { Validate } = app.service('System');
  const mongoose = app.service('Mongoose');
  const { Schema } = mongoose;

  const schema = new Schema({
    name: { type: String, required: true },
    slug: { type: String },
    email: { type: String },
  });

  const attributes = {
    en: {
      name: 'Name',
      email: 'E-mail',
      slug: 'Slug',
    },
    tr: {
      name: 'İsim',
      email: 'E-posta',
      slug: 'Slag',
    },
  };

  const rules = {
    name: 'required|min:4',
    email: 'email',
    slug: 'alpha_dash',
  };

  schema.r2options = { attributes, rules };
  Validate(schema, { attributes, rules });

  return mongoose.model('test', schema);
};
