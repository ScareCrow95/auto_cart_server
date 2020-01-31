const Models = require('./Models/Models')

module.exports = async id => {
  let user
  console.log(id)
  user = await Models.user.findOne({ _id: id })
  console.log(user)

  if (user) {
    await Models.cart.updateOne({ _id: user.cartId }, { $set: { userId: '' } })
    user.cartId = ''
    user.status = ''
    await user.save()
    return true
  } else return false
}
