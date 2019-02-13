const events = require('events');
const fileHandler = require('./file_jobs');
const exifHandler = require('./exif_jobs');
const googleApiHandler = require('./google_jobs');

const jobHandler = function() {

    events.EventEmitter.call(this);

    this.files = [];
    this.temp_docs = [];
    this.documents = [];
    this.infoType;

    this.fileHandler = fileHandler;
    this.exifHandler = exifHandler;
    this.googleApiHandler = googleApiHandler;


    this.generateDocument = (err, doc) => {

        doc ? doc.gps ? this.temp_docs.push(doc) : this.documents.push(doc) : null;

        err ? this.emit('error', err) : this.procedeThroughFiles();

    };

    this.procedeThroughFiles = () => {
        if (this.files.length == 0) {
            this.infoType  == 'exif' ? this.emit(this.infoType, this.temp_docs) : this.emit(this.infoType, this.documents);
        } else {
            switch(this.infoType) {
                case 'exif':
                    this.exifHandler(this.files.shift(), this.generateDocument);
                    break;
                case 'location':
                    this.googleApiHandler(this.temp_docs.shift(), this.generateDocument);
                    break;
                default:
                    this.emit('done');
                    break;
            }
        }
    };

    return this;
}

jobHandler.prototype = new events.EventEmitter();

jobHandler.prototype.detectNewPhotos = function () {

    this.fileHandler(( err, res ) => {
        if ( err ) {
            this.emit('error', err);
        } else {
            this.emit('photos', res);
        }
    });

    return this;
}

jobHandler.prototype.addExif = function (files) {

    this.infoType = 'exif';

    this.files = files;

    this.exifHandler(this.files.shift(), this.generateDocument)

    return this;

}

jobHandler.prototype.addLocation = function () {

    this.infoType = 'location';

    this.googleApiHandler(this.temp_docs.shift(), this.generateDocument)

    return this;
}

module.exports = jobHandler;