const Models = require('./Models/Models')

module.exports = async id => {
  let user
  user = await Models.user.findOne({ _id: id })

  if (!user) {
    return false
  } else {
    return user.status
  }
}
