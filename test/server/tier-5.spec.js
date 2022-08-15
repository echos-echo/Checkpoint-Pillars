const { expect } = require('chai');
const { cyan } = require('chalk');
const sinon = require('sinon');
const {
  db,
  models: { User },
} = require('../../server/db');

const _app = require('../../server/app');
const app = require('supertest')(_app);

describe('Tier 5: Sequelize Update Hook, PUT Routes, Express Error Handling', () => {
  describe('Sequelize', () => {
    before(() => {
      console.log(
        cyan(`
      HINT: Sequelize documentation on
      - Hooks:
        https://sequelize.org/master/manual/hooks.html
      - Instance Hooks:
        https://sequelize.org/master/manual/hooks.html#instance-hooks \n`)
      );
    });

    beforeEach(async () => {
      await db.sync({ force: true });
    });

    describe('Updating: mentorId', () => {
      it('cannot update a user with a mentor who is not a TEACHER', async () => {
        const freddy = await User.create({ name: 'FREDDY' });
        const jerry = await User.create({ name: 'JERRY' });
        const updateJerryPromise = jerry.update({ mentorId: freddy.id });
        const errMessage =
          "We shouldn't be able to update JERRY with FREDDY as a mentor, because FREDDY is not a TEACHER ";
        await expect(updateJerryPromise, errMessage).to.be.rejected;
      });

      it('can update a user with a mentor who is a TEACHER', async () => {
        const freddy = await User.create({
          name: 'FREDDY',
          userType: 'TEACHER',
        });
        const jerry = await User.create({ name: 'JERRY' });
        await jerry.update({ mentorId: freddy.id });
        const jerrysMentor = await jerry.getMentor();
        expect(jerrysMentor.name).to.equal(freddy.name);
      });
    });

    describe('Updating: userType', () => {
      describe('STUDENT -> TEACHER', () => {
        it('cannot change userType from STUDENT to TEACHER when user has a mentor', async () => {
          const freddy = await User.create({
            name: 'FREDDY',
            userType: 'TEACHER',
          });
          const jerry = await User.create({
            name: 'JERRY',
            mentorId: freddy.id,
          });
          const updateJerryPromise = jerry.update({ userType: 'TEACHER' });
          const errMessage =
            "We shouldn't be able to update JERRY to a TEACHER, because FREDDY is their mentor";
          await expect(updateJerryPromise, errMessage).to.be.rejected;
        });

        it('can change userType from STUDENT to TEACHER when user does not have a mentor', async () => {
          const jerry = await User.create({ name: 'JERRY' });
          const promotedJerry = await jerry.update({ userType: 'TEACHER' });
          expect(promotedJerry.userType).to.equal('TEACHER');
        });
      });

      describe('TEACHER -> STUDENT', () => {
        it('cannot change userType from TEACHER to STUDENT when user has mentees', async () => {
          const freddy = await User.create({
            name: 'FREDDY',
            userType: 'TEACHER',
          });
          const jerry = await User.create({
            name: 'JERRY',
            mentorId: freddy.id,
          });
          const updateFreddyPromise = freddy.update({ userType: 'STUDENT' });
          const errMessage =
            "We shouldn't be able to update FREDDY to a STUDENT, because JERRY is their mentee";
          await expect(updateFreddyPromise, errMessage).to.be.rejected;
          expect(jerry.mentorId).to.equal(freddy.id);
        });

        it('can change userType from TEACHER to STUDENT when user does not have any mentees', async () => {
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

    describe('PUT /api/users/:id', () => {
      it('responds with 200 and the updated user', async () => {
        const response = await app
          .put(`/api/users/${users.EDDY.id}`)
          .send({ name: 'Eddie', userType: 'TEACHER' });
        expect(response.status).to.equal(200);
        expect(response.body.name).to.equal('Eddie');
      });

      it('responds with 404 if the user does not exist', async () => {
        const response = await app.put('/api/users/10000').send({
          name: 'NO ONE HERE',
        });
        expect(response.status).to.equal(404);
      });
    });

    describe('Error Handling', () => {
      before(() => {
        console.log(
          cyan(
            `
        HINT: Express documentation on Error Handling:
        https://expressjs.com/en/guide/error-handling.html \n`
          )
        );
      });

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

      it('GET /api/users/unassigned', async () => {
        const response = await app.get('/api/users/unassigned').timeout(200);
        expect(response.status).to.equal(500);
      });

      it('GET /api/users/teachers', async () => {
        const response = await app.get('/api/users/teachers').timeout(200);
        expect(response.status).to.equal(500);
      });

      it('DELETE /api/users/:id', async () => {
        const response = await app.delete('/api/users/1').timeout(200);
        expect(response.status).to.equal(500);
      });

      it('POST /api/users', async () => {
        const response = await app
          .post('/api/users', { name: 'TINA' })
          .timeout(200);
        expect(response.status).to.equal(500);
      });

      it('PUT /api/users/:id', async () => {
        const response = await app
          .put('/api/users/1', { name: 'TINA' })
          .timeout(200);
        expect(response.status).to.equal(500);
      });
    });
  });
});
