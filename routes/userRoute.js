const express = require('express')
const { register, verifyEmail, resendVerification, forgetPassword, resetPassword, getUserList, getUserDetails, updateUser, signIn, signOut } = require('../controller/userController')
const { userCheck, validate } = require('../validation')
const router = express.Router()

router.post('/register',userCheck, validate, register)
router.get(`/verifyEmail/:token`,verifyEmail)
router.post('/resendVerfication',resendVerification)
router.post('/forgetpassword',forgetPassword)
router.post('/resetpassword/:token', resetPassword)
router.get('/userlist',getUserList)
router.get('/userdetails/:id',getUserDetails)
router.put('/updateuser/:id',updateUser)
router.post('/signin', signIn)
router.get('/signout', signOut)

module.exports = router