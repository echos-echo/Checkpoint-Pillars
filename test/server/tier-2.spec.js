const { expect } = require('chai');
const { cyan } = require('chalk');
const {
  db,
  models: { User },
} = require('../../server/db');

const _app = require('../../server/app');
const app = require('supertest')(_app);

describe('Tier 2: Eager Loading, One-To-Many Associations', () => {
  beforeEach(async () => {
    await db.sync({ force: true });
    const _users = await User.bulkCreate(
      [
        { name: 'MOE' },
        { name: 'LUCY', userType: 'TEACHER' },
        { name: 'WANDA' },
        { name: 'HANNAH', userType: 'TEACHER' },
        { name: 'EDDY' },
      ],
      { hooks: false }
    );
    const [moe, lucy, wanda] = _users;
    await moe.setMentor(lucy, { hooks: false });
    await lucy.addMentee(wanda, { hooks: false });
  });

  describe('Sequelize', () => {
    before(() => {
      console.log(
        cyan(
          `
      HINT: Sequelize documentation on Eager Loading:
      https://sequelize.org/master/manual/eager-loading.html#fetching-an-aliased-association \n`
        )
      );
    });

    describe('Class Method: findTeachersAndMentees', () => {
      it('User.findTeachersAndMentees is a class method', () => {
        expect(User.findTeachersAndMentees).to.be.a(
          'function',
          "findTeachersAndMentees isn't a class method!"
        );
      });

      it('User.findTeachersAndMentees returns all teachers', async () => {
        const teachers = await User.findTeachersAndMentees();
        expect(teachers).to.be.a('array', "Didn't return an array!");
        expect(teachers).to.have.lengthOf(2, 'Wrong number of teachers!');
        const teachersNames = teachers.map((teacher) => teacher.name);
        expect(teachersNames).to.have.members(
          ['LUCY', 'HANNAH'],
          "Didn't return the correct teachers!"
        );
      });

      it("User.findTeachersAndMentees returns all teachers's assigned mentees", async () => {
        const teachers = await User.findTeachersAndMentees();
        const lucy = teachers.find((teacher) => teacher.name === 'LUCY');
        const hannah = teachers.find((teacher) => teacher.name === 'HANNAH');
        expect(lucy).to.be.an('object', 'Could not find LUCY!');
        expect(hannah).to.be.an('object', 'Could not find HANNAH!');
        expect(lucy.mentees).to.be.an(
          'array',
          "Couldn't find mentees on the teachers!"
        );
        expect(hannah.mentees).to.deep.equal(
          [],
          "HANNAH shouldn't have any mentees!"
        );
        const lucysMenteesNames = lucy.mentees.map((student) => student.name);
        expect(lucysMenteesNames).to.include.members(
          ['WANDA', 'MOE'],
          "LUCY's mentees should include WANDA and MOE"
        );
      });
    });
  });

  describe('Express', () => {
    describe('GET /api/users/teachers', () => {
      it('responds with all teachers', async () => {
        const response = await app.get('/api/users/teachers');
        expect(response.status).to.equal(200);
        expect(response.body).to.be.an('array');
        expect(response.body.length).to.equal(2);
        const names = response.body.map((user) => user.name);
        expect(names).to.include('LUCY');
        expect(names).to.include('HANNAH');
      });

      it('responds with all teachers and their mentees', async () => {
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
