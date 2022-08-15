const { expect } = require('chai');
const { cyan } = require('chalk');
const {
  db,
  models: { User },
} = require('../../server/db');

const _app = require('../../server/app');
const app = require('supertest')(_app);

describe('Tier 4: POST Routes, Request Body', () => {
  describe('Express', () => {
    let users;

    before(() => {
      console.log(
        cyan(
          `
      HINT: We've already added the body-parsing middleware for you.
      Express documentation on Request Body:
      https://expressjs.com/en/api.html#req.body \n`
        )
      );
    });

    beforeEach(async () => {
      await db.sync({ force: true });
      const _users = await User.bulkCreate(
        [
          { name: 'MOE' },
          { name: 'LUCY', userType: 'TEACHER' },
          { name: 'HANNAH', userType: 'TEACHER' },
          { name: 'WANDA' },
          { name: 'EDDY' },
        ],
        { hooks: false }
      );
      const [moe, lucy] = _users;
      await moe.setMentor(lucy, { hooks: false });
      users = _users.reduce((allUsers, user) => {
        allUsers[user.name] = user;
        return allUsers;
      }, {});
    });

    describe('POST /api/users', () => {
      it('responds with 201 and the newly created user', async () => {
        const response = await app.post('/api/users').send({ name: 'FLIP' });
        expect(response.status).to.equal(201);
        expect(response.body).to.be.an('object');
        expect(response.body.name).to.equal('FLIP');
        // Let's make sure the new user is actually persisted in the database
        const usersBeforePost = Object.keys(users);
        const usersAfterPost = (await User.findAll()).map((user) => user.name);
        expect(usersAfterPost).to.include(
          'FLIP',
          'Make sure FLIP is being created'
        );
        expect(usersAfterPost).to.include.members(
          usersBeforePost,
          'Make sure no other users are affected'
        );
      });

      it('responds with 409 if the name is already taken', async () => {
        const response = await app.post('/api/users').send({ name: 'MOE' });
        expect(response.status).to.equal(409, 'Incorrect status code');
        // No users should have been created
        expect(await User.findAll()).to.have.lengthOf(
          5,
          'Make sure no two users were created with the same name'
        );
      });
    });
  });
});
