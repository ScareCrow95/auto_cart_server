const Models = require('../../mongo/Models/Models')
const uuid = require('uuid/v1')
const createPasswordHash = require('../../utils/createPasswordHash')

module.exports = async () => {
  const password = uuid()
  console.log(uuid)
  const cart = new Models.cart()
  cart.password = await createPasswordHash(password)
  cart._id = uuid().split('-')[4]
  console.log(cart._id)
  await cart.save()

  return {
    _id: cart._id,
    password: password
  }
}
