'use strict'
const api = require('./api/api')
const mongoose = require('mongoose')
const port = 8019
const keys = require('../keys/keys')
const socketListener = require('./socket/listener')
const Models = require('./mongo/Models/Models')
// const closest = require('./utils/getClosestWaypointIdx')

async function startup() {
  // ;['log', 'warn'].forEach(function(method) {
  //   var old = console[method]
  //   console[method] = function() {
  //     var stack = new Error().stack.split(/\n/)
  //     // Chrome includes a single "Error" line, FF doesn't.
  //     if (stack[0].indexOf('Error') === 0) {
  //       stack = stack.slice(1)
  //     }
  //     var args = [].slice.apply(arguments).concat([stack[1].trim()])
  //     return old.apply(console, args)
  //   }
  // })

  try {
    await mongoose.connect(
      keys.mongodb,
      { useNewUrlParser: true }
    )
    mongoose.set('useFindAndModify', false)
    console.log('connected to mongodb...')
  } catch (error) {
    console.log(error)
  }

  const carts = await Models.cart.find()
  carts[0].isBusy = false
  carts[0].userId = ''
  carts[0].destination = ''
  await carts[0].save()

  const users = await Models.user.find()
  for (let i = 0; i < users.length; i++) {
    const element = users[i]
    element.status = ''
    await element.save()
  }

  api.listen(port, () => {
    if (process.env.NODE_ENV !== 'production') {
      console.log('Game server started on port ' + port)
      socketListener()
    }
  })
}
startup()
