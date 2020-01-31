const handleError = require('../utils/handleError')

async function handleRequest(req, res, apiFunction) {
  try {
    const payload = await apiFunction(req.body)

    return typeof payload === 'number'
      ? res.sendStatus(payload)
      : res.json(payload)
  } catch (err) {
    return handleError(err, res)
  }
}

module.exports = handleRequest
