const express = require('express')
const CategoriesService = require('./categories-service')

const categoriesRouter = express.Router()
const jsonParser = express.json()

categoriesRouter
    .route('/')
    .get((req, res, next) => {
        CategoriesService.getAllCategories(
            req.app.get('db')
        )
        .then(products => {
            res.json(products)
        })
        .catch(next)
    })

module.exports = categoriesRouter