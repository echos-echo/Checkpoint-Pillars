const Sequelize = require('sequelize');

const db = new Sequelize(
  process.env.DATABASE_URL || 'postgres://localhost/pillars',
  {
    logging: false,
  }
);

module.exports = db;
