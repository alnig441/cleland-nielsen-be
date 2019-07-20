const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const RequestParser = require('../../app_modules/request-parser');

const videoSchema = require('../../schemas/videoSchema');

const Video = mongoose.model('Video', videoSchema);
const VideoRequest = new RequestParser(videoSchema, 'Video');

router.get('/SearchById/:_id?/Videos', (req, res, next) => {

  let query = req.params._id ?
    req.params:
    req.query;

    Video.paginate(query)
      .then(result => {
        if (req.accepts().includes('*/*') || req.accepts().includes('text/html')) {
          res.render('results', {docs: result, endpoint: 'videos'})
        } else {
          res.format({
            json: () => {
              res.send(result);
            }
          })
        }
      })
      .catch(error => {
        res.render('error', {message: error});
      })

})

router.get('/Search/Videos?', (req, res, next) => {

   let options = {page : parseInt(req.query.page) || undefined, limit : 20, sort : {created : 1}};
   let query = req.query.doAnd ?
    {$and : VideoRequest.parse(req.query)}:
    {$or  : VideoRequest.parse(req.query)};

  Video.paginate(query, options)
    .then(result => {
      if (req.accepts().includes('*/*') || req.accepts().includes('text/html')) {
        console.log('result: ', res);
        res.render('results', {docs : result, endpoint  : 'videos'});
      } else {
        res.format({
          json  : () => {
            res.send(result);
          }
        })
      }
    })
    .catch(error => {
      res.render('error', {result: error});
    })
})

router.get('/Distinct/:year?/Videos', (req, res, next) => {

  let query = req.params.year ?
    {'date.year':parseInt(req.params.year)}:
    req.query.year ?
      {'date.year':req.query.year}:
      {};

  let key = query.hasOwnProperty('date.year') ?
    'date.month':
    'date.year';

  Video.distinct(key, query)
    .then(result => {
      result.filter(elem => {
        return elem != null;
      })
      result = key == 'date.month' ?
        sortArray(result):
        result.sort();
      res.status(200).send(result);
    })
    .catch(error => {
      res.render('error', {result: error})
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
