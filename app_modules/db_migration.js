const fs = require('fs');
const readline = require('readline');
const mongoose = require('mongoose');

const photoSchema = require('../schemas/schemas').photoSchema;

const Photo = mongoose.model('Photo', photoSchema);

const batchLoad = {

    default: function (pathToFile) {

        const rl = readline.createInterface({
            input: fs.createReadStream(pathToFile),
            crlfDelay: Infinity
        });

        rl.on('line', (line) => {

            let object = { names: [], venue: ''} ;

            let matches = line.match(/{\w*\W*\w*\W*\w*\W*\w*\W*\w.}/ig);

            if (matches) {
                matches.forEach((elem, ind, arr) => {
                    line = line.replace(elem, '');
                    elem = elem.replace('{','');
                    elem = elem.replace('}','');
                    ind == 0 ? object.venue = elem : elem.split(',').forEach((name) => { object.names.push(name)});
                })
            }

            let array = line.split(',');

            let photo = new Photo({
                created: array[1],
                'date.day': array[5],
                'date.month': array[4],
                'date.year': array[3],
                'location.city': array[9],
                'location.state': array[8],
                'location.country': array[7],
                'meta.names': object.names,
                'meta.venue': object.venue,
                'meta.occasion': array[6],
                'meta.event.da': array[12],
                'meta.event.en': array[13],
                'image.fileName': array[11]
            });

            photo.save()
                .then((image) => {
                    console.log('photo saved');
                })
                .catch((err) => {
                    console.log(err);
                })

        })

    }

}

module.exports = batchLoad.default;