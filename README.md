# Checkpoint - Pillars (Express/Sequelize)

This checkpoint is primarily to help us understand how well you've absorbed the material covered so far. It covers the main backend libraries you've learned in the curriculum so far: Express and Sequelize.

To this end — and perhaps it goes without saying — we ask that you don't help each other or cheat.

## Introduction Video (Watch This First)

[![Pillars: Getting Started](https://img.youtube.com/vi/XERflPFkcjg/0.jpg)](https://youtu.be/XERflPFkcjg)

## Resources

Please read the Academic Integrity Policy (`pillars-academic-integrity-policy.md` at the root of this repo).

## Things we're checking

- Express Routing and Route Methods
- Express Route Parameters
- Express Status Codes
- Sequelize Model Configuration
- Sequelize Hooks
- Sequelize Class Methods

## Starting

- **Fork** this repo to your own GitHub
- Read the REQUIREMENTS.md
- Clone your fork to your local machine.
- Make sure your Postgres database is running!
- Create two databases:
  - Development Database: `createdb pillars`
  - Test Database: `createdb pillars_test`
- `npm install`
- You can run `npm run test-dev` (windows users can run `npm run test-windows`) which will run the test suite continuously (`npm test` runs the tests only once).
- In a separate terminal, you can run `npm run start-dev-seed` (windows users can run `npm run start-windows-server-seed` in one terminal and `npm run start-windows-client` in another) which will start [a development server on port 3000](http://localhost:3000). It will also re-seed the database with fresh data whenever you save a file. (If you'd rather not re-seed on every change, you can run `npm run start-dev` (or `npm run start-windows-server`) instead.)
- Start working through the tests in `test/`. You have to mark them as active (from pending) by changing `xit` to `it`
- Read through the project structure. You'll be working exclusively in `server/db/User.js` and `server/routes/users.js`.
- After three hours, take a break. Before the break, do a `git commit -am "BREAKTIME" && git push origin main`. You are encouraged to keep working on the project and submit a final version by the end of day.

## IMPORTANT TIPS FOR SUCCESS

- **READ ALL COMMENTS CAREFULLY.** Specs often assume you have read the comments.
- After you have correctly defined the User model's `name` and `userType` fields, you can probably run all the remaining model and route specs in _any order_ (note, not 100% guaranteed). So if you get stuck, **move on and try some other specs**.
- You should `git commit` and `git push` very frequently — even for each passing spec if you like! This will prevent you from losing work.
- That this project includes some working front-end code in `client/index.js`, bundled with Webpack into `public/bundle.js`. You won't need to write any front-end code to fulfill the requirements, but you are welcome to read through that front-end code to understand how it uses axios to make requests of the back-end.
- If you are uncertain what a spec is doing or asking of you, or you've gotten stuck, _ask for help_. We may not be able to give you any hints, but you won't know if you don't ask, and sometimes the problem is technical rather than related to the checkpoint itself.
- Please don't submit `console.log`s and other debug code.

## Submitting

To submit your final version:

`git commit -am "FINAL" && git push origin main`
