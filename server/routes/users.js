const router = require('express').Router();
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
router.get('/unassigned', async (req, res, next) => {
  try {
    res.send(await User.findUnassignedStudents());
  } catch(err) {
    next(err);
  }
})

router.get('/teachers', async (req, res, next) => {
  try {
    res.send(await User.findTeachersAndMentees());
  } catch(err) {
    next(err);
  }
})

router.put('/:id', async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (user === null) {
      res.sendStatus(404);
    } else {
      const updated = await user.update(req.body);
      res.status(200).send(updated);
    }
  } catch(err) {
    next(err);
  }
})

router.delete('/:id', async (req, res, next) => {
  try {
    let user;
    req.params.id.search(/[^0-9]/) === -1 ? user = await User.findByPk(req.params.id) : res.sendStatus(400);
    switch (user) {
      case null:
        res.sendStatus(404);
        break;
      default:
        await User.destroy({ where: { id: req.params.id }});
        res.sendStatus(204);
    }
  } catch(err) {
    next(err);
  }
})

router.post('/', async (req, res, next) => {
  try {
    await User.findOne({ where: { name: req.body.name }}) === null ?
      res.status(201).send(await User.create(req.body)) : res.sendStatus(409);
  } catch(err) {
    next(err);
  }
})



module.exports = router;
