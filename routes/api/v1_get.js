const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const paginate = require('mongoose-paginate');
const parser = require('./parser');

const userSchema = require('../../schemas/schemas').userSchema;
const photoSchema = require('../../schemas/schemas').photoSchema;
photoSchema.plugin(paginate);

const Photo = mongoose.model('Photo', photoSchema);
const User = mongoose.model('User', userSchema);

router.get('/SearchById/:_id?/Photos', (req, res, next) => {

    Photo.paginate(req.params)
        .then((image) => {
            res.render('results', {docs: image.docs, endpoint: 'photos'})
        })
        .catch((error) => {
            res.render('error', { message: error})
        })

})

router.get('/Search/Photos?', (req, res, next) => {

    let options = { page: parseInt(req.query.page) , limit: parseInt(process.env.LIMIT) }

    let query = parser.parseQuery(req.query);

    Photo.paginate( query , options)
        .then((result) => {
            res.render('results', {docs: result, endpoint: 'photos'})
        })
        .catch((error) => {
            res.render('results', {result: error})
        })

});


module.exports = router;
