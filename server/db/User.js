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

User.findUnassignedStudents = async () => {
  const users =  await User.findAll({
    where: {
      userType: 'STUDENT',
      mentorId: {
        [Sequelize.Op.is]: null
      }
    }
  });
  return users;
}

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

// User.beforeUpdate(async function(update) {
//   const maybeMentor = await User.findByPk(update.mentorId);
//   if (maybeMentor !== null && maybeMentor.userType === 'TEACHER') {
//     return update;
//   } else {
//     throw new Error('Not a teacher!!!')
//   }
// })

User.beforeUpdate(async function(update) {
  // can probably do something with findTeachersAndMentees
  // in the array, if the object with the update.id is found... has a mentee lol

  // array of mentor objects with a mentees array inside
  const hasMentees = await User.findTeachersAndMentees();

  // if user is a teacher that has at least one mentee!!!
  if (hasMentees.some(teacher => teacher.name === update.name && teacher.mentees.length > 0)) {
    throw new Error(`${update.name} has a mentee! They cannot become a student yet`)
  } else {
    // for students, OR teachers with no mentees
    const maybeMentor = await User.findByPk(update.mentorId);
    const user = await User.findByPk(update.id);

    if (user.mentorId !== null){
      throw new Error(`${update.name} has a mentor! They cannot become a teacher yet`)
    } else if (maybeMentor !== null && maybeMentor.userType === 'STUDENT'){
      throw new Error('Not a teacher!!!');
    }
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
