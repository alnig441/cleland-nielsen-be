const mongoose = require('mongoose');
const paginate = require('mongoose-paginate');

const videoSchema =   new mongoose.Schema({
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
  })

  videoSchema.plugin(paginate);

module.exports = videoSchema;
