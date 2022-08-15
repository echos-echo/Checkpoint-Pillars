const Sequelize = require('sequelize');
const db = require('./db');

const Subject = db.define('subject', {
    name: {
        type: Sequelize.STRING
    }
})

module.exports = Subject;