const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  username: String,
  password: String,
  lastLogin: { type: Boolean, default: false },
  access: { type: String, default: 'basic' }
})

const BackendUser = mongoose.model('backend-user', schema)
module.exports = BackendUser
