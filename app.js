const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const jobHandler = require('./app_modules/job_handler');
const cron = require('node-cron');
require('dotenv').config({path: path.join(__dirname, '.env')});

let jobs = new jobHandler();

const userAuth = require('./routes/authenticate');
const index = require('./routes/index');
const v1_get = require('./routes/api/v1_get');
const v1_delete = require('./routes/api/v1_delete');
const v1_put = require('./routes/api/v1_put');
const v1_post = require('./routes/api/v1_post');
const loadDB = require('./app_modules/db_migration');

const app = express();

mongoose.connect(process.env.MYDB, { useNewUrlParser: true });
mongoose.set('useCreateIndex', true);
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


cron.schedule(process.env.SCHEDULE, () => {

  jobs.on( 'done', done );

  jobs.on( 'error', ( error ) => {
    console.log('there was an error: ', error);
    jobs.removeAllListeners();
  })

  jobs.detectNewPhotos();

  function done ( obj ) {

    switch ( Object.keys(obj)[0] ) {
      case 'photos':
        console.log('files found: ', obj.photos);
        obj.photos ? jobs.addExif(obj.photos) : jobs.removeAllListeners();
        break;
      case 'exif':
        console.log('exif added: ', obj.exif);
        obj.exif ? jobs.convertAndMovePhotos() : jobs.removeAllListeners() ;
        break;
      case 'converted':
        console.log('conversion done: ', obj.converted);
        jobs.addLocation();
        break;
      case 'location':
        console.log('location added: ', obj.location);
        jobs.createPhotos();
        break;
      case 'mongo':
        console.log('photos created: ', obj.mongo);
        jobs.removeAllListeners();
        break;
      default:
        break;
    }
  }

})


module.exports = app;
