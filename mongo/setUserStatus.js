const Models = require('./Models/Models')

module.exports = async (id, status) => {
  let user
  user = await Models.user.findOne({ _id: id })

  if (user) {
    user.status = status
    if (status === '') user.cartId = ''
    await user.save()
  }
}
