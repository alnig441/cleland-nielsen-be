const fs = require('fs');
const util = require('util');
const readline = require('readline');
const mongoose = require('mongoose');
const append = util.promisify(fs.appendFile);

const photoSchema = require('../schemas/schemas').photoSchema;

const Photo = mongoose.model('Photo', photoSchema);

const batchLoad = {

    default: function (pathToFile) {

        const rl = readline.createInterface({
            input: fs.createReadStream(pathToFile),
            crlfDelay: Infinity
        });


        rl.on('line', (line) => {

            let photo = new Photo();

            let matches = line.match(/{+.[^\t]+}/ig);

            if (matches) {
                matches.forEach((elem, ind, arr) => {
                    elem = elem.replace('{','');
                    elem = elem.replace('}','');

                    let venue = elem.match(/".+"/ig);
                    let array = elem.split(',');

                    if (venue) {
                        photo.set({
                            'meta.venue': venue.toString().replace(/"/g, ''),
                            'meta.keywords': array.filter((keyword) => {
                                return keyword != venue;
                            })
                        })
                    } else {
                        photo.set({
                            'meta.names': array
                        })
                    }
                })
            }

            line = line.replace(/\\N/g, '');
            line = line.replace(/N\/a/g, '');

            let array = line.split('\t');

            photo.set({
                created: array[1],
                'date.day': array[5],
                'date.month': array[4],
                'date.year': array[3],
                'location.country': array[7],
                'location.state': array[8],
                'location.city': array[9],
                'meta.occasion': array[6],
                'meta.event.da': array[12],
                'meta.event.en': array[13],
                'image.fileName': array[11]
            })

            photo.save()
                .catch((err) => {
                    append(`.migration-log-${process.env.NODE_ENV}`, `${err.message}\n`, 'utf8')
                        .catch((err) => {
                            console.log(err);
                        })

                })

        }).on('close', () => {
            console.log('done!')
        })

    }

}

module.exports = batchLoad.default;
