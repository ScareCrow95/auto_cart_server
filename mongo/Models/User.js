const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  _id: String,
  lastLogin: { type: Number },
  queueTimestamp: { type: Number },
  lastStatusUpdate: { type: Number },
  status: { type: String, default: '' }, //offline, queued, waiting, riding, online,
  previousDestinations: { type: Object, default: {} },
  currentDestination: { type: String, default: 'none' },
  latitude: Number,
  longitude: Number,
  cartId: { type: String, default: 'none' } // assign the id of the cart when the person successfully calls a cart
})

const User = mongoose.model('user', schema)
module.exports = User
