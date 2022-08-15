const router = require('express').Router();
const { Sequelize } = require('sequelize');
const {
  models: { User },
} = require('../db');

/**
 * All of the routes in this are mounted on /api/users
 * For instance:
 *
 * router.get('/hello', () => {...})
 *
 * would be accessible on the browser at http://localhost:3000/api/users/hello
 *
 * These route tests depend on the User Sequelize Model tests. However, it is
 * possible to pass the bulk of these tests after having properly configured
 * the User model's name and userType fields.
 */

// Add your routes here:

router.get('/', async (req, res, next) => {
  try {
    res.send(await User.findAll({ where: { name: { [Sequelize.Op.iLike]: `%${req.query.name}%`}}}));
  } catch(err) {
    next(err);
  }
})

// gets all students not assigned to a mentor
router.get('/unassigned', async (req, res, next) => {
  try {
    res.send(await User.findUnassignedStudents());
  } catch(err) {
    next(err);
  }
})

// gets all teachers (and their array of mentees)
router.get('/teachers', async (req, res, next) => {
  try {
    res.send(await User.findTeachersAndMentees());
  } catch(err) {
    next(err);
  }
})

// put/delete routes for /:id
router.route('/:id')
  // will update the user at the given id
  .put(async (req, res, next) => {
    try {
      const user = await User.findByPk(req.params.id);
      // if the user does not exist, sends 404. if they do, updates the row
      user === null ? res.sendStatus(404) : res.status(200).send(await user.update(req.body));
    } catch(err) {
      next(err);
    }
  })
  // will delete the user of the given id
  .delete(async (req, res, next) => {
    try {
      // checks if the given id is a number; will return -1 if it is not and send status 400
      if (req.params.id.search(/[0-9]/) >= 0) {
        switch (await User.findByPk(req.params.id)) {
          // if the id does not exist
          case null:
            res.sendStatus(404);
            break;
          // if the id does exist, it gets DESTROYED
          default:
            await User.destroy({ where: { id: req.params.id }});
            res.sendStatus(204);
        }
      } else {
        res.sendStatus(400);
      }
    } catch(err) {
      next(err);
    }
  })

// will create a new user if one by the given name does not already exist
router.post('/', async (req, res, next) => {
  try {
    await User.findOne({ where: { name: req.body.name }}) === null ?
      res.status(201).send(await User.create(req.body)) : res.sendStatus(409);
  } catch(err) {
    next(err);
  }
})



module.exports = router;
