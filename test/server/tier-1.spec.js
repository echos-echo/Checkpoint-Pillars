const { expect } = require('chai');
const { cyan } = require('chalk');
const {
  db,
  models: { User },
} = require('../../server/db');

const _app = require('../../server/app');
const app = require('supertest')(_app);

describe('Tier 1: Basic Fields, Class Methods, GET Users', () => {
  describe('Sequelize', () => {
    before(() => {
      console.log(cyan(`      Take a look at server/db/User.js\n`));
    });

    beforeEach(async () => {
      await db.sync({ force: true });
    });

    describe('Basic Fields: name and userType', () => {
      describe('name', () => {
        xit('name is a string', async () => {
          const hannah = await User.create({ name: 'HANNAH' });
          expect(hannah.name).to.equal('HANNAH');
        });

        xit('name must be unique', async () => {
          // We shouldn't be able to create two users with the same name.
          await User.create({ name: 'HANNAH' });
          await expect(User.create({ name: 'HANNAH' })).to.be.rejected;
        });

        xit('name cannot be null', async () => {
          // We shouldn't be able to create a user without a name.
          await expect(User.create({})).to.be.rejected;
        });

        xit('name cannot be an empty string', async () => {
          // We also shouldn't be able to create a user with an empty name.
          await expect(User.create({ name: '' })).to.be.rejected;
        });
      });

      describe('userType', () => {
        xit('userType can be either "STUDENT" or "TEACHER"', async () => {
          const hannah = await User.create({
            name: 'HANNAH',
            userType: 'TEACHER',
          });
          const ali = await User.create({ name: 'ALI', userType: 'STUDENT' });
          expect(hannah.userType).to.equal('TEACHER');
          expect(ali.userType).to.equal('STUDENT');
        });

        xit('userType can ONLY be either "STUDENT" or "TEACHER"', async () => {
          const aliPromise = User.create({
            name: 'ALI',
            userType: 'EAGER_TO_LEARN', // Invalid userType! This promise should reject.
          });
          await expect(aliPromise).to.be.rejected;
        });

        xit('userType defaults to "STUDENT" if not provided', async () => {
          const ali = await User.create({ name: 'ALI' });
          expect(ali.userType).to.equal('STUDENT');
        });
      });
    });

    describe('Class Method: findUnassignedStudents', () => {
      xit('User.findUnassignedStudents is a class method', () => {
        expect(User.findUnassignedStudents).to.be.a('function');
      });

      xit('User.findUnassignedStudents returns all students who do not have a mentor', async () => {
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
        expect(unassignedStudents).to.be.a('array');
        expect(unassignedStudents).to.have.lengthOf(2);
        const studentNames = unassignedStudents.map((student) => student.name);
        expect(studentNames).to.have.members(['ALI', 'SARAH']);
      });
    });
  });

  describe('Express', () => {
    before(() => {
      console.log(cyan(`      Take a look at server/routes/users.js\n`));
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
      await moe.setMentor(lucy);
    });

    describe('GET /api/users/unassigned', () => {
      xit('responds with all unassigned students', async () => {
        const response = await app.get('/api/users/unassigned');
        expect(response.status).to.equal(200);
        expect(response.body).to.be.an('array');
        expect(response.body.length).to.equal(2);
        const names = response.body.map((user) => user.name);
        expect(names).to.include('WANDA');
        expect(names).to.include('EDDY');
      });
    });

    describe('GET /api/users/teachers', () => {
      xit('responds with all teachers', async () => {
        const response = await app.get('/api/users/teachers');
        expect(response.status).to.equal(200);
        expect(response.body).to.be.an('array');
        expect(response.body.length).to.equal(2);
        const names = response.body.map((user) => user.name);
        expect(names).to.include('LUCY');
        expect(names).to.include('HANNAH');
      });

      xit('responds with all teachers and their mentees', async () => {
        const response = await app.get('/api/users/teachers');
        expect(response.status).to.equal(200);
        expect(response.body).to.be.an('array');

        const lucy = response.body.find((user) => user.name === 'LUCY');
        expect(lucy).to.have.property('mentees');
        expect(lucy.mentees).to.be.an('array');
        const [moe] = lucy.mentees;
        expect(moe.name).to.equal('MOE');
      });
    });
  });
});
