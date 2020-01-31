const Models = require('./Models/Models')

module.exports = async id => {
  let user

  user = await Models.user.findOne({ _id: id })

  if (!user) {
    user = new Models.user()
    user._id = id
    user.lastLogin = Date.now()
    user.status = ''
  } else {
    user.status = ''
    user.currentDestination = ''
  }
  await user.save()
  return user.status
}
