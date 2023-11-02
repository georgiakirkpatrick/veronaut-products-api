const { authUserAdmin, confirmUser, requireAuth, requireAdmin } = require('../middleware/jwt-auth')
const path = require('path')
const express = require('express')
const xss = require('xss').escapeHtml
const UsersService = require('./users-service')
const usersRouter = express.Router()
const jsonParser = express.json()

const serializeUser = user => ({
    id: user.id,
    email: xss(user.email),
    password: user.password ? xss(user.password) : null,
    handle: user.handle ? xss(user.handle) : null,
    first_name: user.first_name ? xss(user.first_name) : null,
    last_name: user.last_name ? xss(user.last_name) : null,
    website: user.website ? xss(user.website) : null,
    profile_pic: user.profile_pic ? xss(user.profile_pic) : null,
    bio: user.bio ? xss(user.bio) : null,
    admin: user.admin,
    public: user.public,
    editor: user.editor,
    can_submit: user.can_submit,
    org_affiliation: user.org_affiliation ? xss(user.org_affiliation) : null,
    created_at: user.created_at, 
    updated_at: user.updated_at
})

const serializeUserProducts = product => ({
    relationship_id: product.relationship_id,
    id: product.id,
    english_name: xss(product.english_name),
    brand_currency: product.brand_currency,
    brand_id: product.brand_id,
    brand_name: product.brand_name,
    category_id: product.category_id,
    product_url: xss(product.product_url),
    feature_image_url: xss(product.feature_image_url),
    multiple_color_options: product.multiple_color_options,
    cost_in_home_currency: product.cost_in_home_currency,
    wash_id: product.wash_id,
    dry_id: product.dry_id,
    cmt_sew_country: product.cmt_sew_country,
    cmt_cut_country: product.cmt_cut_country,
    cmt_notes: product.cmt_notes ? xss(product.cmt_notes) : null,
    featured: product.featured,
    approved_by_admin: product.approved_by_admin,
    created_at: product.created_at,
        updated_at: product.updated_at
})

usersRouter
    .route('/')
    .get(requireAdmin, (req, res, next) => {
        UsersService
            .getAllUsers(req.app.get('db'))
            .then(users => {                
                res.json(users.map(serializeUser))
            })
            .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
        const {
            id,
            email,
            password,
            handle,
            first_name,
            last_name,
            website,
            profile_pic,
            bio,
            public,
            admin,
            editor,
            can_submit,
            org_affiliation,
            created_at,
            updated_at
        } = req.body

        const newUser = {
            id,
            email,
            password,
            handle,
            first_name,
            last_name,
            website,
            profile_pic,
            bio,
            public,
            admin,
            editor,
            can_submit,
            org_affiliation,
            created_at,
            updated_at
        }

        const requiredFields = {
            email,
            password
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
            {
                ...newUser,
                password: password
            }
        )
        .then(user => {
            res
                .status(201)
                .location(path.posix.join(req.originalUrl, `/${user.id}`))
                .json(serializeUser(user))
        })
        .catch(next)
    })

usersRouter
    .route('/:user_id')
    .all((req, res, next) => {
        UsersService.getUserById(
            req.app.get('db'),
            req.params.user_id
        )
        .then(user => {
            if (!user) {
                return res.status(404).json({
                    error: { message: `User does not exist.` }
                })
            }
            res.user = user
            next()
        })
        .catch(next)
    })
    .get(requireAuth, (req, res, next) => {
        const userInfo = res.user.public
            ? serializeUser(res.user)
            : {
                id: res.user.id,
                handle: res.user.handle ? xss(res.user.handle) : null
            }

        res.json(userInfo)

        next()
    })
    .patch(authUserAdmin, jsonParser, (req, res, next) => {
        const {
            email,
            password,
            handle,
            first_name,
            last_name,
            website,
            profile_pic,
            bio,
            public,
            admin,
            editor,
            can_submit,
            org_affiliation,
            created_at,
            updated_at
        } = req.body

        const userToUpdate = {
            email,
            password,
            handle,
            first_name,
            last_name,
            website,
            profile_pic,
            bio,
            public,
            admin,
            editor,
            can_submit,
            org_affiliation,
            created_at,
            updated_at
        }

        const numberOfValues = Object.values(userToUpdate).filter(value => value !== undefined).length

        if (numberOfValues === 0) {
            return res.status(400).json({
                error: { 
                    message: `Request body must contain 'admin', 'email', 'password', 'handle', 'first_name', 'last_name', 'website', 'profile_pic', 'bio', 'public', editor, can_submit, org_affiliation, 'created_at', or 'updated_at'`
                }
            })
        }

        if (userToUpdate.email) {
            const checkEmail = userToUpdate.email

            UsersService.preventRepeat(
                req.app.get('db'), 
                checkEmail
            )
            .then(user => {
                if (user) {
                    res.status(400).json( {
                        error: { message: 'Email address is already associated with an account.' }
                    })
                } else {
                    UsersService.updateUser(
                        req.app.get('db'),
                        req.params.user_id,
                        userToUpdate
                    )
                    .then(numRowsAffected => {
                        res.status(204).end()
                    })
                    .catch(next)
                }
            })
            .catch(next)
        }
        
        UsersService.updateUser(
            req.app.get('db'),
            req.params.user_id,
            userToUpdate
        )
        .then(numRowsAffected => {
            res.status(204).end()
        })
        .catch(next)
    })
    .delete(confirmUser, (req, res, next) => {
        UsersService.deleteUser(
            req.app.get('db'),
            req.params.user_id
        )
        .then(() => {
            res.status(204).end()
        })
        .catch(next)
    })

usersRouter
    .route('/:user_id/products')
    .all(confirmUser, (req, res, next) => {
        UsersService.getUserById(
            req.app.get('db'),
            req.params.user_id
        )
        .then(user => {
            if (!user) {
                return res.status(404).json({
                    error: { message: `User does not exist.` }
                })
            } else {
                UsersService.getProductsForUser(
                    req.app.get('db'),
                    req.params.user_id
                )
                .then(userProducts => {
                    if (!userProducts) {
                        return res.status(404).json({
                            error: { message: 'User does not have product associated with their account.' }
                        })
                    }
                    res.userProducts = userProducts
                    next()
                })
                .catch(next)
            }
        })
        .catch(next)
    })
    .get((req, res, next) => {
        const userId = req.params.user_id

        UsersService
            .getProductsForUser(
                req.app.get('db'), 
                userId
            ) 
            .then(products => {
                res.json(products.map(serializeUserProducts))
        })
        .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
        const {
            product_id,
            relationship_id
        } = req.body

        const userProduct = {
            user_id: Number(req.params.user_id),
            product_id,
            relationship_id
        }

        const requiredFields = {
            product_id,
            relationship_id
        }

        for (const [key, value] of Object.entries(requiredFields)) {
            if (value === undefined) {
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body`}
                })
            }
        }

        UsersService.insertUserProduct(
            req.app.get('db'),
            userProduct
        )
        .then(response => {
            res
                .status(201)
                .json(response)
        })
        .catch(next)
    })
    .delete(jsonParser, (req, res, next) => {
        const {
            product_id,
            relationship_id
        } = req.body

        const userProduct = {
            user_id: Number(req.params.user_id),
            product_id,
            relationship_id
        }

        const requiredFields = {
            product_id,
            relationship_id
        }

        for (const [key, value] of Object.entries(requiredFields)) {
            if (value === undefined) {
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body`}
                })
            }
        }

        const requestedProduct = res.userProducts.filter(product => product.id === userProduct.product_id)

        if (requestedProduct.length === 0) {
            return res.status(404).json({
                error: { message: `User does not have a relationship this product`}
            })
        }
        
        UsersService.deleteUserProd(
            req.app.get('db'),
            userProduct
        )
        .then(() => {
            res.status(204).end()
        })
        .catch(next)
    })

    


module.exports = usersRouter