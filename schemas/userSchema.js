const mongoose = require('mongoose');
const paginate = require('mongoose-paginate');

  const userSchema =
    new mongoose.Schema({
        userId: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        type: String,
        group: [String]
    })

  userSchema.plugin(paginate);

module.exports = userSchema;
