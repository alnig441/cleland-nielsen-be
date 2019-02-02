const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');

const index = require('./routes/index');
const api_latest = require('./routes/api_v1');
const userAuth = require('./routes/authenticate');

const app = express();

mongoose.connect(process.env.MYDB, { useNewUrlParser: true });
const db = mongoose.connection;
db.on('open', () => console.log('datebase open!'));
db.on('error', (error) => console.log('db error: ', error));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.all('*', userAuth);
app.use('/', index);
app.use(`/${process.env.LATEST_API_VERSION}`, api_latest); //latest api

//catch all '/api' and redirect to appropriate version
app.use(/\/api/i, (req, res) => {
  let requested_version = req.originalUrl.match(/[v][0-9]?[0-9]/i);

  let uri = requested_version ?
      req.originalUrl.replace(/\/api/i, '') :
      req.originalUrl.replace(/\/api/i, '/v1');

  res.redirect(307, uri);
})

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
