const Models = require('../../mongo/Models/Models')
const cartId = '1bcadd2fea88'
const destinations = {
  Home: { latitude: 38.431933, longitude: -78.87626 },
  Xlabs: { latitude: 38.431533, longitude: -78.87583 },
  Cafeteria: { latitude: 38.431197, longitude: -78.875903 },
  Clinic: { latitude: 38.431677, longitude: -78.876198 },
  'Rec Center': { latitude: 38.432085, longitude: -78.876298 }
}
async function handle(nsp) {
  let curDestination = ''
  eventManager.on('passenger_video', data => {
    nsp.emit('passenger_video', data)
  })

  eventManager.on('user_cancel', data => {
    nsp.emit('update_state', 'Idle')
  })

  eventManager.on('cart_summoned', data => {
    nsp.emit('update_state', 'Driving to passenger')
  })

  eventManager.on('summon_finish', data => {
    nsp.emit('update_state', 'Arrived at passenger')
  })

  eventManager.on('transit_await', data => {
    nsp.emit('update_state', "Waiting for passenger's input")
  })

  eventManager.on('set_destination', data => {
    nsp.emit('update_state', 'Driving to ' + data.name)
    curDestination = data.name
    if (destinations[data.name]) {
      nsp.emit('destination_gps', JSON.stringify(destinations[data.name]))
    }
  })

  eventManager.on('update_logs', data => {
    nsp.emit('add_log', JSON.stringify(data))
  })

  eventManager.on('passenger_exit', data => {
    nsp.emit('update_state', 'Idle')
  })

  eventManager.on('cart_video', data => {
    nsp.emit('cart_video', data)
  })

  eventManager.on('current_location', data => {
    nsp.emit('cart_gps', data)
  })

  eventManager.on('pull_over', () => {
    nsp.emit('update_state', 'Cart pulled over')
  })

  eventManager.on('resume_driving', () => {
    nsp.emit('update_state', 'Driving to ' + curDestination)
  })

  nsp.on('connection', async socket => {
    console.log('admin connecting')
    getState(socket)

    socket.on('message', msg => {
      eventManager.emit('admin_message', { msg: msg, cartId: cartId })
    })

    socket.on('pull_over', () => {
      eventManager.emit('pull_over', cartId)
      eventManager.emit('passenger_unsafe', cartId)
    })

    socket.on('resume_driving', () => {
      eventManager.emit('resume_driving', cartId)
      eventManager.emit('passenger_ready', cartId)
    })
  })
}

async function getState(socket) {
  const cart = await Models.cart.findById(cartId).lean()
  let state

  if (cart.isActive) {
    if (cart.userId) {
      if (!cart.destination) {
        const user = await Models.findById(cart.userId).lean()
        if (user.status === 'summon_finish') {
          state = 'Waiting for User'
        } else if (user.status === 'summoned') {
          state = 'Driving to User'
        }
      } else {
        state = 'Driving to ' + cart.destination
      }
    } else {
      state = 'Idle'
    }
  } else {
    state = 'Offline'
  }

  socket.emit(
    'state',
    JSON.stringify({ state: state, logs: cart.previousDestinations })
  )
}

module.exports.handle = handle
