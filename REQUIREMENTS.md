# Pillars Project

## Overview

You are the lead engineer for Acme Tutors, an educational services company. Your job is to complete a tutoring dashboard for students and their mentors. Your team has already built a fully-functional front-end, as well as test specs for all the required server-side business features. Your fullstack expertise is required to complete the app. Before getting started, please carefully review the expectations.

## Requirements

The feature requirements detailed below will serve as your primary source of truth for attempting the project. The provided test specs are there to supplement your development process. However, your score will be based on the number of requirements implemented. **Code that does not pass the related test specs, but still accomplishes the required feature will receive credit.**

These requirements are organized into _five tiers of increasing difficulty_. We strongly recommend that you work on these tiers in order, finishing Tier 1 before starting Tier 2, and so on. If you get stuck, you are free to move on to later tiers, but keep in mind that some later features may depend on earlier features.

Your final evaluation will be weighted as follows:

- Requirements score (75%)
- [Rubric score](https://docs.google.com/spreadsheets/d/1JctZDSVLImKT-sJ7BwhVPrHgZ17pRSuE0FhbLKLxsBs/edit?usp=sharing) (25%)
- Extra credit (10% max)

### FEATURES

#### Tier 1: Basic Fields, Class Methods, GET Routes (8 total)

- Sequelize: name Field

  - [ ] must be a string
  - [ ] may not be empty or null
  - [ ] must be unique

- Sequelize: userType Field

  - [ ] must be either STUDENT or TEACHER
  - [ ] must be STUDENT by default
  - [ ] may not be null

- Sequelize: User.findUnassignedStudents Class Method

  - [ ] returns all students who do not have a mentor

- Express: GET [`/api/users/unassigned`](http://localhost:3000/api/users/unassigned)

  - [ ] responds with all students who do not have a mentor

If you've finished all the Tier 1 requirements, now's a good time to commit your work and push to GitHub:

`git commit -am "Tier 1" && git push origin main`

#### Tier 2: Eager Loading, One-To-Many Associations (3 total)

- Sequelize: User.findTeachersAndMentees Class Method

  - [ ] returns all teachers
  - [ ] includes all teachers' mentees

- Express: GET [`/api/users/teachers`](http://localhost:3000/api/users/teachers)

  - [ ] responds with all teachers and their assigned mentees

If you've finished all the Tier 2 requirements, now's a good time to commit your work and push to GitHub:

`git commit -am "Tier 2" && git push origin main`

#### Tier 3: Virtual Fields, Route Parameters, DELETE Routes (5 total)

- Sequelize: Virtual Fields

  - [ ] isStudent is true if (and only if) the user is a STUDENT
  - [ ] isTeacher is true if (and only if) the user is a TEACHER
  - [ ] isStudent and isTeacher are both virtual fields (i.e. they do not appear in the database)

- Express: DELETE `/api/users/:id`

  - [ ] deletes a specific user by their id (e.g. DELETE `http://localhost:3000/api/users/5` would delete the user with id 5)
  - [ ] responds with the appropriate status codes (204 if user was successfully deleted, 404 if the user does not exist, 400 if id is not a valid number)

If you've finished all the Tier 3 requirements, now's a good time to commit your work and push to GitHub:

`git commit -am "Tier 3" && git push origin main`

#### Tier 4: POST Routes, Request Body (2 total)

- Express: POST `/api/users`

  - [ ] creates a new user based on the JSON data submitted in the request body
  - [ ] responds with the appropriate status codes (201 if user was successfully created, 409 if the provided name is already taken)

If you've finished all the Tier 4 requirements, now's a good time to commit your work and push to GitHub:

`git commit -am "Tier 4" && git push origin main`

#### Tier 5: Sequelize Update Hook, PUT Routes, Express Error Handling (6 total)

- Sequelize: Updating Users

  - [ ] a user's new mentor must be a TEACHER
  - [ ] a STUDENT may not be changed to TEACHER if they have a mentor
  - [ ] a TEACHER may not be changed to STUDENT if they have mentees

- Express: PUT `/api/users/:id`

  - [ ] updates an existing user by their id based on the JSON data submitted in the request body
  - [ ] responds with the appropriate status codes (200 if user was successfully updated, 404 if the user does not exist, 403 if the requested update is forbidden)

- Express: Error Handling
  - [ ] all Express routes respond with status code 500 if the database is down

#### Extra Credit (10 EC total)

Congrats! You have completed these essential API features! Don't forget to `git commit -m Completed Requirements`. If you still have time, you are encouraged to work through these additional extra credit features:

- CSS

  > We need to ensure the site is responsive, with a stunning User Experience. Feel free to edit the CSS in `public/assets/style.css`. You are also welcome to edit the provided client-side code in /client/index.js (e.g. by adding classes or ids to elements)

  - [ ] Layout is responsive to viewports of any size (2 EC points)
  - [ ] Layout is visually stunning, including colors, fonts, layout, and animations (2 EC points)

- Sequelize

  > It would be convenient to know which other students are assigned the same mentor; this sounds like a job for an instance method!

  - [ ] The instance method `getPeers()` returns all other students assigned to that users's mentor (an empty array if the student has no mentor or if they are the only student assigned to that mentor) (2 EC points)

  > Moreover, we'd like to be able to group students together into different "subjects" (e.g. Biology, English). A subject may have many different users, and a user may be in many different subjects.

  - [ ] The Sequelize model Subject has a name field (string) and a many-to-many relationship with User (e.g. `user.getSubjects()` returns all the subjects that user is assigned to, and `subject.getUsers()` returns all users assigned to that subject) (2 EC points)

- Express

  > We would like to build some search functionality, which will prove especially useful when we have hundreds of users to keep track of.

  - [ ] Express route `/api/users` filters results by query parameters (e.g. GET `/api/users?name=ed` responds with all users whose name includes "ed": Freddy, Eddy, Red) (2 EC points)

### Grading Formula

```javascript
const getTotal = (rawRequirementsScore, rawRubricScore, rawExtraCredit) => {
  const totalRequirementScore = (rawRequirementsScore / 24) * 100 * 0.75;
  const totalRubricScore = (rawRubricScore / 48) * 100 * 0.25;
  const totalExtraCredit = rawExtraCredit * 0.1;

  const total = totalRequirementScore + totalRubricScore + totalExtraCredit;
  return total;
};
```
