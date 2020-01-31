const cartAvailable = require('../../mongo/cartAvailable')

const pushUser = require('../../push/pushUser')

const Models = require('../../mongo/Models/Models')
const clients = {}

async function handle(nsp) {
  eventManager.on('passenger_ready', async cartId => {
    const cart = await Models.cart.findById(cartId, 'userId')

    if (cart.userId) {
      const user = await Models.user.findById(cart.userId, 'stats')
      if (user) {
        user.status = 'in_transit'
        await user.save()
        if (clients[user._id]) {
          clients[user._id].emit('in_transit')
        }
      }
    }
  })

  eventManager.on('transit_end', async data => {
    console.log('sending transit end')

    await Models.user.updateOne(
      { _id: data.user.id },
      { status: 'transit_end' }
    )
    if (clients[data.user.id]) {
      clients[data.user.id].emit('transit_end')
    }
  })

  eventManager.on('passenger_exit', async data => {
    const user = await Models.user.findById(data.userId, 'status')

    if (user) {
      user.status = ''
      await user.save()
    }
    const response = { cart: data.cartId, user: '' }

    if (clients[data.userId]) {
      clients[data.userId].emit('get_status', JSON.stringify(response))
    }
  })

  eventManager.on('summon_finish', async data => {
    await Models.user.updateOne(
      { _id: data.user.id },
      { status: 'summon_finish' }
    )
    if (clients[data.user.id]) {
      clients[data.user.id].emit('summon_finish')
    }
  })

  nsp.on('connection', socket => {
    //send connection success
    socket.emit('success', {})

    //client will send the device UUID
    socket.on('client_id', async id => {
      clients[id] = socket
      await sendStatus(id, socket)
    })

    socket.on('on_summon', data => {
      // {id,latitude,longtitude}
      handleSummon(JSON.parse(data), socket)
    })

    socket.on('on_cancel', cartId => {
      handleCancel(cartId, socket)
    })
  })
}

async function handleCancel(cartId, socket) {
  const cart = await Models.cart.findById(cartId, 'userId isBusy')
  if (cart) {
    const user = await Models.user.findById(cart.userId, 'status')
    if (user) {
      user.status = ''
      await user.save()
    }
    cart.isBusy = false
    cart.userId = ''
    await cart.save()
    socket.emit('cancel_response', true)
  }
  socket.emit('cancel_response', false)
  eventManager.emit('user_cancel', cartId)
}

async function handleSummon(jsonData, socket) {
  //cart available to summon
  const cartId = await cartAvailable()

  if (cartId) {
    jsonData.cartId = cartId
    // tell subscribers that cart was summoned
    eventManager.emit('cart_summoned', jsonData)
  }

  await Models.user.updateOne({ _id: jsonData.id }, { status: 'summoned' })
  socket.emit('summon_response', !cartId ? '' : cartId)
}

//send the status - cartid and user status ['','summoned','transit'...]
//restarting the app will correctly sync where the user was before.
async function sendStatus(id, socket) {
  const user = await Models.user.findById(id).lean()
  const response = { cart: '', user: '' }
  //user already existed

  const cartStatus = await cartAvailable()
  console.log(cartStatus)

  //cart unavailable
  if (cartStatus) {
    response.cart = cartStatus
  }
  if (!user) {
    createUser(id)
  } else {
    response.user = user.status
  }

  console.log(response)

  socket.emit('get_status', JSON.stringify(response))
}

//first time app was launched, create the user on db
function createUser(id) {
  user = new Models.user()
  user._id = id
  user.lastLogin = Date.now()
  user.save()
}

module.exports.handle = handle
