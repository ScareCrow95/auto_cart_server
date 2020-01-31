const Models = require('./Models/Models')

module.exports = async (data, cart) => {
  let user
  user = await Models.user.findOne({ _id: data.id })
  if (user) {
    user.queueTimestamp = Date.now()
    user.latitude = data.latitude
    user.longitude = data.longitude
    user.cartId = cart
    user.status = 'waiting'
    await user.save()
    return true
  } else return false
}
