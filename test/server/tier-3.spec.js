const { expect } = require('chai');
const {
  db,
  models: { User },
} = require('../../server/db');

const _app = require('../../server/app');
const app = require('supertest')(_app);

describe('Tier 3: Sequelize Creating, POST (create) a New User', () => {
  describe('Sequelize', () => {
    beforeEach(async () => {
      await db.sync({ force: true });
    });

    describe('Creating', () => {
      xit('cannot create a user whose mentor is not a TEACHER', async () => {
        const freddy = await User.create({
          name: 'FREDDY',
          userType: 'STUDENT',
        });
        const jerryPromise = User.create({
          name: 'JERRY',
          mentorId: freddy.id,
        });
        await expect(jerryPromise).to.be.rejected;
      });

      xit('can create a user whose mentor is a TEACHER', async () => {
        const freddy = await User.create({
          name: 'FREDDY',
          userType: 'TEACHER',
        });
        const jerry = await User.create({
          name: 'JERRY',
          mentorId: freddy.id,
        });
        expect(jerry.mentorId).to.equal(freddy.id);
      });
    });
  });

  describe('Express', () => {
    beforeEach(async () => {
      await db.sync({ force: true });
      const _users = await Promise.all([
        User.create({ name: 'MOE' }),
        User.create({ name: 'LUCY', userType: 'TEACHER' }),
        User.create({ name: 'HANNAH', userType: 'TEACHER' }),
        User.create({ name: 'WANDA' }),
        User.create({ name: 'EDDY' }),
      ]);
      const [moe, lucy] = _users;
      await moe.setMentor(lucy);
    });

    describe('POST /api/users', () => {
      xit('responds with 201 and the newly created user', async () => {
        const response = await app.post('/api/users').send({ name: 'FLIP' });
        expect(response.status).to.equal(201);
        expect(response.body).to.be.an('object');
        expect(response.body.name).to.equal('FLIP');
        // Let's make sure the new user is actually persisted in the database
        const usersAfterPost = await User.findAll();
        const flip = usersAfterPost.find((user) => user.name === 'FLIP');
        expect(flip).to.not.equal(undefined);
      });

      xit('responds with 409 if the name is already taken', async () => {
        const response = await app.post('/api/users').send({ name: 'MOE' });
        expect(response.status).to.equal(409);
        // No users should have been created
        expect(await User.findAll()).to.have.lengthOf(5);
      });
    });
  });
});
