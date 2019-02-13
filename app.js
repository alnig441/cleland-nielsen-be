const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const jobHandler = require('./app_modules/job_handler');
require('dotenv').config({path: path.join(__dirname, '.env')});

const userAuth = require('./routes/authenticate');
const index = require('./routes/index');
const v1_get = require('./routes/api/v1_get');
const v1_delete = require('./routes/api/v1_delete');
const v1_put = require('./routes/api/v1_put');
const v1_post = require('./routes/api/v1_post');
const loadDB = require('./app_modules/db_migration');

const jobs = new jobHandler();

const app = express();

mongoose.connect(process.env.MYDB, { useNewUrlParser: true });
const db = mongoose.connection;
db.on('open', () => console.log('datebase open!'));
db.on('error', (error) => console.log('db error: ', error));

/* DATABASE MIGRATION */
if (process.env.MIGRATE_FILE) {
  console.log('batch loading');
  loadDB(`public/${process.env.MIGRATE_FILE}`);
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// app.use('photos', express.static(process.env.PHOTOS_MOUNT_POINT));

app.all('*', userAuth);
app.use('/', index);
app.use(`/${process.env.LATEST_API_VERSION}`, [v1_get, v1_put, v1_post, v1_delete]); //latest api

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


jobs.detectNewPhotos();

jobs.on('photos', (files) => {
  if (files.length > 0){
    console.log('files found - procede with exif: ', files);
    jobs.addExif(files);
  } else {
    console.log('photoapptemp empty!')
  }

})

jobs.on('exif', (documents) => {
  if (documents.length > 0) {
    console.log('exif done - procede with location');
    jobs.addLocation();
  } else {
    console.log('exif done - no documents')
  }
})

jobs.on('location', (documents) => {
  if (documents.length > 0) {
    console.log('location done - save to db')
  } else {
    console.log('location done - no documents')
  }
})
jobs.on('error', (error) => {
  console.log('there was an error: ', error);
})

module.exports = app;
