const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const parser = require('../../app_modules/parser');

const userSchema = require('../../schemas/schemas').userSchema;
const photoSchema = require('../../schemas/schemas').photoSchema;

const Photo = mongoose.model('Photo', photoSchema);
const User = mongoose.model('User', userSchema);

router.post('/UpdateById/:_id?/Photos',(req, res, next) => {

    let incoming = req.body ? req.body : req.query;

    let goTo = stepThrough(incoming);

    parseIncoming();

    function parseIncoming() {
        let result = goTo.next();
        console.log(result);
        updatePhoto(result);
    }

    function updatePhoto ( field ) {
        Photo.findOneAndUpdate({_id: req.params._id}, field.value)
            .then(( photo ) => {
                if ( !field.done ) {
                    parseIncoming();
                } else {
                    res.render('results', { docs: photo, endpoint: 'photos', method: 'updated'});
                }
            })
            .catch(( error ) => {
                res.render('error', { message: error });
            })
    }

    function* stepThrough ( object_in ) {
        let i = 0;
        let keys = Object.keys( object_in );

        while(i <= keys.length -1) {
            i++;
            let object_out = {};
            object_out[keys[i - 1]] = object_in[keys[i - 1]];
            yield parser.parseUpdateQuery(object_out);
        }

        return;
    }
})


module.exports = router;