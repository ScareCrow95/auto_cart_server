const mongoose = require('mongoose')

const cartSchema = new mongoose.Schema({
  _id: String,
  cartName: { type: String, default: 'n/a' },
  password: String,
  isActive: { type: Boolean, default: false },
  isBusy: { type: Boolean, default: false },
  destination: { type: String, default: 'none' },
  previousDestinations: [Object],
  latitude: { type: Number, default: 0 },
  longitude: { type: Number, default: 0 },
  activeOn: { type: Number, default: 0 },
  busyOn: { type: Number, default: 0 },
  userId: String,
  timeToDestination: { type: Number, default: 0 }
})

const Cart = mongoose.model('cart', cartSchema)
module.exports = Cart
