const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const paginate = require('mongoose-paginate');
const parser = require('../../app_modules/parser');

const userSchema = require('../../schemas/schemas').userSchema;
const photoSchema = require('../../schemas/schemas').photoSchema;
photoSchema.plugin(paginate);

const Photo = mongoose.model('Photo', photoSchema);
const User = mongoose.model('User', userSchema);

router.get('/SearchById/:_id?/Photos', (req, res, next) => {

    let query = req.params._id ? req.params : req.query;

    Photo.paginate(query)
        .then((result) => {
          if ( req.accepts().includes('*/*') || req.accepts().includes('text/html') ) {
            res.render('results', {docs: result, endpoint: 'photos'})
          } else {
            res.format({
              json: () => {
                res.send(result);
              }
            })
          }
        })
        .catch((error) => {
            res.render('error', { message: error})
        })

})

router.get('/Search/Photos?', (req, res, next) => {

    let options = { page: parseInt(req.query.page) || undefined , limit: parseInt(process.env.LIMIT), sort: { created: 1 } };
    let query = req.query.doAnd ? { $and: parser.parse(req.query)}  : { $or: parser.parse(req.query) };

    Photo.paginate( query , options )
        .then((result) => {
          if ( req.accepts().includes('*/*') || req.accepts().includes('text/html') ) {
            res.render('results', { docs: result, endpoint: 'photos'});
          } else {
            res.format({
              json: () => {
                res.send( result );
              }
            })
          }
        })
        .catch((error) => {
            res.render('results', { result: error })
        })

})

router.get('/Distinct/:year?/Photos', (req, res, next) => {

  let query = req.params.year ? { 'date.year' : parseInt(req.params.year) } : req.query.year ? { 'date.year': req.query.year }: {} ;
  let key = query.hasOwnProperty('date.year') ? 'date.month' : 'date.year';

  Photo.distinct(key, query)
    .then((result) => {
      result = result.filter( elem => {
        return elem != null;
      })
      result = key == 'date.month' ? sortArray(result) : result.sort();
      res.status(200).send(result);
    })
    .catch((error) => {
      res.render('error', { result: error });
    })

})

function sortArray (array) {
  let arr1 = array.filter(elem => {
    return elem < 10;
  })
  let arr2 = array.filter(elem => {
    return elem >= 10;
  })
  return arr1.sort().concat(arr2.sort());
}

module.exports = router;
