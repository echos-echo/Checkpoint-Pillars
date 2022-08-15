const Sequelize = require('sequelize');
const db = require('./db');

const User = db.define('user', {
  // Add your Sequelize fields here
  name: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true
    }
  },
  userType: {
    type: Sequelize.ENUM('STUDENT', 'TEACHER'),
    defaultValue: 'STUDENT',
    allowNull: false
  },
  isStudent: {
    type: Sequelize.DataTypes.VIRTUAL,
    get() {
      return this.userType === 'STUDENT';
    }
  },
  isTeacher: {
    type: Sequelize.DataTypes.VIRTUAL,
    get() {
      return this.userType === 'TEACHER';
    }
  }
});

// Class method: returns all students who are not assigned a mentor
User.findUnassignedStudents = async () => {
  return await User.findAll({
    where: {
      userType: 'STUDENT',
      mentorId: {
        [Sequelize.Op.is]: null
      }
    }
  });
}

// Class method: returns array of teacher users that include their list of mentees (as an array, may be empty)
User.findTeachersAndMentees = async () => {
  return await User.findAll({
    where: {
      userType: 'TEACHER'
    },
    include: {
      model: User,
      as: 'mentees'
    }
  })
}

// Instance method: returns array of all peers that have the same mentor as this, sans this student
User.prototype.getPeers = async function() {
  return await User.findAll({
    where: {
      mentorId: this.mentorId,
      id: {
        [Sequelize.Op.not]: this.id
      }
    }
  });
}

User.beforeUpdate(async update => {
  // if user is a TEACHER!!! --> and it matches the update's name + has at least 1 mentee
  if ((await User.findTeachersAndMentees()).some(teacher => teacher.name === update.name && teacher.mentees.length > 0)) {
    throw new Error(`${update.name} has a mentee! They cannot become a student yet`)
  } else {
    // if user is a STUDENT
    const maybeMentor = await User.findByPk(update.mentorId); // the mentor user via the given id

    // if they are trying update to make mentor null, let them! it will let the unassigning functions work
    if (update.mentorId === null) {
      return update;
    }

    // other scenarios...
    if ((await User.findByPk(update.id)).mentorId !== null ){
      // if the given student from database has a mentor
      throw new Error(`${update.name} has a mentor! They cannot become a teacher yet`)
    } else if (maybeMentor !== null && maybeMentor.userType === 'STUDENT'){
      // if the mentor via the given id is in fact, not a teacher!!
      throw new Error(`${maybeMentor.name} is not a teacher! Cannot make them a mentor.`);
    }
    // if passes all the correct conditions, the user may pass
    return update;
  }
})

/**
 * We've created the association for you!
 *
 * A user can be related to another user as a mentor:
 *       SALLY (mentor)
 *         |
 *       /   \
 *     MOE   WANDA
 * (mentee)  (mentee)
 *
 * You can find the mentor of a user by the mentorId field
 * In Sequelize, you can also use the magic method getMentor()
 * You can find a user's mentees with the magic method getMentees()
 */

User.belongsTo(User, { as: 'mentor' });
User.hasMany(User, { as: 'mentees', foreignKey: 'mentorId' });

module.exports = User;
