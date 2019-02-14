const fs = require('fs');
const util = require('util');
const readdir = util.promisify(fs.readdir);
const access = util.promisify(fs.access);
const rename = util.promisify(fs.rename);
const baseUrl = process.env.NODE_ENV == 'development' ? '/Volumes/WD-USB-DISK' : process.env.PHOTOS_MOUNT_POINT;

const fileJobs = {

    detectPhotos: function(cb) {

        let goTo;

        getFiles()
            .then((files) => {
                goTo = next(files);
                stepThrough();
            })
            .catch((err) => {
                console.log(err);
            })

        function stepThrough() {
            let list = goTo.next();
            let done = list.done;

            if (!done) {
                findFile(list.value, stepThrough);
            } else {
                getFiles()
                    .then((result) => {
                        cb(null, result);
                })
                    .catch((error) => {
                        cb(error);
                    })
            }

        }

        function* next(files) {
            let i = 0;
            while(i < files.length) {
                i++;
                yield files[i-1];
            }
        }

    },

    convertAndMovePhotos: function ( file, cb ) {

        console.log('converting: ', file);

        cb(null);

    }


}



function findFile(file, next) {

    let path = `${baseUrl}/James/${file}`;

    access(path, fs.constants.W_OK)
        .then(( data ) => {
            if (!data) {
                console.log(`file ${file} exists - renaming`);
                renameFile(file, next);
            }
        })
        .catch((err) => {
            if (err.code == 'ENOENT') {
                console.log(`file ${file} does not exist - please continue`);
                next();
            }
        })
}

function renameFile(file, next) {

    let from = `${baseUrl}/photoapptemp/${file}`;
    let to = `${baseUrl}/photoapptemp/${Date.parse(new Date())}_${file}`;

    rename(from, to)
        .then((result) => {
            next();
        })
        .catch((err) => {
            console.log('error renaming ', err);
        })

}

function getFiles() {

    let path = `${baseUrl}/photoapptemp/`;
    return readdir(path);
}



module.exports = fileJobs;