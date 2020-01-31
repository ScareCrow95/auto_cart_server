const Models = require('./Models/Models')
const setUserOnline = require('./userOnline')

module.exports = async (id, isActive) => {
  const cart = await Models.cart.findOne({ _id: id })

  if (cart) {
    if (cart.destination !== '') {
      if (cart.previousDestinations != null) {
        if (cart.previousDestinations.length > 4) {
          cart.previousDestinations.shift()
        }
      }
      const log = {
        destination: cart.destination,
        timestamp: Date.now()
      }
      eventManager.emit('log_add', log)
      cart.previousDestinations.push(log)
    }
    cart.isActive = isActive
    cart.isBusy = false
    cart.destination = ''
    cart.activeOn = Date.now()
    if (cart.userId !== '') {
      await setUserOnline(cart.userId)
      eventManager.emit('transit_end', cart.userId)
      eventManager.emit('status_changed', cart.userId)
    }
    cart.userId = ''
    await cart.save()
  } else {
    throw new Error('Cart not found ' + id)
  }
}
