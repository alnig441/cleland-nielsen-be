const fs = require('fs');
const util = require('util');
const append = util.promisify(fs.appendFile);
const fastExif = require('fast-exif');
const mongoose = require('mongoose');
const paginate = require('mongoose-paginate');
const photoSchema = require('../schemas/schemas').photoSchema;
photoSchema.plugin(paginate);

const Photo = mongoose.model('photo', photoSchema);

const baseUrl = process.env.NODE_ENV == 'development' ? '/Volumes/WD-USB-DISK/photoapptemp/' : process.env.PHOTOS_MOUNT_POINT + '/photoapptemp/';

const exifJobs = {

    default: function ( file, cbToJobHandler ){

        fastExif.read(baseUrl + file, cbToJobHandler)
            .then(result => {

                if ( result ) {

                    let photo = new Photo();
                    photo.set({ 'image.fileName' : file });

                    cbToJobHandler( null, extractData( result, photo ) );

                } else {
                    writeToLog(`\nINFO:\tNo exif data for ${file}`);
                    cbToJobHandler( null, file );

                }


            })
            .catch(err => {

                cbToJobHandler( err );

            })

    }

}

function convertDateTimeOriginal ( timestamp ) {
  timestamp = timestamp.toISOString();
  let newFileName = timestamp.split('.')[0].replace(/t/i, ' ').replace(/:/g, '.') + '.jpg';
  console.log('newFileName: ', newFileName)
  return newFileName;
}

function extractData ( exifData, document ) {

    let dateTimeOriginal = findExifFieldValue(exifData, 'DateTimeOriginal');
    let result = { document: document, gps: {}, originalNameAlternateName: {} };
    let originalNameAlternateName = { };
    let doRename = document.image.fileName.match(/_[0-9]{4}\./);

    if ( exifData.gps && exifData.gps.GPSLatitude ) {

        result.gps = {
            latitude    : convertCoordinates({ coordinate: exifData.gps.GPSLatitude, reference: exifData.gps.GPSLatitudeRef}),
            longitude   : convertCoordinates({ coordinate: exifData.gps.GPSLongitude, reference: exifData.gps.GPSLongitudeRef})
        }

    }

    if ( dateTimeOriginal ) {
        document.set({ created: dateTimeOriginal })
    }


    if ( process.env.RESTORE || doRename ) {
      let saveAs = dateTimeOriginal ? convertDateTimeOriginal(dateTimeOriginal) : undefined;

      originalNameAlternateName[document.image.fileName] = dateTimeOriginal ?
        saveAs :
        null ;

      doRename ?
        document.set({ 'image.fileName' : saveAs }) :
        null;

      result.originalNameAlternateName = originalNameAlternateName;
    }

    return document.created ? result: null;

}

function findExifFieldValue(exifData, field) {
  let keys = Object.keys(exifData);
  let value;

  if ( keys.length > 0 ) {
    keys.forEach((elem) => {
      exifData[elem].hasOwnProperty(field) ? value = exifData[elem][field] : null;
    })
  } else {
    exifData.hasOwnProperty(field) ? value = exifData[field] : null;
  }

  return value;
}

function convertCoordinates ( data ) {

    let isNegative = data.reference.toLowerCase() == 's' || data.reference.toLowerCase() == 'w';
    let conversion;

    data.coordinate.forEach( ( elem, ind ) => {
        switch ( ind ) {
            case 0:
                conversion = elem;
                break;
            case 1:
                conversion += elem/60;
                break;
            case 2:
                conversion += elem/3600;
                break;
        }
    })

    return conversion = isNegative ? '-' + conversion.toString(): conversion.toString() ;
}

function writeToLog ( message ) {

    append( '.schedule-log', message )
        .then(() => {
            return null;
        })
}

module.exports = exifJobs.default;
