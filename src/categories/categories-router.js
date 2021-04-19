const path = require('path')
const express = require('express')
const CategoriesService = require('./categories-service')
const categoriesRouter = express.Router()
const xss = require('xss').escapeHtml
const productsRouter = require('../products/products-router')
const jsonParser = express.json()

const serializeCategories = category => ({
    id: category.id,
    english_name: xss(category.english_name),
    category_class: category.category_class,
})

const serializeProducts = product => ({
    id : product.id,
    english_name : xss(product.english_name),
    brand_id : product.brand_id,
    brand_name : product.brand_name,
    brand_currency : product.brand_currency,
    category_id : product.category_id,
    product_url : xss(product.product_url),
    feature_image_url : xss(product.feature_image_url),
    multiple_color_options : product.multiple_color_options,
    cost_in_home_currency : product.cost_in_home_currency,
    wash_id : product.wash_id,
    dry_id : product.dry_id,
    cmt_country : product.cmt_country,
    cmt_factory_notes : xss(product.cmt_factory_notes),
    approved_by_admin : product.approved_by_admin,
    date_published : product.date_published
})

categoriesRouter
    .route('/')
    .get((req, res, next) => {
        CategoriesService
            .getAllCategories(
                req.app.get('db')
            )
            .then(categories => {
                res.json(categories.map(serializeCategories))
            })
            .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
        const {
            english_name,
            category_class
        } = req.body

        const newCategory = {
            english_name,
            category_class
        }
    
        for (const [key, value] of Object.entries(newCategory)) {
            if (value === null) {
                return res.status(400).json({
                    error: { message: `Missing ${key} in request body.`}
                })
            }
        }
    
        CategoriesService
            .insertCategory(
                req.app.get('db'),
                newCategory
            )
            .then(category => {
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl + `/${category.id}`))
                    .json((category))
                    
            })
            .catch(next)
    })

categoriesRouter
    .route('/:category_id/products')
    .all((req, res, next) => {
        console.log('req.params.category_id', req.params.category_id)

        CategoriesService.getCategoryById(
                req.app.get('db'),
                req.params.category_id
            )
            .then(category => {

                if (!category) {
                    return res.status(404).json({
                        error: { message: `Category does not exist` }
                    })
                }
                res.category = category
                next()
            })
            .catch(next)
    })
    .get((req, res, next) => {
        const categoryId = res.category.id
        CategoriesService
            .getProductsForCategory(
                req.app.get('db'), 
                categoryId
            )
            .then(products => {
                res.json(products.map(serializeProducts))
            })
            .catch(next)
    })

module.exports = categoriesRouter