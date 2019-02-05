const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const auth = require('basic-auth');

const userSchema = require('../schemas/schemas').userSchema;

const User = mongoose.model('User', userSchema);

router.get(/^\//i, (req, res, next) => {

    let reset_header = false;
    let credentials = auth(req);

    if (credentials === undefined || reset_header) {
        res.statusCode = 401;
        res.setHeader('WWW-Authenticate', 'Basic');
        res.end('Unauthorized');
    } else {
        User.findOne({ userId: credentials.name, password: credentials.pass })
            .then((user)=> {
                console.log(`${user.userId} authenticated succesfully`);
                return next(null, user);
            })
            .catch((error) => {
                reset_header = true;
                res.statusCode = 401;
                res.render('error', {message: `${ credentials.name } unauthorized - glem det`});
            })
    }
})


// router.post('/Load/Users', (req, res, next) => {
//
//     user = new User(test_user);
//
//     user.save()
//         .then((user) => {
//             res.render('photos', {result: JSON.stringify(user)})
//         })
//         .catch((erro) => {
//             res.render('error', {message: error})
//         })
// })

module.exports = router;