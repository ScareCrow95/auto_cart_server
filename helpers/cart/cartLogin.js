const keys = require('../../../keys/keys')
const createAuthToken = require('../../utils/createAuthToken')
const Models = require('../../mongo/Models/Models')
const getDataById = require('../../mongo/getDataById')

async function login(data) {
  if (!data.password || !data._id) throw new Error(4001)

  console.log(data)

  const cart = getDataById(data._id, '', Models.cart)
  if (!cart) throw new Error(4002)

  const token = createAuthToken(
    {
      _id: data._id
    },
    '24h'
  )

  const payload = {
    token
  }

  return payload
}

module.exports = login
