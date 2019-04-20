const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const parser = require('../../app_modules/parser');
const ObjectId = require('mongodb').ObjectId;

const userSchema = require('../../schemas/schemas').userSchema;
const photoSchema = require('../../schemas/schemas').photoSchema;

const Photo = mongoose.model('Photo', photoSchema);
const User = mongoose.model('User', userSchema);

router.post('/UpdateById/:_id?/Photos',(req, res, next) => {

    let incoming = req.body ? req.body : req.query;

    query = parser.parse(incoming);

    console.log('query single: ', query)

    Photo.updateOne({ _id: req.params._id }, query)
      .then(result => {
        if (req.accepts().includes('*/*') || req.accepts().includes('text/html')) {
          res.render('results', { docs: result, endpoint: 'photos' })
        } else {
          res.format({
            json: () => {
              res.send(result);
            }
          })
        }
      })
      .catch(error => {
        res.render('error: ', { message: error })
      })

    // let goTo = stepThrough(incoming);
    //
    // parseIncoming();
    //
    // function parseIncoming() {
    //     let result = goTo.next();
    //     updatePhoto(result);
    // }
    //
    // function updatePhoto ( field ) {
    //     Photo.findOneAndUpdate({_id: req.params._id}, field.value)
    //         .then(( photo ) => {
    //             if ( !field.done ) {
    //                 parseIncoming();
    //             } else {
    //               if ( req.accepts().includes('*/*') || req.accepts().includes('text/html') ) {
    //                 res.render('results', {docs: photo, endpoint: 'photos'})
    //               } else {
    //                 res.format({
    //                   json: () => {
    //                     res.send(photo);
    //                   }
    //                 })
    //               }
    //             }
    //         })
    //         .catch(( error ) => {
    //             res.render('error', { message: error });
    //         })
    // }
    //
    // function* stepThrough ( object_in ) {
    //     let i = 0;
    //     let keys = Object.keys( object_in );
    //
    //     while(i <= keys.length -1) {
    //         i++;
    //         let object_out = {};
    //         object_out[keys[i - 1]] = object_in[keys[i - 1]];
    //         yield parser.parseUpdateQuery(object_out);
    //     }
    //
    //     return;
    // }
})

router.post('/Update/Photos?', (req, res, next) => {

  let incoming = req.body ? req.body : req.query;
  let _ids = [];

  incoming['_ids'].forEach((id, index) => {
    _ids.push({_id: new ObjectId(id)});
  })

  let query = parser.parse(incoming['form']);

  Photo.updateMany({ $or: _ids }, query)
    .then(result => {
      res.format({
        json: () => {
          res.send(result);
        }
      })
    })
    .catch( error => {
      res.render('error', { message: error });
    })
})


module.exports = router;
