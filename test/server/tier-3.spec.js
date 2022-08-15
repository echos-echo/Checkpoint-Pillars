const { expect } = require('chai');
const { cyan } = require('chalk');
const {
  db,
  models: { User },
} = require('../../server/db');

const _app = require('../../server/app');
const app = require('supertest')(_app);

describe('Tier 3: Virtual Fields, Route Parameters, DELETE Routes', () => {
  describe('Sequelize', () => {
    beforeEach(async () => {
      await db.sync({ force: true });
    });

    describe('Virtual Fields: isStudent and isTeacher', () => {
      before(() => {
        console.log(
          cyan(`
        HINT: Sequelize documentation on Virtual Fields:
        https://sequelize.org/master/manual/getters-setters-virtuals.html \n`)
        );
      });

      describe('isStudent', () => {
        it('isStudent is true if the user is a student', async () => {
          const ali = await User.create({
            name: 'ALI',
            userType: 'STUDENT',
          });
          expect(ali.isStudent).to.equal(true);
        });

        it('isStudent is false if the user is NOT a student', async () => {
          const hannah = await User.create({
            name: 'HANNAH',
            userType: 'TEACHER',
          });
          expect(hannah.isStudent).to.equal(false);
        });

        it("isStudent is virtual (it doesn't appear as a column in the database)", async () => {
          const ali = await User.create({
            name: 'ALI',
            userType: 'STUDENT',
          });
          // The dataValues of a Sequelize instance reflect the columns in that database table.
          // We want isStudent to be _derived_ from the userType property.
          expect(ali.dataValues.isStudent).to.equal(undefined);
        });
      });

      describe('isTeacher', () => {
        it('isTeacher is true if the user is a teacher', async () => {
          const hannah = await User.create({
            name: 'HANNAH',
            userType: 'TEACHER',
          });
          expect(hannah.isTeacher).to.equal(true);
        });

        it('isTeacher is false if the user is NOT a teacher', async () => {
          const ali = await User.create({
            name: 'ALI',
            userType: 'STUDENT',
          });
          expect(ali.isTeacher).to.equal(false);
        });

        it("isTeacher is virtual (it doesn't appear as a column in the database)", async () => {
          const hannah = await User.create({
            name: 'HANNAH',
            userType: 'TEACHER',
          });
          // The dataValues of a Sequelize instance reflect the columns in that database table.
          // We want isTeacher to be _derived_ from the userType property.
          expect(hannah.dataValues.isTeacher).to.equal(undefined);
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

    describe('DELETE /api/users/:id', () => {
      before(() => {
        console.log(
          cyan(
            `
        HINT: Express documentation on
        - Request Parameters:
          https://expressjs.com/en/guide/routing.html#route-parameters
        - res.status (also take a look at res.sendStatus):
          https://expressjs.com/en/api.html#res.status \n`
          )
        );
      });

      it('deletes an existing user by their id and responds with 204', async () => {
        let moe = users.MOE;
        const response = await app.delete(`/api/users/${moe.id}`);
        expect(response.status).to.equal(204);
        moe = await User.findByPk(users.MOE.id);
        expect(moe, 'MOE should have been deleted, but was not').to.equal(null);
        // Only one user should have been deleted
        expect(await User.findAll()).to.have.lengthOf(4);
      });

      it('responds with 404 if the user does not exist', async () => {
        const response = await app.delete('/api/users/10000');
        expect(response.status).to.equal(404);
        // No users should have been deleted
        expect(await User.findAll()).to.have.lengthOf(5, 'Oops');
      });

      it('responds with 400 if the id is not a number', async () => {
        const response = await app.delete('/api/users/not_a_valid_id');
        expect(response.status).to.equal(400);
        // No users should have been deleted
        expect(await User.findAll()).to.have.lengthOf(5);
      });
    });
  });
});
