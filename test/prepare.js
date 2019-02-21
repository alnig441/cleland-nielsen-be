const mongoose = require('mongoose');

before ( function ( done ) {
    function clearDatabase () {
        for ( var i in mongoose.connection.collections ) {
            mongoose.connection.collections[i].deleteOne( function () {

            });
        }
        return done();
    }
    if ( mongoose.connection.readyState == 0 ) {
        mongoose.connect( config.db.test, function ( err ) {
            if ( err ) {
                throw err;
            }
            return clearDatabase();
        });
    } else {
        return clearDatabase();
    }
});

after ( function ( done ) {
    // function clearDatabase () {
    //     for ( var i in mongoose.connection.collections ) {
    //         mongoose.connection.collections[i].deleteOne( function () {
    //
    //         });
    //     }
    //     return done();
    // }
    // clearDatabase();
    mongoose.disconnect();
    return done();
})