const app = require('express')()
const server = require('http').createServer(app)
const io = require('socket.io')(server)
const handler = require('./handler')

const events = require('events').EventEmitter
global.eventManager = new events()

handler(io)

module.exports = () =>
  server.listen(8020, () => {
    console.log('socket-server started at 8020')
  })
