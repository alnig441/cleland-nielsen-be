const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const parser = require('../../app_modules/parser');

const userSchema = require('../../schemas/schemas').userSchema;
const photoSchema = require('../../schemas/schemas').photoSchema;

const Photo = mongoose.model('Photo', photoSchema);
const User = mongoose.model('User', userSchema);

router.delete('/RemoveById/:_id?/Photos', (req, res, next) => {

    console.log(req.params);

    Photo.findByIdAndRemove( req.params )
        .then((result) => {
            res.render('results', { docs: result, endpoint: 'photos', method: 'removed'});
        })
        .catch((error) => {
            res.render('error', { message: error.message})
        })

});

module.exports = router;