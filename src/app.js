require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const { NODE_ENV } = require('./config')
const CategoriesService = require('./categories-service')
const ProductsService = require('./products-service')

const app = express()

const morganOption = (NODE_ENV === 'production')
    ? 'tiny'
    : 'common'

app.use(morgan(morganOption))
app.use(helmet())
app.use(cors())

app.get('/categories', (req, res, next) => {
    const knexInstance = req.app.get('db')
    CategoriesService.getAllCategories(knexInstance)
        .then(categories => {
            res.json(categories)
        })
        .catch(next)
})

app.get('/products', (req, res, next) => {
    const knexInstance = req.app.get('db')
    ProductsService.getAllProducts(knexInstance)
        .then(products => {
            res.json(products)
        })
        .catch(next)
})

app.get('/products/:product_id', (req, res, next) => {
    const knexInstance = req.app.get('db')
    ProductsService.getById(knexInstance, req.params.product_id)
        .then(product => {
            if (!product) {
                return res.status(404).json({
                    error: { message: `Product doesn't exist`}
                })
            }
            res.json(product)
        })
        .catch(next) 
})

app.get('/', (req, res) => {
    res.send('Hello, world!')
})

app.use(function errorHandler(err, req, res, next) {
    let response
    if (process.env.NODE_ENV === 'production') {
        response = { error: { message: 'server error' } }
    } else {
        console.error(error)
        response = { error: { message: 'server error' } }
    }
    res.status(500).json(response)
})

module.exports = app