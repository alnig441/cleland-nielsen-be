const https = require('https');
const key = process.env.API_KEY;
const geocodeApi = 'https://maps.googleapis.com/maps/api/geocode/json?';
const timeZoneApi = 'https://maps.googleapis.com/maps/api/timezone/json?';

const googleJobs = {

    getApiData: function ( data, cbToJobHandler ) {

        let timestamp = Date.parse( data.document.created );

        let URIs = [
            { geocode   : `${geocodeApi}latlng=${data.gps.latitude},${data.gps.longitude}&key=${key}` },
            { offset    : `${timeZoneApi}location=${data.gps.latitude},${data.gps.longitude}&timestamp=${timestamp.toString().slice(0,10)}&key=${key}` }
        ]

        data.gps ? doGetApiData() : cbToJobHandler( null, data.document ) ;

        function doGetApiData ( err, res ) {
            let api =
                URIs.length > 0 ?
                    Object.values(URIs.shift())[0] :
                    null;

            if ( err ) {
                cbToJobHandler( err );
            }
            if ( !res && api ) {
                consumeApi( api, data.document, doGetApiData );
            }
            if ( res && api ) {
                consumeApi( api, res, doGetApiData );
            }
            if ( !api ) {
                cbToJobHandler( null, res );
            }

        }

    }

}

function consumeApi ( uri, document, cbToDoGetApi ) {
    let payload = '';

    https.get( uri, ( result ) => {

        result.on( 'error', ( err ) => {
            cbToDoGetApi(err);
        })

        result.on( 'data', ( data ) => {
            payload += data;
        })

        result.on( 'end', () => {
            let body = JSON.parse( payload );
            body.status == 'OK' ?
                modifyDocument( body, document, cbToDoGetApi ) :
                cbToDoGetApi( body.status );
        })
    })
}

function modifyDocument ( payload, document, cbToDoGetApi ) {

    if ( payload.timeZoneName ) {
        let timestamp = Date.parse( document.created );
        let offset = ( payload.rawOffset + payload.dstOffset ) * 1000;
        let actualLocalTime = new Date(timestamp + offset );

        document.set({ 'date.year' : actualLocalTime.getUTCFullYear()});
        document.set({ 'date.month' : actualLocalTime.getUTCMonth()});
        document.set({ 'date.day' : actualLocalTime.getUTCDate()});
        document.set({ 'created' : actualLocalTime});
    }

    if ( payload.results ) {
        payload.results[0].address_components.forEach( ( element ) => {
            element.types.find(( type ) => {
                let value = element.long_name;
                switch ( type ) {
                    case 'country':
                        document.set( {'location.country': value} );
                        break;
                    case 'administrative_area_level_1':
                        document.set({'location.state': value} );
                        break;
                    case 'locality':
                        document.set( {'location.city': value} );
                        break
                }

            })
        })

    }

    cbToDoGetApi( null, document );
}


module.exports = googleJobs.getApiData;