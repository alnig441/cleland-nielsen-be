const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const parser = require('../../app_modules/parser');
const fs = require('fs');
const readline = require('readline');

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
            console.log(result);
            res.render('results', { docs: result, endpoint: 'photos' })
        })
        .catch((error) => {
            res.render('error', { message: error })
        })

});

module.exports = router;