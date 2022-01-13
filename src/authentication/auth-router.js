// const path = require('path')
// const express = require('express')
// const AuthService = require('../authentication/auth-service')
// const authRouter = express.Router()
// const xss = require('xss').escapeHtml
// const jsonParser = express.json()

// console.log('hi')

// authRouter
//     .route('/')
//     .post(jsonParser, (req, res, next) => {
//         const {
//             email,
//             password
//         } = req.body

//         const credentials = {
//             email,
//             password
//         }

//         if (!email || !password) { 
//             return res.status(400).json({ message: 'body must contain email and password'}) 
//         }

//         AuthService
//             .getUserByEmail(req.app.get('db'), email)
//             .then(user => {
//                 console.log('user', user)
//                 if (!user || user.password !== password) {
//                     return res.status(401).json({message: 'Wrong email or password'})
//                 }
                    
//                 res.json({
//                     user: { email: email, id: user.id },
//                     token: AuthService.makeBasicAuthToken(email, password)
//                 })
//             })
//     })

// module.exports = authRouter