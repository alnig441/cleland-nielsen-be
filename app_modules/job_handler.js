const events = require('events');
const fileHandler = require('./file_jobs');
const exifHandler = require('./exif_jobs');

const jobHandler = function() {

    events.EventEmitter.call(this);

    this.files = [];
    this.temp_docs= [];
    this.documents = [];
    this.index = 0;
    this.infoType;

    this.fileHandler = fileHandler;
    this.exifHandler = exifHandler;


    this.generateNext = (err, doc) => {
        this.index ++;
        if( err ){
            this.emit('error', err);
        }

        doc ? doc.gps ? this.temp_docs.push(doc) : this.documents.push(doc) : null;

        this.procede();
    };

    this.procede = () => {
        if (this.index == this.files.length) {
            this.infoType ? this.emit(this.infoType, this.documents) : this.emit('done', this.documents);
        } else {
            switch(this.infoType) {
                case 'exif':
                    this.exifHandler(this.files[this.index], this.generateNext);
                    break;
                case 'location':
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
            this.files = res;
            this.emit('photos', res);
        }
    });

    return this;
}

jobHandler.prototype.addExif = function () {

    this.infoType = 'exif';

    this.exifHandler(this.files[this.index], this.generateNext);

    return this;

}

jobHandler.prototype.addLocation = function () {

    this.infoType = 'location';

    return this;
}

module.exports = jobHandler;