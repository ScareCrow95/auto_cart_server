const carts = {} //socket id | cartId
const closestWaypoint = require('../../utils/getClosestWaypointIdx')
const Models = require('../../mongo/Models/Models')
const checkDestination = require('../../utils/checkValidDestination')
const cartIdTemp = '1bcadd2fea88'
function handle(nsp, io) {
  let fakeArriveTimeout

  eventManager.on('cart_summoned', async data => {
    const idx = closestWaypoint(data)
    nsp.emit('cart_request', JSON.stringify(data))

    await Models.cart.updateOne(
      { _id: data.cartId },
      { isBusy: true, userId: data.id }
    )
    // setTimeout(() => {
    //   HandleArrived(cartIdTemp)
    // }, 1000)
  })

  eventManager.on('transit_await', cartId => {
    if (carts[cartId]) {
      console.log('cart found')
      carts[cartId].emit('transit_await')
    }
  })

  eventManager.on('pull_over', cartId => {
    console.log('sending pullover')
    if (carts[cartId]) {
      carts[cartId].emit('pull_over')
    }
  })

  eventManager.on('resume_driving', cartId => {
    console.log('sending resume_driving')

    if (carts[cartId]) {
      carts[cartId].emit('resume_driving')
    }
  })

  eventManager.on('set_destination', async data => {
    console.log('sending destination')
    if (carts[data.cartId]) {
      console.log('sending destination cart found')
      carts[data.cartId].emit('destination', data.name)
    }
    const cart = await Models.cart.findById(data.cartId, 'previousDestinations')
    if (cart.previousDestinations) {
      const destTemp = cart.previousDestinations
      destTemp.unshift({ destination: data.name, timestamp: Date.now() })
      if (destTemp.length > 5) destTemp.pop()

      cart.previousDestinations = destTemp
      eventManager.emit('update_logs', destTemp)
      await cart.save()
    }

    // setTimeout(() => {
    //   eventManager.emit('passenger_ready', cartIdTemp)
    // }, 1000)

    // setTimeout(() => {
    //   HandleArrived(cartIdTemp)
    // })
  })

  eventManager.on('user_cancel', () => {
    clearTimeout(fakeArriveTimeout)
  })

  nsp.on('connection', socket => {
    console.log('cart connecting')

    /* 
    id
    latitude
    longitude

    */
    socket.on('position', data => {
      // console.log(data)
    })

    socket.on('passenger_unsafe', id => {
      eventManager.emit('passenger_unsafe', id)
    })

    //expects cart id
    socket.on('passenger_ready', id => {
      eventManager.emit('passenger_ready', id)
    })

    socket.on('connect', id => {
      console.log('cart connected!')
      carts[id] = socket
    })

    socket.on('arrived', async data => {
      await HandleArrived('1bcadd2fea88')
    })

    socket.on('current_location', data => {
      console.log(data)
      eventManager.emit('current_location', data)
    })

    // requires cart id
    socket.on('passenger_exit', id => {
      handlePassengerExit(id)
    })

    socket.on('audio', data => {
      //id, msg
      const jsonData = JSON.parse(data)
      jsonData.valid = checkDestination(jsonData.msg)
      eventManager.emit('audio', jsonData)
    })

    socket.on('passenger_video', data => {
      eventManager.emit('passenger_video', data.toString())
    })

    socket.on('cart_video', data => {
      eventManager.emit('cart_video', data.toString())
    })

    socket.on('disconnect', () => {
      console.log('cart disconnected')
    })
  })

  async function HandleArrived(id) {
    console.log('arrived')
    const cartData = await Models.cart.findById(id, 'userId').lean()
    if (cartData.userId) {
      const user = await Models.user.findById(cartData.userId, 'status').lean()
      const response = {
        cartid: id,
        user: { id: cartData.userId, status: user.status }
      }
      if (user.status === 'summoned') {
        eventManager.emit('summon_finish', response)
      } else if (user.status === 'in_transit') {
        eventManager.emit('transit_end', response)
      }
    }
  }
}

async function handlePassengerExit(id) {
  const cart = await Models.cart.findById(id, 'isBusy destination userId')

  if (cart) {
    eventManager.emit('passenger_exit', { userId: cart.userId, cartId: id })
    cart.isBusy = false
    cart.destination = ''
    cart.userId = ''
    await cart.save()
  }
}

module.exports.handle = handle
