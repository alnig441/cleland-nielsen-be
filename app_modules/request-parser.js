const mongoose = require('mongoose');

const RequestParser = function (schema, type) {
  this.model = mongoose.model(type, schema);
  this.document = new this.model();
  this.paths = Object.keys(schema.paths);
  this.isSearch;
  this.query = {};


  this.splitAndTrim = function(key) {
    let array = [];
    key.split(',').forEach((value) => {array.push(value.trim())});
    return array;
  }
  this.getPath = function(key) {
    let prop = this.paths.filter((path) => {
      return path.match(new RegExp(`\\.${key}\\b`, 'i'));
    })
    return prop.toString();
  }
  this.buildQueryObj = function(key, value) {
    let obj = {};

    key == 'keywords' ? !this.isSearch ? !this.query['$push'] ? this.query["$push"] = {} : null : null : null ;

    if (this.isSearch) {
      obj[this.getPath(key)] = Array.isArray(value) ? { $in : value } : value;
      this.query.push(obj);
    } else {
      key == 'keywords' ? this.query['$push'][this.getPath(key)] = { $each: value} : this.query[this.getPath(key)] = value;
    }
  }
}

RequestParser.prototype.parse = function(request) {

  this.isSearch = request.page ? true : false;
  this.query = this.isSearch ? [] : {} ;

  Object.keys(request).forEach((key, index) => {
    if (key && key != 'page' && key != 'doAnd') {
      if (key == 'names' || key == 'keywords') {
        this.buildQueryObj(key, this.splitAndTrim(request[key]));
      } else {
        this.buildQueryObj(key, request[key]);
      }
    }
  })

  return this.query;
}

RequestParser.prototype.createDoc = function(request) {
  this.document = new this.model();

  Object.keys(request).forEach(key => {
    this.document.set({ [this.getPath(key)] :  request[key] })
  })

  return this.document;
}

module.exports = RequestParser;
