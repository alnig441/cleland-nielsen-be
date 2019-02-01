const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const paginate = require('mongoose-paginate');
const userAuth = require('./authenticate');

const userSchema = require('../api/schemas').userSchema;
const photoSchema = require('../api/schemas').photoSchema;
photoSchema.plugin(paginate);

const Photo = mongoose.model('Photo', photoSchema);
const User = mongoose.model('User', userSchema);

var test_photo = {
    image: {
        fileName: 'test.jpg'
    }
};

router.get('/SearchById/:_id?/Photos', (req, res, next) => {

    let query = buildQuery(req.params);

    Photo.paginate(query)
        .then((image) => {
            res.render('results', {docs: image.docs, endpoint: 'photos'})
        })
        .catch((error) => {
            res.render('error', { message: error})
        })

})



router.get('/Search/Photos?', userAuth, (req, res, next) => {

    let query = buildQuery(req.query);

    let options = { page: parseInt(req.query.page) , limit: parseInt(process.env.LIMIT) }

    Photo.paginate(query , options)
        .then((result) => {
            res.render('results', {docs: result, endpoint: 'photos'})
        })
        .catch((error) => {
            res.render('results', {result: error})
        })

});

router.post('/Update/:_id?/Photos',(req, res, next) => {

    let query = buildQuery(req.body);

    Photo.update({_id: req.params._id}, query)
        .then((photo) => {
            res.render('results', { docs: JSON.stringify(photo)});
        })
        .catch((error) => {
            res.render('error', { message: error });
        })

})

router.post('/Load/Photos', (req, res, next) => {

    let photo = new Photo(test_photo);
    photo.set({ created: new Date });

    photo.save()
        .then((result) => {
            res.render('results', { docs: JSON.stringify(result) })
        })
        .catch((error) => {
            res.render('error', { message: error })
        })

});



router.delete('/Remove/:_id?/Photos', (req, res, next) => {

    Photo.remove({ _id: req.params})
        .then((result) => {
            res.render('results', { docs: result});
        })
        .catch((error) => {
            console.log(error.message);
            res.render('error', { message: error.message})
        })

});




function buildQuery(req) {

    let query = {};

    Object.keys(req).forEach((element) => {

        if (element != 'page') {

            switch(element) {
                case 'day':
                    !query.date ? query.date = { [element]: parseInt(req[element]) } : query.date[element] = parseInt(req[element]);
                    break;
                case 'month':
                    !query.date ? query.date = { [element]:parseInt(req[element]) } : query.date[element] = parseInt(req[element]);
                    break;
                case 'year':
                    !query.date ? query.date = { [element]: parseInt(req[element]) } : query.date[element] = parseInt(req[element]);
                    break;
                case 'city':
                    !query.location ? query.location = { [element]: req[element] } : query.date[element] = req[element];
                    break;
                case 'state':
                    !query.location ? query.location = { [element]: req[element] } : query.date[element] = req[element];
                    break;
                case 'county':
                    !query.location ? query.location = { [element]: req[element] } : query.date[element] = req[element];
                    break;
                case 'venue':
                    !query.meta ? query.meta = { [element]: req[element] } : query.date[element] = req[element];
                    break;
                case 'occasion':
                    !query.meta ? query.meta = { [element]: req[element] } : query.date[element] = req[element];
                    break;
                case 'names':
                    !query.meta ? query.meta = { [element]: req[element] } : query.date[element] = req[element];
                    break;
                case 'fileName':
                    !query.image ? query.image = { [element]: req[element] } : query.date[element] = req[element];
                    break;
                default:
                    query[element] = req[element];
                    break;
            }
        }
    })

    return query;

}

module.exports = router;
