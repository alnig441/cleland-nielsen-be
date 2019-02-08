const fs = require('fs');
const util = require('util');
const readdir = util.promisify(fs.readdir);
const access = util.promisify(fs.access);
const rename = util.promisify(fs.rename);

const validator = {

    default: function() {

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


}



function findFile(file, next) {

    let path = `${process.env.PHOTOS_MOUNT_POINT}/James/${file}`;

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

    let from = `${process.env.PHOTOS_MOUNT_POINT}/photoapp_temp/${file}`;
    let to = `${process.env.PHOTOS_MOUNT_POINT}/photoapp_temp/${Date.parse(new Date())}_${file}`;

    rename(from, to)
        .then((result) => {
            next();
        })
        .catch((err) => {
            console.log('error renaming ', err);
        })

}

function getFiles() {

    let path = `${process.env.PHOTOS_MOUNT_POINT}/photoapp_temp/`;
    return readdir(path);
}



module.exports = validator.default;