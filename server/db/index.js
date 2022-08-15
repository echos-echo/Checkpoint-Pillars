const db = require('./db');
const User = require('./User');
const Subject = require('./Subject');
const seed = require('./seed');

// If we were to create any associations between different tables
// this would be a good place to do that:
Subject.belongsToMany(User, { through: 'UserSubjects'});
User.belongsToMany(Subject, { through: 'UserSubjects'});

module.exports = {
  db,
  seed,
  models: {
    User,
    Subject,
  },
};
