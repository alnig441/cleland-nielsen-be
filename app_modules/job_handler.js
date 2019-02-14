const events = require('events');
const fileHandler = require('./file_jobs');
const exifHandler = require('./exif_jobs');
const googleApiHandler = require('./google_jobs');

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


    this.buildDocument = ( error, document ) => {

        document ? document.gps ? this.exifAdded.push( document ) : this.exifAndLocationAdded.push( document ) : null;

        error ? this.emit( 'error', error ) : this.procede();

    };

    this.procede = () => {

        switch( this.infoType ) {
            case 'exif':
                this.files.length == 0 ? this.emit( this.infoType, this.exifAdded) : this.exifHandler( this.files.shift(), this.buildDocument );
                break;
            case 'location':
                this.files.length == 0 ? this.emit( this.infoType, this.exifAndLocationAdded ) : this.googleApiHandler( this.exifAdded.shift(), this.buildDocument );
                break;
            default:
                this.emit( 'done' );
                break;
        }

    };

    this.convertMoveNext = ( error ) => {

        if ( error ) {
            this.emit( 'error', error );
        }
        if ( this.files.length > 0 ) {
            this.convertAndMove( this.files.shift(), this.convertMoveNext );
        } else {
            this.emit( 'converted' );
        }
    }

    return this;
}

jobHandler.prototype = new events.EventEmitter();

jobHandler.prototype.detectNewPhotos = function () {

    this.detect( ( error, result ) => {
        if ( error ) {
            this.emit( 'error', error );
        } else {
            this.emit( 'photos', result );
        }
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

module.exports = jobHandler;