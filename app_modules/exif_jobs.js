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

                    cbToJobHandler( null, null );

                }


            })
            .catch(err => {

                cbToJobHandler( err );

            })

    }

}

function extractData ( exifData, document ) {

    let gps;

    if ( exifData.gps && exifData.gps.GPSLatitude ) {

        gps = {
            latitude    : convertCoordinates({ coordinate: exifData.gps.GPSLatitude, reference: exifData.gps.GPSLatitudeRef}),
            longitude   : convertCoordinates({ coordinate: exifData.gps.GPSLongitude, reference: exifData.gps.GPSLongitudeRef})
        }

    }

    if ( exifData.exif.DateTimeOriginal ) {

        document.set({ created: exifData.exif.DateTimeOriginal })

    }

    return document.created ? { document: document, gps: gps } : null;

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

module.exports = exifJobs.default;