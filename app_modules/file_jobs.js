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
const tmpFolder = process.env.APP_TMP_FOLDER,
      pngFolder = process.env.APP_PNG_FOLDER,
      origFolder = process.env.APP_ORIG_FOLDER,
      videoFolder = process.env.APP_VIDEO_FOLDER;

const fileJobs = {

    detectPhotos: function( cbToJobHandler ) {

        let goTo;

        getFiles()
            .then( ( files ) => {
              if ( files.length == 0 ) {
                cbToJobHandler(null, files);
              }
              else {
                goTo = next( files );
                stepThrough();
              }
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

        let saveAs, fileName;

        if (typeof file == 'object' ) {
          saveAs = file.saveAs;
          fileName = file.fileName;
        } else {
          fileName = saveAs = file;
        }

        let pngFile = saveAs.replace( /jp?g/i, 'png');

        if (file.isPhoto) {
          jo.rotate(`${baseUrl}/${tmpFolder}/${fileName}`, options, ( error, buffer ) => {
              let wasRotated = error ? false : true;

              if ( !error ) {
                  saveFile( buffer, saveAs )
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
        else {
          moveFile (file, null, (error) => {
            error ? cbToJobHandler(error) : cbToJobHandler(null, `${file} moved`);
          })
        }

    }

}

function saveFile ( buffer, file ) {
    return jimp.read( buffer )
        .then(image => {
            image.writeAsync(`${baseUrl}/${origFolder}/${file}`)
        })
}

function convertFile ( buffer, pngFile ) {
    return jimp.read(buffer)
        .then(image => {
            image.resize(280, jimp.AUTO);
            image.writeAsync(`${baseUrl}/${pngFolder}/${pngFile}`)
        })
}

function moveFile ( file, wasRotated, callback ) {

    wasRotated ? writeToLog(`\nINFO:\t${file} was rotated`) : null;

    let sourceName, destinationName, execStr;

    if ( typeof file == 'object') {
      sourceName = file.fileName.split(' ').join('\\ ');
      destinationName = file.saveAs.split(' ').join('\\ ');
    } else {
      sourceName = destinationName = file.split(' ').join('\\ ');
    }

    if (file.isPhoto){
      execStr =
          wasRotated ?
              `mv ${baseUrl}/${tmpFolder}/${sourceName} ${baseUrl}/${origFolder}/${destinationName.replace(/jp?g/i, ( match ) => { return 'original.' + match } )}`:
              `mv ${baseUrl}/${tmpFolder}/${sourceName} ${baseUrl}/${origFolder}/${destinationName}`;
    } else {
      execStr = `mv ${baseUrl}/${tmpFolder}/${sourceName} ${baseUrl}/${videoFolder}/${destinationName}`;
    }

    exec(execStr, ( err, stdout, stdin ) => {
        if( !err ){
            callback( null, true );
        } else {
            callback( err );
        }
    })

}

function findFile ( file, cbToStepThrough ) {

    let path = `${baseUrl}/${origFolder}/${file}`;

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

    let from = `${baseUrl}/${tmpFolder}/${file}`;
    let to = `${baseUrl}/${tmpFolder}/${Date.parse(new Date())}_${file}`;

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

    let path = `${baseUrl}/${tmpFolder}/`;
    return readdir(path);
}

function writeToLog ( message ) {

    append( `.schedule-log-${process.env.NODE_ENV}`, message )
        .then( () => {
            return null;
        } )

}

module.exports = fileJobs;
