const mongoose = require('mongoose');
const paginate = require('mongoose-paginate');

const photoSchema =   new mongoose.Schema({
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
  })

  photoSchema.plugin(paginate);

module.exports = photoSchema;
