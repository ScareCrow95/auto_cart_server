const Models = require('../../mongo/Models/Models')
const carts = {}
const destinations = require('../../utils/destinations')

function handle(nsp) {
  eventManager.on('cart_summoned', data => {
    if (carts[data.cartId]) {
      carts[data.cartId].emit('summoned', data.id)
    }
  })

  eventManager.on('passenger_unsafe', cartId => {
    console.log('passenger unsafeee')

    if (carts[cartId]) {
      console.log('passenger unsafeee 11')

      carts[cartId].emit('passenger_unsafe')
    }
  })

  //when user cancels the summoned cart, tell the cart UI to reinit UI
  eventManager.on('user_cancel', id => {
    const response = {}
    response.userId = ''
    response.destinations = destinations

    if (carts[id]) {
      carts[id].emit('cart_init', JSON.stringify(response))
    }
  })

  eventManager.on('summon_finish', data => {
    if (carts[data.cartid]) {
      carts[data.cartid].emit('summon_finish', data.user.id)
    }
  })

  eventManager.on('admin_message', data => {
    if (carts[data.cartId]) {
      carts[data.cartId].emit('admin_message', data.msg)
    }
  })

  eventManager.on('current_location', data => {
    nsp.emit('cart_gps', data)
  })

  eventManager.on('passenger_ready', cartId => {
    console.log('passenger ready')

    if (carts[cartId]) {
      console.log(cartId)
      carts[cartId].emit('passenger_ready')
    }
  })

  eventManager.on('transit_end', data => {
    console.log('transit end UI')
    if (carts[data.cartid]) {
      carts[data.cartid].emit('transit_end')
    }
  })

  eventManager.on('audio', data => {
    if (carts[data.id]) {
      carts[data.id].emit('audio', JSON.stringify(data))
    }
  })

  eventManager.on('passenger_exit', async data => {
    if (carts[data.cartId]) {
      const response = {
        isBusy: false,
        userId: '',
        destinations: destinations
      }

      carts[data.cartId].emit('cart_init', JSON.stringify(response))
    }
  })

  nsp.on('connection', socket => {
    socket.emit('connected')

    // get the status of the cart and send it back
    socket.on('cart_id', id => {
      handleConnect(id, socket)
      console.log('cart ui connected')
    })

    socket.on('set_destination', data => {
      // name, userId, cartId
      handleSetDestination(data)
    })

    socket.on('transit_await', id => {
      Models.user.updateOne(id, { status: 'transit_await' })
      eventManager.emit('transit_await', id)
    })

    socket.on('pull_over', cartId => {
      eventManager.emit('pull_over', cartId)
    })

    socket.on('resume_driving', cartId => {
      eventManager.emit('resume_driving', cartId)
    })
  })
}

async function handleConnect(id, socket) {
  const cart = await Models.cart.findOne({ _id: id }).lean()
  carts[id] = socket
  const response = {
    isBusy: cart.isBusy,
    userId: '',
    destinations: destinations
  }
  // cart already had a user driving in it (internet dropped and socket reconnected)
  if (cart.userId) {
    const user = await Models.user.findOne({ _id: cart.userId }).lean()
    response.userId = cart.userId
    response.user_status = user.status
    response.currentDestination = user.currentDestination
  }
  socket.emit('cart_init', JSON.stringify(response))
}

async function handleSetDestination(data) {
  const jsonData = JSON.parse(data)
  const cart = await Models.cart.findById(jsonData.cartId, 'destination')
  cart.destination = jsonData.name
  eventManager.emit('set_destination', {
    name: jsonData.name,
    cartId: cart._id
  })
  await cart.save()
}

module.exports.handle = handle
