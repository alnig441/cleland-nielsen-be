const fs = require('fs');
const util = require('util');
const append = util.promisify(fs.appendFile);
const events = require('events');
const fileHandler = require('./file_jobs');
const exifHandler = require('./exif_jobs');
const googleApiHandler = require('./google_jobs');
const mongoHandler = require('./mongo_jobs');

const jobHandler = function() {

    events.EventEmitter.call( this );

    this.files = [];
    this.exifAdded = [];
    this.exifAndLocationAdded = [];
    this.noLocationAdded = [];
    this.infoType;

    this.detect = fileHandler.detectPhotos;
    this.convertAndMove = fileHandler.convertAndMovePhotos;
    this.exifHandler = exifHandler;
    this.googleApiHandler = googleApiHandler;
    this.mongoHandler = mongoHandler;


    this.buildDocument = ( error, document ) => {

      if (document) {
        document.hasOwnProperty('gps') ?
          Object.values(document.gps).length > 0 ?
            this.exifAdded.push(document):
            typeof document.document == 'string' ?
              null:
              this.noLocationAdded.push(document):
          this.exifAndLocationAdded.push(document);
      }

      error ? this.emit( 'error', error ) : this.procede();

    };

    this.procede = () => {

        switch( this.infoType ) {
            case 'exif':
                this.files.length == 0 ?
                  this.emit( 'done', { 'exif' : this.exifAdded.length }) :
                  this.exifHandler( this.files.shift(), this.buildDocument );
                break;
            case 'location':
                this.exifAdded.length == 0 ?
                  this.emit( 'done', { 'location': this.exifAndLocationAdded.length }) :
                  this.googleApiHandler( this.exifAdded.shift(), this.buildDocument );
                break;
            default:
                writeToLog(`\nINFO:\tUnhandled DONE emitted for ${this.infoType}`);
                this.emit( 'done' );
                break;
        }

    };

    this.convertMoveNext = ( error ) => {

        if ( error ) {
            this.emit( 'error', error );
        }
        this.files.length > 0 ? this.convertAndMove( this.files.shift(), this.convertMoveNext ) : this.emit( 'done', { converted: true }) ;

    }

    this.createCallBack = (error, result) => {

      if(error) {
        let msg = error.msg || error;
        this.emit('error', msg);
      } else {
        this.emit('done', {mongo: result})
      }

    }


    return this;
}

jobHandler.prototype = new events.EventEmitter();

jobHandler.prototype.detectNewPhotos = function () {

    this.detect( ( error, result ) => {
      error != null ?
        this.emit('error', error ) :
        this.emit('done', { photos: result }) ;
    });

    return this;
}

jobHandler.prototype.convertAndMovePhotos = function ( files ) {

  let concatenatedArray = this.exifAdded.concat(this.noLocationAdded);

    concatenatedArray.forEach( ( element, index, array ) => {
      let isPhoto = element.document._doc.hasOwnProperty('image');
      Object.values(element.originalNameAlternateName).length > 0 ?
        this.files.push({ fileName: Object.keys(element.originalNameAlternateName)[0], saveAs: Object.values(element.originalNameAlternateName)[0], isPhoto : isPhoto }) :
        this.files.push( element.document.image.fileName );

      if ( index == array.length -1 ){
        this.files.length > 0 ?
          this.convertAndMove( this.files.shift(), this.convertMoveNext ) :
          this.emit('done', { converted:true});
      }

    });


    return this;
}

jobHandler.prototype.addExif = function ( files ) {

    this.infoType = 'exif';

    this.files = files;

    this.exifHandler( this.files.shift(), this.buildDocument );

    return this;

}

jobHandler.prototype.addLocation = function () {

    this.infoType = 'location';

    this.googleApiHandler( this.exifAdded.shift(), this.buildDocument );

    return this;
}

jobHandler.prototype.photoExists = function ( file, cb ) {

    this.mongoHandler.photoExistsInDB( file )
      .then(result => {
        let exists = result.length > 0 ? result[0].image.fileName : false;
        cb(null, exists);
      })
      .catch( error => {
        this.emit('error', error);
      })
}

jobHandler.prototype.createDocuments = function () {

  if (this.noLocationAdded.length == 0) {
    this.mongoHandler.createDocuments(this.exifAndLocationAdded, this.createCallBack);
  } else {
    this.noLocationAdded.forEach((element, index, array) => {
      if (element.document){
        this.exifAndLocationAdded.push(element.document);
        if (index == array.length - 1) {
          this.mongoHandler.createDocuments(this.exifAndLocationAdded, this.createCallBack);
        }
      }
    })
  }

}

jobHandler.prototype.clearRegisters = function () {
  this.files = [];
  this.exifAdded = [];
  this.exifAndLocationAdded = [];
}

function writeToLog ( message ) {

    append( `.schedule-log-${process.env.NODE_ENV}`, message )
        .then(() => {
            return null;
        })
}

module.exports = jobHandler;
