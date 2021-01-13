const path = require('path')
const express = require('express')
const xss = require('xss').escapeHtml
const UsersService = require('./users-service')
const usersRouter = express.Router()
const jsonParser = express.json()

const serializeUser = user => ({
    id: user.id,
    email: xss(user.username),
    password: xss(user.password),
    handle: xss(user.handle),
    name: xss(user.name),
    website: xss(user.website),
    profile_pic: xss(user.profile_pic),
    bio: xss(user.bio),
    public: user.public,
    account_created: user.account_created
})

usersRouter
    .route('/')
    .get((req, res, next) => {
        UsersService
            .getAllUsers(req.app.get('db'))
            .then(users => {
                res.json(users.map(serializeUser))
        })
        .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
        const {
            email,
            password,
            handle,
            name,
            website,
            profile_pic,
            bio,
            public,
            account_created
        } = req.body

        const newUser = {
            email,
            password,
            handle,
            name,
            website,
            profile_pic,
            bio,
            public,
            account_created
        }

        const requiredFields = {
            email,
            password,
            public,
            account_created
        }

        for (const [key, value] of Object.entries(requiredFields)) {
            if (value === undefined) {
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body`}
                })
            }
        }

        UsersService.insertUser(
            req.app.get('db'),
            newUser
        )
        .then(user => {
            res
                .status(201)
                .location(path.posix.join(req.originalUrl, `/${user.id}`))
                .json(serializeUser)
        })
        .catch(next)
    })

usersRouter
    .route('/:user_id')
    .all((req, res, next) => {
        UsersService.getUserById(
            req.app.get('db'),
            req.params.product_id
        )
        .then(user => {
            if (!user) {
                return res.status(404).json({
                    error: { message: `User does not exist` }
                })
            }
            res.user = user
            next()
        })
        .catch(next)
    })
    .get((req, res, next) => {
        res.json({
            id: res.user.id,
            email: xss(res.user.username),
            password: xss(res.user.password),
            handle: xss(res.user.handle),
            name: xss(res.user.name),
            website: xss(res.user.website),
            profile_pic: xss(res.user.profile_pic),
            bio: xss(res.user.bio),
            public: res.user.public,
            account_created: res.user.account_created
        })
        .catch(next)
    })
    .patch(jsonParser, (req, res, next) => {
        const {
            email,
            password,
            handle,
            name,
            website,
            profile_pic,
            bio,
            public,
            account_created
        } = req.body

        const userToUpdate = {
            email,
            password,
            handle,
            name,
            website,
            profile_pic,
            bio,
            public,
            account_created
        }

        const numberOfValues = Object.values(userToUpdate).filter(Boolean).length
        if (numberOfValues === 0) {
            return res.status(400).json({
                error: { 
                    message: `Request body must contain 'email', 'password', 'handle', 'name', 'website', 'profile_pic', 'bio', 'public', or 'account_created'`
                }
            })
        }
        
        UsersService.updateProduct(
            req.app.get('db'),
            req.params.product_id,
            productToUpdate
        )
        .then(numRowsAffected => {
            res.status(204).end()
        })
        .catch(next)
    })
    .delete((req, res, next) => {
        UsersService.deleteUser(
            req.app.get('db'),
            req.params.user_id
        )
        .then(() => {
            res.status(204).end()
        })
        .catch(next)
    })

module.exports = usersRouter