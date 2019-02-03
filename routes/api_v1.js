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

router.get('/SearchById/:_id?/Photos', (req, res, next) => {

    let query = { _id: req.params };

    Photo.paginate(query)
        .then((image) => {
            console.log(image);
            res.render('results', {docs: image.docs, endpoint: 'photos'})
        })
        .catch((error) => {
            res.render('error', { message: error})
        })

})

router.get('/Search/Photos?', userAuth, (req, res, next) => {

    let options = { page: parseInt(req.query.page) , limit: parseInt(process.env.LIMIT) }

    Photo.paginate({} , options)
        .then((result) => {
            console.log(result.docs[0]);
            res.render('results', {docs: result, endpoint: 'photos'})
        })
        .catch((error) => {
            res.render('results', {result: error})
        })

});

router.post('/UpdateById/:_id?/Photos',(req, res, next) => {

    /* FIX QUERY BUILDER TO CONFORM TO {'field':'value'} OR {'object.field': 'value'} SYNTAX */

    let incoming = req.body ? req.body : req.query;

    let query = parseQuery(incoming);
    console.log(query, incoming);

    Photo.findOneAndUpdate({_id: req.params._id}, query)
        .then((photo) => {
            console.log(photo);
            res.render('results', { docs: photo, endpoint: 'photos'});
        })
        .catch((error) => {
            res.render('error', { message: error });
        })

})

router.post('/Load/Photos', (req, res, next) => {

    let request = buildDocument(req.body);

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


function parseQuery(request) {
    let query;

    Object.keys(request).forEach((key) => {
        if (key != 'page') {
            switch (key) {
                case 'city':
                    return  query = { "location.city" : request[key] };
                case 'state':
                    return  query = { "location.state" : request[key] };
                case 'country':
                    return  query = { "location.country" : request[key] };
                case 'day':
                    return  query = { "date.day" : parseInt(request[key]) };
                case 'month':
                    return  query = { "date.month" : parseInt(request[key])};
                case 'year':
                    return  query = { "date.year" : parseInt(request[key]) };
                case 'names':
                    return  query = { "meta.names" : request[key] };
                case 'venue':
                    return  query = { "meta.venue" : request[key] };
                case 'occasion':
                    return  query = { "meta.occasion" : request[key] };
                case 'fileName':
                    return  query = { "image.fileName" : request[key] };
                case 'thumbnail':
                    return  query = { "image.thumbnail" : request[key] };
                default:
                    return null;
            }
        }
    })

    return query;
}

function buildDocument(req) {

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
                case 'country':
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
