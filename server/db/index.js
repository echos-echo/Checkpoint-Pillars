const db = require('./db');
const User = require('./User');
const Subject = require('./Subject');
const seed = require('./seed');

// If we were to create any associations between different tables
// this would be a good place to do that:

module.exports = {
  db,
  seed,
  models: {
    User,
    Subject,
  },
};
