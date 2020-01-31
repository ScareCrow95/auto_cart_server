const destinations = require('./destinations')

module.exports = dest => {
  let exist = false
  destinations.forEach(element => {
    if (element.name.toLowerCase() === dest) {
      exist = true
    }
  })
  return exist
}
