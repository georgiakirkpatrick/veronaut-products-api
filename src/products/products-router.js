const express = require('express')
const xss = require('xss')
const ProductsService = require('./products-service')
const CategoriesService = require('../categories/categories-service')

const productsRouter = express.Router()
const jsonParser = express.json()

const serializeProduct = product => ({
    id: product.id,
    english_name: xss(product.english_name),
    brand_id: product.brand_id,
    category_id: product.category_id,
    product_url: xss(product.product_url),
    home_currency: product.home_currency,
    cost_in_home_currency: product.cost_in_home_currency,
    cmt_country: product.cmt_country,
    cmt_factory_notes: xss(product.cmt_factory_notes),
    approved_by_admin: product.approved_by_admin,
    date_published: product.date_published
})

productsRouter
    .route('/')
    .get((req, res, next) => {
        ProductsService
            .getAllProducts(req.app.get('db'))
            .then(products => {
                res.json(products.map(serializeProduct))
        })
        .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
        const {
            english_name,
            brand_id,
            category_id,
            product_url,
            home_currency,
            cost_in_home_currency,
            cmt_country,
            cmt_factory_notes,
            approved_by_admin
        } = req.body

        const newProduct = {
            english_name,
            brand_id,
            category_id,
            product_url,
            home_currency,
            cost_in_home_currency,
            cmt_country,
            cmt_factory_notes,
            approved_by_admin
        }

        for (const [key, value] of Object.entries(newProduct)) {
            if (value === null) {
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body`}
                })
            }
        }
        ProductsService.insertProduct(
            req.app.get('db'),
            newProduct
        )
        .then(product => {
            res
                .status(201)
                .location(`products/${product.id}`)
                .json(serializeProduct(product))
        })
        .catch(next)
    })

productsRouter
    .route('/:product_id')
    .all((req, res, next) => {
        ProductsService.getById(
            req.app.get('db'),
            req.params.product_id
        )
        .then(product => {
            if (!product) {
                return res.status(404).json({
                    error: { message: `Product does not exist` }
                })
            }
            res.product = product
            next()
        })
        .catch(next)
    })
    .get((req, res, next) => {
        res.json({
            id: res.product.id,
            english_name: xss(res.product.english_name),
            brand_id: res.product.brand_id,
            category_id: res.product.category_id,
            product_url: xss(res.product.product_url),
            home_currency: res.product.home_currency,
            cost_in_home_currency: res.product.cost_in_home_currency,
            cmt_country: res.product.cmt_country,
            cmt_factory_notes: xss(res.product.cmt_factory_notes),
            approved_by_admin: res.product.approved_by_admin,
            date_published: res.product.date_published
        })
    })
    .delete((req, res, next) => {
        ProductsService.deleteProduct(
            req.app.get('db'),
            req.params.product_id
        )
            .then(() => {
                res.status(204).end()
            })
            .catch(next)
    })

module.exports = productsRouter