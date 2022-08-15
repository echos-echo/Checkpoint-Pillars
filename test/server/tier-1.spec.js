const { expect } = require('chai');
const { cyan } = require('chalk');
const {
  db,
  models: { User },
} = require('../../server/db');
const { logTable } = require('./utils');

const _app = require('../../server/app');
const app = require('supertest')(_app);

describe('Tier 1: Basic Fields, Class Methods, GET Routes', () => {
  describe('Sequelize', () => {
    before(() => {
      console.log(cyan(`      Take a look at server/db/User.js\n`));
    });

    beforeEach(async () => {
      await db.sync({ force: true });
    });

    describe('Basic Fields: name and userType', () => {
      describe('name', () => {
        it('name is a string', async () => {
          const hannah = await User.create({ name: 'HANNAH' });
          expect(hannah.name).to.equal(
            'HANNAH',
            'Was not able to create a user with name HANNAH'
          );
        });

        it('name must be unique', async () => {
          // We shouldn't be able to create two users with the same name.
          await User.create({ name: 'HANNAH' });
          await expect(
            User.create({ name: 'HANNAH' }),
            "Shouldn't be able to create two users with the same name (HANNAH)"
          ).to.be.rejected;
        });

        it('name cannot be null', async () => {
          // We shouldn't be able to create a user without a name.
          await expect(
            User.create({}),
            "We shouldn't be able to create a user with no name"
          ).to.be.rejected;
        });

        it('name cannot be an empty string', async () => {
          // We also shouldn't be able to create a user with an empty name.
          await expect(
            User.create({ name: '' }),
            "We shouldn't be able to create a user with an empty name"
          ).to.be.rejected;
        });
      });

      describe('userType', () => {
        it('userType can be either "STUDENT" or "TEACHER"', async () => {
          const hannah = await User.create({
            name: 'HANNAH',
            userType: 'TEACHER',
          });
          const ali = await User.create({ name: 'ALI', userType: 'STUDENT' });
          expect(hannah.userType).to.equal('TEACHER');
          expect(ali.userType).to.equal('STUDENT');
        });

        it('userType defaults to "STUDENT" if not provided', async () => {
          const ali = await User.create({ name: 'ALI' });
          expect(ali.userType).to.equal('STUDENT');
        });

        it('userType cannot be null', async () => {
          const aliPromise = User.create({
            name: 'ALI',
            userType: null,
          });
          await expect(
            aliPromise,
            "We shouldn't be able to create a user with a null userType"
          ).to.be.rejected;
        });

        it('userType can ONLY be either "STUDENT" or "TEACHER"', async () => {
          const aliPromise = User.create({
            name: 'ALI',
            userType: 'EAGER_TO_LEARN', // Invalid userType! This promise should reject.
          });
          await expect(
            aliPromise,
            "We shouldn't be able to create a user with invalid userType (EAGER_TO_LEARN)"
          ).to.be.rejected;
        });
      });
    });

    describe('Class Method: findUnassignedStudents', () => {
      it('User.findUnassignedStudents is a class method', () => {
        expect(User.findUnassignedStudents).to.be.a(
          'function',
          "findTeachersAndMentees isn't a class method"
        );
      });

      it('User.findUnassignedStudents returns all students who do not have a mentor', async () => {
        const freddy = await User.create({
          name: 'FREDDY',
          userType: 'TEACHER',
        });
        await Promise.all([
          User.create({ name: 'JERRY', mentorId: freddy.id }),
          User.create({ name: 'ALI' }),
          User.create({ name: 'SARAH' }),
        ]);
        const unassignedStudents = await User.findUnassignedStudents();
        expect(unassignedStudents).to.be.a(
          'array',
          'User.findUnassignedStudents should return (a Promise that resolves to) an array'
        );
        expect(unassignedStudents).to.have.lengthOf(
          2,
          'There should be only two unassigned students'
        );
        const studentNames = unassignedStudents.map((student) => student.name);
        expect(studentNames).to.have.members(['ALI', 'SARAH']);
      });
    });
  });

  describe('Express', () => {
    before(() => {
      console.log(cyan(`      Take a look at server/routes/users.js`));
    });

    before(() => {
      logTable();
      /*
        We're seeding the database with five sample users so that our
        Express routes have some data to retrieve. The ids may be different,
        but the table would look something like this:
        .-----------------------------------.
        |               users               |
        |-----------------------------------|
        | id |  name  | userType | mentorId |
        |----|--------|----------|----------|
        |  1 | MOE    | STUDENT  |        2 |
        |  2 | LUCY   | TEACHER  | null     |
        |  3 | HANNAH | TEACHER  | null     |
        |  4 | WANDA  | STUDENT  | null     |
        |  5 | EDDY   | STUDENT  | null     |
        '-----------------------------------'
      */
    });

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
      await moe.setMentor(lucy, { hooks: false });
    });

    describe('GET /api/users/unassigned', () => {
      it('responds with all unassigned students', async () => {
        const response = await app.get('/api/users/unassigned');
        expect(response.status).to.equal(200);
        expect(response.body).to.be.an('array');
        const names = response.body.map((user) => user.name);
        expect(names).to.include('WANDA');
        expect(names).to.include('EDDY');
      });

      it('does not include any teachers in the response', async () => {
        const response = await app.get('/api/users/unassigned');
        const names = response.body.map((user) => user.name);
        expect(names).to.not.include(
          'LUCY',
          'LUCY is a teacher, but was included in the response'
        );
        expect(names).to.not.include(
          'HANNAH',
          'HANNAH is a teacher, but was included in the response'
        );
      });

      it('does not include any students who have a mentor', async () => {
        const response = await app.get('/api/users/unassigned');
        const names = response.body.map((user) => user.name);
        expect(names).to.not.include(
          'MOE',
          'Students with a mentor should not be included'
        );
        expect(response.body.length).to.equal(2);
      });
    });
  });
});
