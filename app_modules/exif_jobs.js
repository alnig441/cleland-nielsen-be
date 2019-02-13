const fastExif = require('fast-exif');
const mongoose = require('mongoose');
const photoSchema = require('../schemas/schemas').photoSchema;
const Photo = mongoose.model('photo', photoSchema);
const baseUrl = process.env.NODE_ENV == 'development' ? '/Volumes/WD-USB-DISK/photoapptemp/' : process.env.PHOTOS_MOUNT_POINT + '/photoapptemp/';

parseExifInfo = {

    default: function(file, callback){

        console.log('incoming: ', file)

        fastExif.read(baseUrl + file, callback)
            .then(result => {

                if ( result && result.exif.DateTimeOriginal ) {

                    let photo = new Photo();

                    photo.set({
                        created : result.exif.DateTimeOriginal,
                        'image.fileName': file
                    })

                    let gpsObj = {
                        file: file,
                        latitude: null,
                        longitude: null,
                        created: null,
                    };

                    if (result.gps && result.gps.GPSLatitude) {
                        gpsObj.latitude = this.convertCoordinates({
                            coordinate: result.gps.GPSLatitude,
                            reference: result.gps.GPSLatitudeRef
                        });
                        gpsObj.longitude = this.convertCoordinates({
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
                console.log('exif error: ', err)
                callback(err)
            })

    },

    convertCoordinates: function (data) {
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

}

module.exports = parseExifInfo.default;