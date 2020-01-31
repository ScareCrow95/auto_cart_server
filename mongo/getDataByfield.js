module.exports = async (selectedField, fields = '', schema) => {
  const data = await schema.find(selectedField, fields)
  if (data) return data
  else return null
}
