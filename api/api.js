const express = require('express')
const jwt = require('jsonwebtoken')
const keys = require('../../keys/keys')
const handleError = require('../utils/handleError')
const cartRouter = require('./routes/cart-routes')
const adminRouter = require('./routes/admin-routes')
const handleRequest = require('./handleRequest')
const login = require('../helpers/admin/login')
const cartLogin = require('../helpers/cart/cartLogin')
const cors = require('cors')
const morgan = require('morgan')
const api = express()

api.use(express.static(__dirname + '/public'))

api.use(cors())

api.use(morgan('tiny'))
api.use(express.json())

api.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html')
})

api.post('/admin/login', (req, res) => {
  handleRequest(req, res, login)
})

api.post('/cart/login', (req, res) => {
  handleRequest(req, res, cartLogin)
})

api.use('/api', async (req, res, next) => {
  res.header('Access-Control-Allow-Headers', 'Authorization')

  try {
    if (req.get('Authorization')) {
      const token = req.get('Authorization').split(' ')[1]
      let decoded
      try {
        decoded = jwt.verify(token, Buffer.from(keys.jwt, 'base64'))
      } catch (err) {
        throw new Error('4202')
      }
      req.body.username = decoded.username
      next()
    } else {
      return res.sendStatus(401)
    }
  } catch (err) {
    return handleError(err, res)
  }
})

api.use('/api/cart', cartRouter)
api.use('/api/admin', adminRouter)

module.exports = api
