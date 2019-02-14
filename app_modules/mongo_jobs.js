const mongoose = require('mongoose');
const photoSchema = require('../schemas/schemas').photoSchema;
const Photo = mongoose.model('Photo', photoSchema);

const createPhotos = function ( photosArray ) {

    return Photo.create( photosArray );

}

module.exports = createPhotos;