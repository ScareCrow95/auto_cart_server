module.exports = (err, res) => {
  if (process.env.NODE_ENV !== 'production') {
    console.error(err)
  }

  if (res) {
    const status = err.message[0] === '5' ? 500 : 400
    return res.status(status).send(err.message)
  } else {
    return true
  }
}
