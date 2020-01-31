module.exports = async (id, fields = '', schema) => {
  const data = await schema.findOne({ _id: id }, fields)
  if (data) return data
  else return null
}
