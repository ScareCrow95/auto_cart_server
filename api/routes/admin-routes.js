const express = require('express')
const adminRouter = express.Router()
const handleRequest = require('../handleRequest')
const addCart = require('../../helpers/admin/addCart')

adminRouter.get('/add-cart', (req, res) => {
  handleRequest(req, res, addCart)
})

module.exports = adminRouter
