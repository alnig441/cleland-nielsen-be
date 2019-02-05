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

    let options = { page: parseInt(req.query.page) , limit: parseInt(process.env.LIMIT) };
    let doAnd;

    //detect if album view year/month
    if (req.query.hasOwnProperty('year') && req.query.hasOwnProperty('month') && req.query.hasOwnProperty('page')) {
        doAnd = true;
    }

    let query = parser.parseSearchQuery(req.query, doAnd);

    Photo.paginate( query , options)
        .then((result) => {
            res.render('results', {docs: result, endpoint: 'photos'})
        })
        .catch((error) => {
            res.render('results', {result: error})
        })

})

router.get('/BuildView/Photos')


module.exports = router;
