const https = require('https');
const key = process.env.API_KEY;
const geocodeApi = 'https://maps.googleapis.com/maps/api/geocode/json?';
const timeZoneApi = 'https://maps.googleapis.com/maps/api/timezone/json?';

const googleJobs = {

    default: function (data, cb) {

        if(data.gps.latitude){
            https.get(`${geocodeApi}latlng=${data.gps.latitude},${data.gps.longitude}&key=${key}`, (result)=> {

                var payload = '';

                result.on('data', (data) => {
                    payload += data;
                })

                result.on('error', (err) => {
                    console.log('reverse geocode api error: ', err);
                    cb(err);
                })

                result.on('end', () => {
                    let location = JSON.parse(payload);

                    if (location.status == 'OK') {
                        location.results[0].address_components.forEach((element) => {
                            element.types.find((type) => {
                                let value = element.long_name;
                                switch (type) {
                                    case 'country':
                                        data.document.set({'location.country': value});
                                        break;
                                    case 'administrative_area_level_1':
                                        data.document.set({'location.state': value})
                                        break;
                                    case 'locality':
                                        data.document.set({'location.city': value})
                                        break
                                }

                            })
                        })
                    }
                    getOffset(data, cb);

                })
            })
        } else {
            cb(null,data.document);
        }
    }


}

function getOffset(data, cb) {

    if(data){

        let timestamp = Date.parse(data.document.created);

        https.get(`${timeZoneApi}location=${data.gps.latitude},${data.gps.longitude}&timestamp=${timestamp.toString().slice(0,10)}&key=${key}`, (result) => {
            let payload = '';

            result.on('data', (data) => {
                payload += data;
            })

            result.on('error', (err) => {
                console.log('timezone api error',err);
                cb(err);
            })

            result.on('end', () => {
                let body = JSON.parse(payload);

                if(body.status == 'OK'){

                    let offset = (body.rawOffset + body.dstOffset) * 1000;
                    let actualLocalTime = new Date(timestamp + offset);

                    data.document.set({ 'date.year' : actualLocalTime.getUTCFullYear()});
                    data.document.set({ 'date.month' : actualLocalTime.getUTCMonth()});
                    data.document.set({ 'date.day' : actualLocalTime.getUTCDate()});
                    data.document.set({ 'created' : actualLocalTime});
                }

                cb(null, data.document)
            })
        })

    }

}


module.exports = googleJobs.default;