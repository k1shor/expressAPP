const User = require('../model/userModel')
const Token = require('../model/tokenModel')
const crypto = require('crypto')
const sendEmail = require('../utils/setEmail')
const jwt = require('jsonwebtoken')
const {expressjwt} = require('express-jwt')

// register new user
exports.register = async (req, res) => {
    const {username, email, password} = req.body
    // check if email already registered
    const user = await User.findOne({email: email})
    if(user){
        return res.status(400).json({error:"Email already exists."})
    }
    let newUser = new User({
        username: username,
        email: email,
        password: password
    })
    // add user to database
    newUser = await newUser.save()
    if(!newUser){
        return res.status(400).json({error:"Something went wrong"})
    }
    // generate token
    let token = new Token({
        token:crypto.randomBytes(24).toString('hex'),
        user: newUser._id
    })
    token = await token.save()
    if(!token){
        return res.status(400).json({error:"Something went wrong"})
    }
    // send token in email
    // const url = `http://localhost:5000/api/verifyEmail/${token.token}`
    // const url = `http://localhost:3000/verifyEmail/${token.token}`
    const url = `${process.env.FRONTEND_URL}/verifyEmail/${token.token}`
    sendEmail({
        from: "noreply@something.com",
        to: newUser.email,
        subject: "Verification email",
        text: `Click on the following link or copy paste it in browser to verify your email.${url}`,
        html: `<a href="${url}"><button>Verify Email</button></a>`
    })

    res.send(newUser)
}

// to verify user
exports.verifyEmail = async (req, res) => {
    // check token
    const token = await Token.findOne({token: req.params.token})
    if(!token){
        return res.status(400).json({error:"Invalid token or token may have expired"})
    }
    // find user
    let user = await User.findById(token.user)
    if(!user){
        return res.status(400).json({error:"User not found"})
    }
    // check if already verified
    if(user.isVerified){
        return res.status(400).json({error:"User already verified. Login to continue"})
    }
    // verify user
    user.isVerified = true
    user = await user.save()
    if(!user){
        return res.status(400).json({error:"Something went wrong"})
    }
    return res.status(200).json({message:"User verified successfully."})
}

// to resend verification email
exports.resendVerification = async (req, res) => {
    // check if email is registered or not
    let user = await User.findOne({email: req.body.email})
    if(!user){
        return res.status(400).json({error:"Email not registered"})
    }
    // check if already verified
    if(user.isVerified){
        return res.status(400).json({error:"Email/User already verified"})
    }
    // generate token
    let token = new Token({
        token: crypto.randomBytes(24).toString('hex'),
        user: user._id
    })
    token = await token.save()
    if(!token){
        return res.status(400).json({error:"Something went wrong"})
    }
    // send token in email
    const url = `http://localhost:5000/api/verifyEmail/${token.token}`
    sendEmail({
        from: "noreply@something.com",
        to: user.email,
        subject: "Verification email",
        text: `Click on the following link or copy paste it in browser to verify your email.${url}`,
        html: `<a href="${url}"><button>Verify Email</button></a>`
    })

    res.send({message:"Verification link has been sent to your email."})
}

// forget password
exports.forgetPassword = async (req, res)=>{
    // check email
    const user = await User.findOne({email: req.body.email})
    if(!user){
        return res.status(400).json({error:"Email not registered"})
    }
    // generate token
    let token = new Token({
        token: crypto.randomBytes(24).toString('hex'),
        user: user._id
    })
    token = await token.save()
    if(!token){
        return res.status(400).json({error:"Something went wrong"})
    }
    // send in email
    // const url = `http://localhost:5000/api/resetpassword/${token.token}`
    const url = `${process.env.FRONTEND_URL}/resetpassword/${token.token}`
    sendEmail({
        from:"noreply@example.com",
        to: user.email,
        subject:"Password reset email",
        text: `Click on the link to reset password ${url}`,
        html: `<a href="${url}"><button>Reset Password</button></a>`
    })
    return res.send({message:"Password reset link has been sent to your email."})

}

// to reset password
exports.resetPassword = async (req, res)=> {
    // check token
    const token = await Token.findOne({token: req.params.token})
    if(!token){
        return res.status(400).json({error:"Invalid token or token may have expired"})
    }
    // find user
    let user = await User.findById(token.user)
    if(!user){
        return res.status(400).json({error:"Something went wrong"})
    }
    user.password = req.body.password
    user = await user.save()
    if(!user){
        return res.status(400).json({error:"Something went wrong"})
    }
    res.send({message:"Password reset successfully"})
}

// to get userlist
exports.getUserList = async (req, res) => {
    let users = await User.find()
    if(!users){
        return res.status(400).json({error:"Something went wrong"})
    }
    res.send(users)
 }

//  to get userDetails
exports.getUserDetails = async(req, res) => {
    let user = await User.findById(req.params.id)
    if(!user){
        return res.status(400).json({error:"Something went wrong"})
    }
    res.send(user)
}

// to update user
exports.updateUser = async (req, res) => {
    let user = await User.findByIdAndUpdate(req.params.id,{
        username: req.body.username,
        email: req.body.email,
        isVerified: req.body.isVerified,
        role: req.body.role
    },{new:true})
    if(!user){
        return res.status(400).json({error:"Something went wrong"})
    }
    res.send(user)
}

// signin process
exports.signIn = async (req, res) => {
    let {email, password} = req.body
    // check email
    let user = await User.findOne({email: email})
    if(!user){
        return res.status(400).json({error:"Email not registered"})
    }
    // check password
    if(!user.authenticate(password)){
        return res.status(400).json({error:"Email and password do not match"})
    }
    // check if verified
    if(!user.isVerified){
        return res.status(400).json({error:"User not verified."})
    }
    // create sign in token
    let token = jwt.sign({user: user._id, role: user.role}, process.env.JWT_SECRET)

    // set Cookie
    res.cookie('myCookie', token , {expire: Date.now()+86400 })

    // return info to frontend
    let {_id, username, role} = user
    res.send({token, user:{_id, username, email, role}})
}

// signout
exports.signOut = async (req, res) => {
    await res.clearCookie('myCookie')
    res.send({message:"Signed out successfully"})
}

// for authorization
exports.requireSignin = expressjwt({
    algorithms: ['HS256'],
    secret: process.env.JWT_SECRET
})