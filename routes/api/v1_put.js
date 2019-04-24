const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const fs = require('fs');
const readline = require('readline');
const RequestParser = require('../../app_modules/request-parser');

const photoSchema = require('../../schemas/schemas').photoSchema;

const PhotoRequest = new RequestParser(photoSchema, 'photo');
const Photo = mongoose.model('Photo', photoSchema);

router.put('/Add/Photos', (req, res, next) => {

    let photo = PhotoRequest.createDoc(req.body);
    photo.set({ created: new Date });

    photo.save()
        .then((result) => {
          if ( req.accepts().includes('*/*') || req.accepts().includes('text/html') ) {
            res.render('results', {docs: result, endpoint: 'photos', method: 'added'})
          } else {
            res.format({
              json: () => {
                res.send(result);
              }
            })
          }
        })
        .catch((error) => {
            res.render('error', { message: error })
        })

});

router.put('/Create/Photos', (req, res, next) => {

    let photosArray = req.body.photos;

    Photo.create(photosArray)
        .then((result) => {
          if ( req.accepts().includes('*/*') || req.accepts().includes('text/html') ) {
            res.render('results', {docs: result, endpoint: 'photos', method: 'added'})
          } else {
            res.format({
              json: () => {
                res.send(result);
              }
            })
          }
        })
        .catch((error) => {
            res.render('error', { message: error })
        })
})

module.exports = router;
