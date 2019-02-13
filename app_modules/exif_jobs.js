const fastExif = require('fast-exif');
const mongoose = require('mongoose');
const photoSchema = require('../schemas/schemas').photoSchema;
const Photo = mongoose.model('photo', photoSchema);
const baseUrl = process.env.NODE_ENV == 'development' ? '/Volumes/WD-USB-DISK/photoapptemp/' : process.env.PHOTOS_MOUNT_POINT + '/photoapptemp/';

const exifJobs = {

    default: function(file, callback){

        fastExif.read(baseUrl + file, callback)
            .then(result => {

                if ( result && result.exif.DateTimeOriginal ) {

                    let photo = new Photo();

                    photo.set({
                        created : result.exif.DateTimeOriginal,
                        'image.fileName': file
                    })

                    let gpsObj = {
                        latitude: null,
                        longitude: null,
                    };

                    if (result.gps && result.gps.GPSLatitude) {
                        gpsObj.latitude = convertCoordinates({
                            coordinate: result.gps.GPSLatitude,
                            reference: result.gps.GPSLatitudeRef
                        });
                        gpsObj.longitude = convertCoordinates({
                            coordinate: result.gps.GPSLongitude,
                            reference: result.gps.GPSLongitudeRef
                        });
                    }

                    callback( null, { document: photo, gps: gpsObj} );

                } else {
                    callback( null, null )
                }


            })
            .catch(err => {
                callback(err)
            })

    }

}

function convertCoordinates (data) {
    let isNegative = data.reference.toLowerCase() == 's' || data.reference.toLowerCase() == 'w';
    let conversion;

    data.coordinate.forEach((elem, ind) => {
        switch (ind) {
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