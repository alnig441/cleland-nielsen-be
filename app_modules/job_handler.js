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
    this.infoType;

    this.detect = fileHandler.detectPhotos;
    this.convertAndMove = fileHandler.convertAndMovePhotos;
    this.exifHandler = exifHandler;
    this.googleApiHandler = googleApiHandler;
    this.mongoHandler = mongoHandler;


    this.buildDocument = ( error, document ) => {

        document ? document.gps ? this.exifAdded.push( document ) : this.exifAndLocationAdded.push( document ) : null;

        error ? this.emit( 'error', error ) : this.procede();

    };

    this.procede = () => {

        switch( this.infoType ) {
            case 'exif':
                this.files.length == 0 ? this.emit( 'done', { 'exif' : this.exifAdded.length }) : this.exifHandler( this.files.shift(), this.buildDocument );
                break;
            case 'location':
                this.exifAdded.length == 0 ? this.emit( 'done', { 'location': this.exifAndLocationAdded.length }) : this.googleApiHandler( this.exifAdded.shift(), this.buildDocument );
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

        this.files.length > 0 ? this.convertAndMove( this.files.shift(), this.convertMoveNext ) : this.emit( 'done', { converted: true } ) ;

    }

    return this;
}

jobHandler.prototype = new events.EventEmitter();

jobHandler.prototype.detectNewPhotos = function () {

    this.detect( ( error, result ) => {

        error ? this.emit('error', error ) : result.length > 0 ? this.emit('done', { photos: result }) : this.emit('done', { photos: null} );

    });

    return this;
}

jobHandler.prototype.convertAndMovePhotos = function () {

    this.exifAdded.forEach( ( element, index ) => {
        this.files.push( element.document.image.fileName );
    })

    this.convertAndMove( this.files.shift(), this.convertMoveNext );

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

jobHandler.prototype.createPhotos = function () {

    this.mongoHandler( this.exifAndLocationAdded )
        .then(( result ) => {
            this.emit( 'done', { mongo: result });
        })
        .catch(( error ) => {
            this.emit( 'error', error.errmsg );
        })
}

function writeToLog ( message ) {

    append( '.schedule-log', message )
        .then(() => {
            return null;
        })
}

module.exports = jobHandler;