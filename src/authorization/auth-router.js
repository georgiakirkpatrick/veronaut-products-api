// const path = require('path')
// const express = require('express')
// const UsersService = require('../users/users-service')
// const authRouter = express.Router()
// const AuthHelper = require('./auth-helper')
// const xss = require('xss').escapeHtml
// const jsonParser = express.json()

// authRouter
//     .post('/login', jsonParser, (req, res) => {
//         const {
//             username,
//             password
//         } = req.body

//         if (!username || !password) { 
//             return res.status(400).json({ message: 'body must contain username and password'}) 
//         }

//         UsersService
//             .getByUsername(req.app.get('db'), username)
//             .then((user) => {
//                 if (!user || user.password !== password) {
//                     return res.status(401).json({message: 'Wrong username or password'})
//                 }
                    
//                 return res.json({
//                     user: { username, id: user.id },
//                     token: AuthHelper.generateToken(user)
//                 })
//             })
//     })

// module.exports = authRouter