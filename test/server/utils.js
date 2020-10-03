const AsciiTable = require('ascii-table');
const { cyan } = require('chalk');

const logTable = () => {
  const table = new AsciiTable('users');
  table
    .setHeading('id', 'name', 'userType', 'mentorId')
    .addRow(1, 'MOE', 'STUDENT', 2)
    .addRow(2, 'LUCY', 'TEACHER', 'null')
    .addRow(3, 'HANNAH', 'TEACHER', 'null')
    .addRow(4, 'WANDA', 'STUDENT', 'null')
    .addRow(5, 'EDDY', 'STUDENT', 'null');

  console.log(
    cyan(
      `
      We're seeding the database with five sample users so that our
      Express routes have some data to retrieve. The ids may be different,
      but the table would look something like this:\n`
    )
  );
  console.log(cyan(table.toString()), '\n');
};

module.exports = {
  logTable,
};
