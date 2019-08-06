const should = require('chai').should();
const parser = require('../../app_modules/parser');

describe('App_modules parser', function () {

    describe('#parseSearchQuery() without operator', function () {

        it('should return an Object with the key "$or" and a value of type Array', function ( done ) {

            let result = parser.parseSearchQuery({ city: 'Vandel', day: 12, venue : 'none' , en: 'test', names: 'superman'}, false)

            result.should.be.an.instanceOf(Object);
            result.should.have.keys(['$or']);
            result['$or'].should.be.an.instanceOf(Array);

            done();

        });
    })

    describe('#parseSearchQuery() with operator', function () {

        it('should return an Object with the key "$and" and a value of type Array', function ( done ) {

            let result = parser.parseSearchQuery({ city: 'Vandel', day: 12, venue : 'none' , en: 'test', names: 'superman'}, true);

            result.should.be.an.instanceOf(Object);
            result.should.have.keys(['$and']);
            result['$and'].should.be.an.instanceOf(Array);

            done();
        });
    })
})
