const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const userSchema = require('../../schemas/userSchema');
const photoSchema = require('../../schemas/photoSchema');

const Photo = mongoose.model('Photo', photoSchema);

router.delete('/RemoveById/:_id?/Photos', (req, res, next) => {

    let query = req.params._id ? req.params : req.query;

    Photo.findByIdAndRemove( query )
        .then((result) => {
          if ( !req.accepts().includes("application/json") ) {
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
            res.render('error', { message: error.message})
        })

});

module.exports = router;
