const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const photoSchema = require('../../schemas/photoSchema');
const videoSchema = require('../../schemas/videoSchema');

const Photo = mongoose.model('Photo', photoSchema);
const Video = mongoose.model('Video', videoSchema);

let returnArray = [];

router.route('/Terms/Photos')
  .get((req, res, next) => {
    Photo.distinct('meta.names')
      .then( names => {
        names = names.filter( name => {
          return name != null;        
        })
        names.forEach( name => {
          returnArray.push({ title: name, queryTerm: 'meta.names'});
        })
        next();
      })
  })
  .get((req, res, next) => {
    Photo.distinct('meta.venue')
      .then( venues => {
        venues = venues.filter( venue => {
          return venue != null;        
        })
        venues.forEach( venue => {
          returnArray.push({ title: venue, queryTerm: 'meta.venue'});
        })
        next();
      })
  })
  .get((req, res, next) => {
    Photo.distinct('meta.occasion')
      .then( occasions => {
        occasions = occasions.filter( occasion => {
          return occasions != null;        
        })
        occasions.forEach( occasion => {
          returnArray.push({ title: occasion, queryTerm: 'meta.occasion'});
        })
        next();
      })  
    })
  .get((req, res, next) => {
    Photo.distinct('meta.keywords')
      .then( keywords => {
        keywords = keywords.filter( keyword => {
          return keyword != null;        
        })
        keywords.forEach( keyword => {
          returnArray.push({ title: keyword, queryTerm: 'meta.keywords'});
        })
        next();
      })  
    })
  .get((req, res, next) => {
    Photo.distinct('location.city')
      .then( cities => {
        cities = cities.filter( city => {
          return city != null;        
        })
        cities.forEach( city => {
          returnArray.push({ title: city, queryTerm: 'location.city'});
        })
        next();
      })
  })
  .get((req, res, next) => {
    Photo.distinct('location.state')
      .then( states => {
        states = states.filter( state => {
          return state != null;        
        })
        states.forEach( state => {
          returnArray.push({ title: state, queryTerm: 'location.state'});
        })
        next();
      })
  })
  .get((req, res, next) => {
    Photo.distinct('location.country')
      .then( countries => {
        countries = countries.filter( country => {
          return country != null;        
        })
        countries.forEach( country => {
          returnArray.push({ title: country, queryTerm: 'location.country'});
        })
        next();
      })
  })
  .get((req, res, next) => {
    res.status(200).send(returnArray);
    returnArray = [];
  })

module.exports = router;