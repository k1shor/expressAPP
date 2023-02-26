const express = require('express')
const { placeOrder, getAllOrders, getOrderDetails, getUserOrders, updateOrder, deleteOrder } = require('../controller/orderController')
const router = express.Router()

router.post(`/placeorder`,placeOrder)
router.get(`/orderlist`, getAllOrders)
router.get(`/orderdetails/:id`, getOrderDetails)
router.get('/userorders/:userid', getUserOrders)
router.put('/updateorder/:orderid', updateOrder)
router.delete('/deleteOrder/:orderid', deleteOrder)

module.exports = router