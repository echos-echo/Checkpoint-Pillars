const { expect } = require('chai');
const { cyan } = require('chalk');
const sinon = require('sinon');
const {
  db,
  models: { User },
} = require('../../server/db');

const _app = require('../../server/app');
const app = require('supertest')(_app);

describe('Tier 4: Sequelize Updating, PUT (update) an Existing User, Express Error Handling', () => {
  describe('Sequelize', () => {
    before(() => {
      console.log(
        cyan(`
      beforeCreate, beforeUpdate, beforeDestroy, beforeSave
      HINT: You may not need to use all four of the above-mentioned
      hooks. Go take a look at the Sequelize documentation on hooks:
      https://sequelize.org/master/manual/hooks.html\n`)
      );
    });

    beforeEach(async () => {
      await db.sync({ force: true });
    });

    describe('Updating: mentorId', () => {
      xit('cannot update a user with a mentor who is not a TEACHER', async () => {
        const freddy = await User.create({ name: 'FREDDY' });
        const jerry = await User.create({ name: 'JERRY' });
        await expect(jerry.update({ mentorId: freddy.id })).to.be.rejected;
      });

      xit('can update a user with a mentor who is a TEACHER', async () => {
        const freddy = await User.create({ name: 'FREDDY' });
        const jerry = await User.create({ name: 'JERRY' });
        await expect(jerry.update({ mentorId: freddy.id })).to.be.rejected;
      });
    });

    describe('Updating: userType', () => {
      describe('STUDENT -> TEACHER', () => {
        xit('cannot change userType from STUDENT to TEACHER when user has a mentor', async () => {
          const freddy = await User.create({
            name: 'FREDDY',
            userType: 'TEACHER',
          });
          const jerry = await User.create({
            name: 'JERRY',
            mentorId: freddy.id,
          });
          await expect(jerry.update({ userType: 'TEACHER' })).to.be.rejected;
        });

        xit('can change userType from STUDENT to TEACHER when user does not have a mentor', async () => {
          const jerry = await User.create({ name: 'JERRY' });
          const promotedJerry = await jerry.update({ userType: 'TEACHER' });
          expect(promotedJerry.userType).to.equal('TEACHER');
        });
      });

      describe('TEACHER -> STUDENT', () => {
        xit('cannot change userType from TEACHER to STUDENT when user has mentees', async () => {
          const freddy = await User.create({
            name: 'FREDDY',
            userType: 'TEACHER',
          });
          const jerry = await User.create({
            name: 'JERRY',
            mentorId: freddy.id,
          });
          await expect(freddy.update({ userType: 'STUDENT' })).to.be.rejected;
          expect(jerry.mentorId).to.equal(freddy.id);
        });

        xit('can change userType from TEACHER to STUDENT when user does not have any mentees', async () => {
          const freddy = await User.create({
            name: 'FREDDY',
            userType: 'TEACHER',
          });
          const studiousFreddy = await freddy.update({ userType: 'STUDENT' });
          expect(studiousFreddy.userType).to.equal('STUDENT');
        });
      });
    });
  });

  describe('Express', () => {
    let users;
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
      users = _users.reduce((acc, user) => {
        acc[user.name] = user;
        return acc;
      }, {});
    });

    describe('PUT /api/users/:id', () => {
      xit('responds with 200 and the updated user', async () => {
        const response = await app
          .put(`/api/users/${users.EDDY.id}`)
          .send({ name: 'Eddie', userType: 'TEACHER' });
        expect(response.status).to.equal(200);
        expect(response.body.name).to.equal('Eddie');
      });

      xit('responds with 404 if the user does not exist', async () => {
        const response = await app.put('/api/users/10000').send({
          name: 'NO ONE HERE',
        });
        expect(response.status).to.equal(404);
      });
    });

    describe('Error Handling', () => {
      const UserMethods = [
        'findAll',
        'findOne',
        'findByPk',
        'findOrCreate',
        'create',
        'bulkCreate',
        'destroy',
        'update',
      ];
      beforeEach(() => {
        const error = new Error('OH NO! The database is on fire!');
        UserMethods.forEach((method) => {
          sinon.stub(User, method).rejects(error);
        });
      });
      afterEach(() => {
        UserMethods.forEach((method) => {
          User[method].restore();
        });
      });

      xit('GET /api/users/unassigned', async () => {
        const response = await app.get('/api/users/unassigned').timeout(200);
        expect(response.status).to.equal(500);
      });

      xit('GET /api/users/teachers', async () => {
        const response = await app.get('/api/users/teachers').timeout(200);
        expect(response.status).to.equal(500);
      });

      xit('DELETE /api/users/:id', async () => {
        const response = await app.delete('/api/users/1').timeout(200);
        expect(response.status).to.equal(500);
      });

      xit('POST /api/users', async () => {
        const response = await app
          .post('/api/users', { name: 'TINA' })
          .timeout(200);
        expect(response.status).to.equal(500);
      });

      xit('PUT /api/users/:id', async () => {
        const response = await app
          .put('/api/users/1', { name: 'TINA' })
          .timeout(200);
        expect(response.status).to.equal(500);
      });
    });
  });
});
