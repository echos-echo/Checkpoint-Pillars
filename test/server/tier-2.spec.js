const { expect } = require('chai');
const { cyan } = require('chalk');
const {
  db,
  models: { User },
} = require('../../server/db');

const _app = require('../../server/app');
const app = require('supertest')(_app);

describe('Tier 2: Virtual Fields, Sequelize Destroying, DELETE (destroy) a User', () => {
  describe('Sequelize', () => {
    beforeEach(async () => {
      await db.sync({ force: true });
    });

    describe('Virtual Fields: isStudent and isTeacher', () => {
      before(() => {
        console.log(
          cyan(`
        HINT: Go see what the Sequelize documentation has to say
        about virtual fields:
        https://sequelize.org/master/manual/getters-setters-virtuals.html\n`)
        );
      });

      describe('isStudent', () => {
        xit('isStudent is true if the user is a student', async () => {
          const ali = await User.create({
            name: 'ALI',
            userType: 'STUDENT',
          });
          expect(ali.isStudent).to.equal(true);
        });

        xit('isStudent is false if the user is NOT a student', async () => {
          const hannah = await User.create({
            name: 'HANNAH',
            userType: 'TEACHER',
          });
          expect(hannah.isStudent).to.equal(false);
        });

        xit("isStudent is virtual (it doesn't appear as a column in the database)", async () => {
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
        xit('isTeacher is true if the user is a teacher', async () => {
          const hannah = await User.create({
            name: 'HANNAH',
            userType: 'TEACHER',
          });
          expect(hannah.isTeacher).to.equal(true);
        });

        xit('isTeacher is false if the user is NOT a teacher', async () => {
          const ali = await User.create({
            name: 'ALI',
            userType: 'STUDENT',
          });
          expect(ali.isTeacher).to.equal(false);
        });

        xit("isTeacher is virtual (it doesn't appear as a column in the database)", async () => {
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
    describe('Deleting', () => {
      xit('cannot delete a teacher who has mentees', async () => {
        const freddy = await User.create({
          name: 'FREDDY',
          userType: 'TEACHER',
        });
        const jerry = await User.create({
          name: 'JERRY',
          mentorId: freddy.id,
        });
        await expect(freddy.destroy()).to.be.rejected;
        expect(await jerry.getMentor()).to.deep.include({ name: 'FREDDY' });
      });

      xit('can delete a teacher who does not have mentees', async () => {
        const freddy = await User.create({
          name: 'FREDDY',
          userType: 'TEACHER',
        });
        await freddy.destroy();
        const userNamedFreddy = await User.findOne({
          where: { name: 'FREDDY' },
        });
        expect(userNamedFreddy).to.equal(null);
      });

      xit('can delete a student (always)', async () => {
        const freddy = await User.create({
          name: 'FREDDY',
          userType: 'TEACHER',
        });
        const jerry = await User.create({
          name: 'JERRY',
          mentorId: freddy.id,
        });
        const ali = await User.create({ name: 'ALI' });
        await jerry.destroy(); // jerry has a mentor
        await ali.destroy(); // ali doe snot have a mentor
        // Both students should be deleted
        const userNamedJerry = await User.findOne({ where: { name: 'JERRY' } });
        const userNamedAli = await User.findOne({ where: { name: 'ALI' } });
        expect(userNamedJerry).to.equal(null);
        expect(userNamedAli).to.equal(null);
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

    describe('DELETE /api/users/:id', () => {
      xit('deletes an existing user by their id and responds with 204', async () => {
        let moe = users.MOE;
        const response = await app.delete(`/api/users/${moe.id}`);
        expect(response.status).to.equal(204);
        moe = await User.findByPk(users.MOE.id);
        expect(moe).to.equal(null);
        // Only one user should have been deleted
        expect(await User.findAll()).to.have.lengthOf(4);
      });

      xit('responds with 404 if the user does not exist', async () => {
        const response = await app.delete('/api/users/10000');
        expect(response.status).to.equal(404);
        // No users should have been deleted
        expect(await User.findAll()).to.have.lengthOf(5);
      });

      xit('responds with 400 if the id is not a number', async () => {
        const response = await app.delete('/api/users/not_a_valid_id');
        expect(response.status).to.equal(400);
        // No users should have been deleted
        expect(await User.findAll()).to.have.lengthOf(5);
      });

      xit('responds with 403 if the user is a teacher with mentees', async () => {
        // Lucy is a teacher who has one mentee. We shouldn't be able to delete Lucy.
        let lucy = users.LUCY;
        const response = await app.delete(`/api/users/${lucy.id}`);
        expect(response.status).to.equal(403);
        // No users should have been deleted
        expect(await User.findAll()).to.have.lengthOf(5);
      });
    });
  });
});
