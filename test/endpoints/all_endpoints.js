const mongoose = require('mongoose');
const paginate = require('mongoose-paginate');
const should = require('chai').should();
const prepare = require('../prepare');
const photoSchema = require('../../schemas/schemas').photoSchema;
photoSchema.plugin(paginate);

mongoose.connect('mongodb://localhost/photos-db-test', { useNewUrlParser: true });
mongoose.set('useCreateIndex', true);

const Photo = mongoose.model('Photo', photoSchema);


describe('Photo: models', function () {
    let date;
    let _id;

    describe('#create()', function ()  {
        it('should create a new Photo', function ( done ) {
            date = new Date();
            let photoModel = {
                created: date,
                'date.day': date.getUTCDate(),
                'date.month': date.getUTCMonth(),
                'date.year': date.getUTCFullYear(),
                'location.city': 'Mountain Lakes',
                'location.state': 'US - New Jersey',
                'location.country': 'USA',
                'meta.event.da': 'test',
                'meta.event.en': 'test',
                'meta.venue': 'test',
                'meta.names': ['James'],
                'meta.occasion': 'test',
                'meta.keywords': ['test'],
                'image.fileName': 'test.jpg'
            };

            Photo.create( photoModel, function ( err, createdModel ) {
                _id = createdModel._id;

                should.not.exist( err );

                createdModel.created.should.be.an.instanceOf(Date);
                createdModel.created.should.equal(date);
                createdModel.image.should.have.all.keys(['fileName','thumbnail']);
                createdModel.image.fileName.should.be.a('string');
                createdModel.image.fileName.should.equal('test.jpg');
                createdModel.meta.should.have.all.keys(['occasion','event','names','venue','keywords']);
                createdModel.meta.occasion.should.be.a('string');
                createdModel.meta.occasion.should.equal('test');
                createdModel.meta.names.should.be.an.instanceOf(Array);
                createdModel.meta.names[0].should.be.a('string');
                createdModel.meta.names[0].should.equal('James');
                createdModel.meta.venue.should.be.a('string');
                createdModel.meta.venue.should.equal('test');
                createdModel.meta.keywords.should.be.an.instanceOf(Array);
                createdModel.meta.keywords[0].should.equal('test');
                createdModel.meta.event.should.have.all.keys(['en','da']);
                createdModel.meta.event.da.should.be.a('string');
                createdModel.meta.event.da.should.equal('test');
                createdModel.meta.event.en.should.be.a('string');
                createdModel.meta.event.en.should.equal('test');
                createdModel.location.should.have.all.keys(['country','state','city']);
                createdModel.location.country.should.be.a('string');
                createdModel.location.country.should.equal('USA');
                createdModel.location.state.should.be.a('string');
                createdModel.location.state.should.equal('US - New Jersey');
                createdModel.location.city.should.be.a('string');
                createdModel.location.city.should.equal('Mountain Lakes');
                createdModel.date.should.have.all.keys(['year','month','day']);
                createdModel.date.year.should.be.a('number');
                createdModel.date.year.should.equal(date.getUTCFullYear());
                createdModel.date.month.should.be.a('number');
                createdModel.date.month.should.equal(date.getUTCMonth());
                createdModel.date.day.should.be.a('number');
                createdModel.date.day.should.equal(date.getUTCDate());

                done();
            })
        });
    })

    describe('#get()', function () {
        it('should get all Photos with pagination', function ( done ) {

            Photo.paginate({}, { limit: 6 }, function ( error, result ) {
                should.not.exist( error );
                result.should.have.all.keys(['docs','total','limit','offset','page','pages']);

                done();
            })

        });
    })

    describe('#get() by year+month+page', function () {
        it('should get all Photos defined by query', function ( done ) {

            let year = date.getUTCFullYear();
            let month = date.getUTCMonth();

            Photo.paginate({ $and : [{'date.year' : year},{"date.month": month}] }, { limit: 6 , page: 1 }, function ( error, result ) {
                should.not.exist( error );
                result.should.have.all.keys(['docs','total','limit','page','pages']);
                result.docs[0].date.year.should.equal(year);
                result.docs[0].date.month.should.equal(month);
                result.page.should.equal(1);
                result.limit.should.equal(6);

                done();
            })
        });
    })

    describe('#get() by id', function () {
        it('should get a single Photo by id', function ( done ) {

            Photo.find({ _id: _id}, function ( error, photo ) {
                should.not.exist( error );
                photo[0]._id.should.deep.equal(_id);

                done();
            })
        });
    })

    describe('#update() by id', function () {
        it('should update a single Photo by id', function ( done ) {

            Photo.findOneAndUpdate({ _id: _id }, { $set : { "meta.venue" : "somewhere nice" }}, function (error, result) {
                should.not.exist( error );
                should.exist( result ) ;

                done();
            })
        });
    })

    describe('#delete() by id', function () {
        it('should delete a single Photo by id', function ( done ) {

            Photo.findByIdAndRemove({_id: _id}, function ( error, result ) {
                should.not.exist( error );
                should.exist( result );

                done();
            })
        });
    })
})
