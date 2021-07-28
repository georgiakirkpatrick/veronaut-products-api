const path = require('path')
const express = require('express')
const CategoriesService = require('./categories-service')
const ProductsService = require('../products/products-service')
const categoriesRouter = express.Router()
const xss = require('xss').escapeHtml
const { doesNotMatch } = require('assert')
const jsonParser = express.json()

const serializeCategories = category => ({
    id: category.id,
    english_name: xss(category.english_name),
    category_class: category.category_class,
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
    .get(async (req, res, next) => {
        const categoryId = res.category.id
        const productArray = await CategoriesService.getProductsForCategory(
            req.app.get('db'), 
            categoryId
        )

        const makeNewProductArray = async array => {
            const newProductArray = array.map(async product => {
                const productCerts = await ProductsService.getCertificationsForProduct(
                    req.app.get('db'),
                    product.id
                )

                const productColorsImages = await ProductsService.getColorsImages(
                    req.app.get('db'),
                    product.id
                )
    
                const cmtFactories = await ProductsService.getFactoriesForProduct(
                    req.app.get('db'),
                    product.id
                )
    
            
                const productNotions = await ProductsService.getNotionsForProduct(
                    req.app.get('db'),
                    product.id
                )
                        
                const makeImageArray = colorId => {
                    const newImageArray = []
                    productColorsImages.map(colorImage => {
                        if (colorImage.color_id === colorId) {
                            const newImage = {
                                id: colorImage.image_id,
                                image_url: colorImage.product_image_url,
                                primary_image_for_color: colorImage.primary_image_for_color
                            }
            
                            if (colorImage.primary_image_for_color === true) {
                                newImageArray.splice(0, 0, newImage)
                            } else {
                                newImageArray.push(newImage)
                            }
                        }
                    })
        
                    return newImageArray
                }
                    
                const makeColorArray = () => {
                    const newColorArray = []
        
                    productColorsImages.forEach(colorImage => {
                        const colorIndex = newColorArray.findIndex(color => color.id === colorImage.color_id)
                        const colorId = colorImage.color_id
                        const newImageArray = makeImageArray(1)
    
                        if (colorIndex === -1) {
                            const newColorImage = {
                                id: colorImage.color_id,
                                color_description_id: colorImage.color_description_id,
                                color_english_name: colorImage.color_english_name,
                                swatch_image_url: colorImage.swatch_image_url,
                                image_array: newImageArray
                            }
        
                            newColorArray.push(newColorImage)
                        }
                    })    
        
                    return newColorArray
                }

                const makeNotionArray = () => {
                    const newNotionArray = []
        
                    productNotions.forEach(notion => {
                        const notionIndex = newNotionArray.findIndex(n => n.id === notion.id)
        
                        if (notionIndex === -1) {
                            const newNotion = {
                                id: notion.id,
                                notion_type_id: notion.notion_type_id,
                                type: notion.type,
                                brand_id: notion.brand_id,
                                manufacturer_country: notion.manufacturer_country,
                                manufacturer_id: notion.manufacturer_id,
                                manufacturer_notes: notion.manufacturer_notes,
                                material_type_id: notion.material_type_id,
                                material_origin_id: notion.material_origin_id,
                                material_producer_id: notion.material_producer_id,
                                material_notes: notion.material_notes,
                                // certification_ids: [notion.certification_id ? notion.certification_id : null],
                                approved_by_admin: notion.approved_by_admin,
                                date_published: notion.date_published
                            }
                            newNotionArray.push(newNotion)
                        } 
                        // else {
                        //     newNotionArray.certification_ids.push(notion.certification_id)
                        // }
                    })

                    return newNotionArray
                }
                    
                const newProduct = {
                    approved_by_admin: product.approved_by_admin,
                    brand_currency: product.brand_currency,
                    brand_id: product.brand_id,
                    brand_name: product.brand_name,
                    category_id: product.category_id,
                    certification_array: productCerts,
                    cmt_factory_array: cmtFactories,
                    cmt_notes: product.cmt_notes ? xss(product.cmt_notes) : null,
                    color_array: makeColorArray(),
                    cost_in_home_currency: product.cost_in_home_currency,
                    date_published: product.date_published,
                    dry_id: product.dry_id,
                    english_name: xss(product.english_name),
                    feature_image_url: xss(product.feature_image_url),
                    id: product.id,
                    multiple_color_options: product.multiple_color_options,
                    notion_array: makeNotionArray(),
                    product_url: xss(product.product_url),
                    wash_id: product.wash_id
                }
    
                return newProduct
            })

            await Promise.all(newProductArray)

            res.json(await Promise.all(newProductArray))
        }
        
        makeNewProductArray(productArray)
    })

module.exports = categoriesRouter