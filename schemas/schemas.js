const mongoose = require('mongoose');

var schemas = {

    photoSchema :
      new mongoose.Schema({
          created: { type: Date , required: true},
          date: {
              day: Number,
              month: Number,
              year: Number
          },
          location: {
              city: String,
              state: String,
              country: String
          },
          meta: {
              venue: String,
              occasion: String,
              names: [String],
              keywords: [String],
              event: {
                  en: String,
                  da: String
              },
          },
          image: {
              fileName: { type: String, required: true, unique: true },
              thumbnail: Buffer
          }
      }),

    videoSchema :
      new mongoose.Schema({
        created: { type: Date , required: true},
        date: {
            day: Number,
            month: Number,
            year: Number
        },
        location: {
            city: String,
            state: String,
            country: String
        },
        meta: {
            venue: String,
            occasion: String,
            names: [String],
            keywords: [String],
            event: {
                en: String,
                da: String
            },
        },
        video: {
            fileName: { type: String, required: true, unique: true },
            thumbnail: Buffer
        }
      }),

    userSchema:
      new mongoose.Schema({
          userId: { type: String, required: true, unique: true },
          password: { type: String, required: true },
          type: String,
          group: [String]
      })
}


module.exports = schemas;
