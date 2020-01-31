var OneSignal = require('onesignal-node')
const keys = require('../../keys/keys')

var myClient = new OneSignal.Client({
  userAuthKey: keys.userAuthKey,
  app: {
    appAuthKey: keys.appAuthKey,
    appId: keys.appId
  }
})

module.exports = (id, msg) => {
  var notification = new OneSignal.Notification({
    contents: {
      en: msg
    },
    filters: [
      {
        field: 'tag',
        key: 'id',
        relation: '=',
        value: id
      }
    ]
  })

  myClient.sendNotification(notification, function(err, httpResponse, data) {
    if (err) {
      console.log('Something went wrong...')
    } else {
      console.log(data)
    }
  })
}
