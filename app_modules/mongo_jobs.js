const mongoose = require('mongoose');
const photoSchema = require('../schemas/schemas').photoSchema;
const Photo = mongoose.model('Photo', photoSchema);

const createPhotos = function ( photosArray ) {

    return Photo.create( photosArray );

}

const photoExistsInDB = function ( photo ) {

  let fromFile = Object.keys(photo).toString().replace(/.JPG/, '.jpg');
  let toFile = Object.values(photo).toString();

  return Photo.find({ $or : [
    {'image.fileName' : fromFile},
    {'image.fileName' : fromFile.toLowerCase()},
    {'image.fileName' : fromFile.toUpperCase()},
    {'image.fileName' : toFile.toLowerCase()},
    {'image.fileName' : toFile.toUpperCase()}
   ] } )
}

const mongoJobs = {
  createPhotos: createPhotos,
  photoExistsInDB: photoExistsInDB
}

module.exports = mongoJobs;
