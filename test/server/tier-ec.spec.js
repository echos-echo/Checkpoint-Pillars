const { expect } = require('chai');
const { cyan } = require('chalk');
const {
  db,
  models: { User, Subject },
} = require('../../server/db');

const _app = require('../../server/app');
const app = require('supertest')(_app);

describe('Extra Credit: CSS, Instance Methods, Many-to-Many, Query Params', () => {
  before(() => {
    console.log(
      cyan(`
    There are no CSS tests! You'll have to test out your styles by looking in
    the browser.\n`)
    );
  });
  describe('Sequelize', () => {
    beforeEach(async () => {
      await db.sync({ force: true });
    });

    describe('Instance Method: getPeers', () => {
      xit('getPeers is an instance method on User', async () => {
        const hannah = await User.create({ name: 'HANNAH' });
        expect(hannah.getPeers).to.be.a('function');
      });

      xit('getPeers returns all other students assigned to the same mentor', async () => {
        const freddy = await User.create({
          name: 'FREDDY',
          userType: 'TEACHER',
        });
        const [hannah] = await Promise.all([
          User.create({ name: 'HANNAH', mentorId: freddy.id }),
          User.create({ name: 'JERRY', mentorId: freddy.id }),
          User.create({ name: 'ALI', mentorId: freddy.id }),
          User.create({ name: 'SARAH' }),
        ]);
        const hannahsPeers = await hannah.getPeers();
        expect(hannahsPeers).to.be.an('array');
        expect(hannahsPeers).to.have.lengthOf(2);
        const peerNames = hannahsPeers.map((student) => student.name);
        expect(peerNames).to.have.members(['JERRY', 'ALI']);
      });
    });

    describe('Many-to-Many: Subject', () => {
      before(() => {
        console.log(
          cyan(
            `        Take a look at server/db/Subject.js and server/db/index.js\n`
          )
        );
      });

      xit('a new subject can be created with a name string', async () => {
        expect(Subject.create).to.be.a('function');
        const biology = await Subject.create({ name: 'Biology' });
        expect(biology.name).to.equal('Biology');
      });

      xit('several users can be assigned to a subject with subject.addUser', async () => {
        const biology = await Subject.create({ name: 'Biology' });
        expect(biology.addUser).to.be.a('function');
        const [hannah, jerry] = await Promise.all([
          User.create({ name: 'HANNAH' }),
          User.create({ name: 'JERRY' }),
        ]);
        await biology.addUser(hannah);
        await biology.addUser(jerry);
        const bioStudents = await biology.getUsers();
        const bioStudentNames = bioStudents.map((student) => student.name);
        expect(bioStudentNames).to.have.members(['HANNAH', 'JERRY']);
      });

      xit('several subjects can be assigned to a user with user.addSubject', async () => {
        const ali = await User.create({ name: 'ALI' });
        expect(ali.addSubject).to.be.a('function');
        const [calculus, history] = await Promise.all([
          Subject.create({ name: 'Calculus' }),
          Subject.create({ name: 'History' }),
        ]);
        await ali.addSubject(calculus);
        await ali.addSubject(history);
        const alisSubjects = await ali.getSubjects();
        const alisSubjectsNames = alisSubjects.map((subject) => subject.name);
        expect(alisSubjectsNames).to.have.members(['Calculus', 'History']);
      });
    });
  });

  describe('Express', () => {
    beforeEach(async () => {
      await db.sync({ force: true });
      await User.bulkCreate(
        [
          { name: 'Red', userType: 'TEACHER' },
          { name: 'Wanda' },
          { name: 'Eddy' },
          { name: 'Freddie' },
          { name: 'Carl', userType: 'TEACHER' },
          { name: 'Mel' },
        ],
        { hooks: false }
      );
    });

    describe('Query Params', () => {
      xit('GET /api/users?name=username responds with all users matching username', async () => {
        const response = await app.get(`/api/users?name=ed`);
        expect(response.status).to.equal(200);
        expect(response.body).to.be.an('array');
        expect(response.body).to.have.lengthOf(3);
        const usersNames = response.body.map((user) => user.name);
        expect(usersNames).to.have.members(['Red', 'Eddy', 'Freddie']);
      });
    });
  });
});
