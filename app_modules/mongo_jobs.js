const mongoose = require('mongoose');
const util = require('util');
const photoSchema = require('../schemas/schemas').photoSchema;
const videoSchema = require('../schemas/schemas').videoSchema;
const Photo = mongoose.model('photo', photoSchema);
const Video = mongoose.model('video', videoSchema);

const createDocuments = function ( documentsArray, cbToJobHandler ) {

  let photos = [], videos = [];
  documentsArray.forEach(doc => {
    doc instanceof Video ?
      videos.push(doc) :
      photos.push(doc);
  })

  Photo.create(photos)
    .then(savedImgs => {
      Video.create(videos)
        .then(savedVids => {
          cbToJobHandler(null, savedVids.concat(savedImgs));
        })
        .catch(error => {
          cbToJobHandler(error);
        })
    })
    .catch(error => {
      cbToJobHandler(error);
    })

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
  createDocuments: createDocuments,
  photoExistsInDB: photoExistsInDB
}

module.exports = mongoJobs;
