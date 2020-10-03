const express = require('express');
const morgan = require('morgan');
const path = require('path');
const app = express();

if (process.env.NODE_ENV !== 'testing') app.use(morgan('dev'));

app.use(express.json());

app.use('/api/users', require('./routes/users'));
app.use('/api/*', (req, res) => {
  res.status(404).send({ message: 'Not Found' });
});

app.use(express.static(path.join(__dirname, '..', 'public')));

app.use('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public/index.html'));
});

app.use((err, req, res, next) => {
  res.status(err.status || 500).send({ message: err.message });
});

module.exports = app;
