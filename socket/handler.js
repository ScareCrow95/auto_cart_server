const adminHandler = require('./components/admin')
const cartHandler = require('./components/cart')
const clientHandler = require('./components/client')
const cartUIHandler = require('./components/cartUI')
let adminNsp = {}
let cartNsp = {}
let clientNsp = {}
let cartUINsp = {}

module.exports = io => {
  adminNsp = io.of('/admin')
  cartNsp = io.of('/cart')
  clientNsp = io.of('/client')
  cartUINsp = io.of('/cartUI')
  adminHandler.handle(adminNsp)
  cartHandler.handle(cartNsp, io)
  clientHandler.handle(clientNsp)
  cartUIHandler.handle(cartUINsp)
}
