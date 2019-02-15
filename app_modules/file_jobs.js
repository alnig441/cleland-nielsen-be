const fs = require('fs');
const util = require('util');
const jimp = require('jimp');
const jo = require('jpeg-autorotate');
const { exec } = require('child_process');
const options = { quality: 100 };

const readdir = util.promisify(fs.readdir);
const access = util.promisify(fs.access);
const rename = util.promisify(fs.rename);
const append = util.promisify(fs.appendFile);

const baseUrl = process.env.NODE_ENV == 'development' ? '/Volumes/WD-USB-DISK' : process.env.PHOTOS_MOUNT_POINT;

const fileJobs = {

    detectPhotos: function( cbToJobHandler ) {

        let goTo;

        getFiles()
            .then( ( files ) => {
                goTo = next( files );
                stepThrough();
            })
            .catch(( error ) => {
                cbToJobHandler(error);
            })

        function stepThrough() {
            let list = goTo.next();
            let done = list.done;

            if ( !done ) {
                findFile( list.value, stepThrough );
            } else {
                getFiles()
                    .then( ( result ) => {
                        cbToJobHandler( null, result );
                })
                    .catch(( error ) => {
                        cbToJobHandler( error );
                    })
            }

        }

        function* next( files ) {
            let i = 0;
            while(i < files.length) {
                i++;
                yield files[i-1];
            }
        }

    },

    convertAndMovePhotos: function ( file, cbToJobHandler ) {

        let pngFile = file.replace( /jp?g/i, 'png' );

        jo.rotate(`${baseUrl}/photoapptemp/${file}`, options, ( error, buffer ) => {
            let wasRotated = error ? false : true;

            if ( !error ) {
                saveFile( buffer, file )
                    .then( () => {
                        return null;
                    })
                    .catch(( error ) => {
                        cbToJobHandler( error );
                    })
            }

            convertFile( buffer , pngFile)
                .then(
                    moveFile(file, wasRotated, ( error ) => {
                        error ? cbToJobHandler( error ) : cbToJobHandler( null,`${file} converted and moved` );
                    })
                )
                .catch(( error ) => {
                    cbToJobHandler( error );
                })
        })


    }

}

function saveFile ( buffer, file ) {
    return jimp.read( buffer )
        .then(image => {
            image.writeAsync(`${baseUrl}/James/${file}`)
        })
}

function convertFile ( buffer, pngFile ) {
    return jimp.read(buffer)
        .then(image => {
            image.resize(280, jimp.AUTO);
            image.writeAsync(`${baseUrl}/photoapp/${pngFile}`)
        })
}

function moveFile ( file, wasRotated, callback ) {

    wasRotated ? writeToLog(`\nINFO:\t${file} was rotated`) : null;

    let split = file.split(' ');
    let joined = split.join('\\ ');

    let execStr =
        wasRotated ?
            `mv ${baseUrl}/photoapptemp/${joined} ${baseUrl}/James/${joined.replace(/jp?g/i, ( match ) => { return 'original.' + match } )}`:
            `mv ${baseUrl}/photoapptemp/${joined} ${baseUrl}/James`;

    exec(execStr, ( err, stdout, stdin ) => {
        if( !err ){
            callback( null, true );
        } else {
            callback( err );
        }
    })

}

function findFile ( file, cbToStepThrough ) {

    let path = `${baseUrl}/James/${file}`;

    access( path, fs.constants.W_OK )
        .then(( data ) => {
            if (!data) {
                renameFile(file, cbToStepThrough);
            }
        })
        .catch((err) => {
            if (err.code == 'ENOENT') {
                cbToStepThrough();
            }
        })
}

function renameFile ( file, cbToStepThrough ) {

    let from = `${baseUrl}/photoapptemp/${file}`;
    let to = `${baseUrl}/photoapptemp/${Date.parse(new Date())}_${file}`;

    rename(from, to)
        .then((result) => {
            writeToLog(`\nINFO:\t${file} was renamed!`);
            cbToStepThrough();
        })
        .catch((err) => {
            writeToLog(`\nERROR:\t${err}`)
        })

}

function getFiles () {

    let path = `${baseUrl}/photoapptemp/`;
    return readdir(path);
}

function writeToLog ( message ) {

    append( '.schedule-log', message )
        .then( () => {
            return null;
        } )

}

module.exports = fileJobs;