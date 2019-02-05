const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const parser = require('./parser');

const userSchema = require('../../schemas/schemas').userSchema;
const photoSchema = require('../../schemas/schemas').photoSchema;

const Photo = mongoose.model('Photo', photoSchema);
const User = mongoose.model('User', userSchema);

router.put('/Add/Photos', (req, res, next) => {

    let request = parser.createDoc(req.body);

    let photo = new Photo(request);
    photo.set({ created: new Date });

    photo.save()
        .then((result) => {
            res.render('results', { docs: result, endpoint: 'photos' })
        })
        .catch((error) => {
            res.render('error', { message: error })
        })

});

router.put('/BatchLoad/Photos', (req, res, next) => {
    console.log('batch loading...');
    res.render('results', {docs: [], endpoint: 'photos'})
})

module.exports = router;