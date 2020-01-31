const Model = require('./Models/Models')

module.exports = async () => {
  const carts = await Model.cart.findOne({ isActive: true, isBusy: false })
  if (carts) return carts._id
  else return false
}
