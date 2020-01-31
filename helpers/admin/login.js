const keys = require('../../../keys/keys')
const createAuthToken = require('../../utils/createAuthToken')

async function login(data) {
  if (keys.password != data.password || keys.user != data.username) {
    return { error: 401 }
  }

  const token = createAuthToken(
    {
      username: data.username
    },
    '24h'
  )

  const payload = {
    token
  }

  return payload
}

module.exports = login
