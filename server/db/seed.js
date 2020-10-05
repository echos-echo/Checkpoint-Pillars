const db = require('./db');
const User = require('./User');

const seed = async () => {
  await db.sync({ force: true });
  const users = await Promise.all([
    User.create({ name: 'MOE' }),
    User.create({ name: 'LUCY', userType: 'TEACHER' }),
    User.create({ name: 'RED', userType: 'TEACHER' }),
    User.create({ name: 'WANDA' }),
    User.create({ name: 'EDDY' }),
    User.create({ name: 'FREDDIE' }),
    User.create({ name: 'CARL', userType: 'TEACHER' }),
    User.create({ name: 'MEL' }),
    User.create({ name: 'STEVE' }),
    User.create({ name: 'JACK', userType: 'TEACHER' }),
    User.create({ name: 'ROB' }),
  ]);
  const [
    moe,
    lucy,
    red, // eslint-disable-line no-unused-vars
    wanda, // eslint-disable-line no-unused-vars
    eddy, // eslint-disable-line no-unused-vars
    freddie,
    carl,
    mel, // eslint-disable-line no-unused-vars
    steve,
    jack,
    rob,
  ] = users;
  await moe.setMentor(lucy);
  await steve.setMentor(carl);
  await rob.setMentor(carl);
  await freddie.setMentor(jack);

  return users.reduce((allUsers, user) => {
    allUsers[user.name] = user;
    return allUsers;
  }, {});
};

module.exports = seed;
