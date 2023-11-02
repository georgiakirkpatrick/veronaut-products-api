const express = require('express')
const { requireAdmin } = require('../middleware/jwt-auth')
const categoriesRouter = express.Router()
const CategoriesService = require('./categories-service')
const jsonParser = express.json()
const path = require('path')
const NotionsService = require('../notions/notions-service')
const ProductsService = require('../products/products-service')
const xss = require('xss').escapeHtml

const serializeCategories = category => ({
    id: category.id, 
    english_name: xss(category.english_name),
    category_class: category.category_class,
    feature_image: xss(category.feature_image)
})

const serializeCertification = certification => ({
    id: certification.id,
    english_name: xss(certification.english_name),
    website: xss(certification.website),
    approved_by_admin: certification.approved_by_admin,
    created_at: certification.created_at,
    updated_at: certification.updated_at

})

const serializeColorsImages = colorImage => ({
    color_id: colorImage.color_id,
    color_description_id: colorImage.color_description_id,
    color_english_name: xss(colorImage.color_english_name),
    swatch_image_url: xss(colorImage.swatch_image_url),
    image_id: colorImage.image_id,
    product_image_url: xss(colorImage.product_image_url),
    primary_image_for_color: colorImage.primary_image_for_color
})

const serializeFactories = factory => ({
    id: factory.id,
    english_name: xss(factory.english_name),
    country: factory.country,
    website: factory.website ? xss(factory.website) : null,
    notes: factory.notes ? xss(factory.notes) : null,
    stage: factory.stage,
    approved_by_admin: factory.approved_by_admin,
    created_at: factory.created_at,
    updated_at: certification.updated_at
})

const serializeNotions = notion => ({
    id: notion.id,
    notion_type_id: notion.notion_type_id,
    notion_type: notion.type ? xss(notion.type) : null,
    brand_id: notion.brand_id,
    manufacturer_country: notion.manufacturer_country,
    manufacturer_id: notion.manufacturer_id,
    manufacturer_notes: notion.manufacturer_notes ? xss(notion.manufacturer_notes) : null,
    material_type_id: notion.material_type_id,
    material_type: notion.material_type,
    material_origin_id: notion.material_origin_id,
    material_producer_id: notion.material_producer_id,
    material_notes: notion.material_notes ? xss(notion.material_notes) : null,
    approved_by_admin: notion.approved_by_admin,
    created_at: notion.created_at,
    updated_at: certification.updated_at
})

const serializeProdOnlyGet = product => {
    return {
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
    }
}

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
    .post(requireAdmin, jsonParser, (req, res, next) => {
        const {
            english_name,
            category_class,
            feature_image
        } = req.body

        const newCategory = {
            english_name,
            category_class,
            feature_image
        }

        const requiredFields = {
            english_name
        }
    
        for (const [key, value] of Object.entries(requiredFields)) {
            if (value === undefined) {
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body.`}
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
                    .json(serializeCategories(category))
                    
            })
            .catch(next)
    })

categoriesRouter
    .route('/:category_id')
    .all((req, res, next) => {
        CategoriesService.getCategoryById(
            req.app.get('db'),
            req.params.category_id
        )
        .then(category => {
            if (!category) {
                return res.status(404).json({
                    error: { message: `Category does not exist.` }
                })
            }

            res.category = category
            next()
        })
        .catch(next)
    })
    .patch(requireAdmin, jsonParser, (req, res, next) => {
        const {
            english_name,
            category_class,
            feature_image
        } = req.body

        const categoryToUpdate = {
            english_name,
            category_class,
            feature_image
        }
    
        const numberOfValues = Object.values(categoryToUpdate).filter(Boolean).length
        if (numberOfValues === 0) {
            return res.status(400).json({
                error: { 
                    message: `Request body must include 'english_name', 'category_class', and/or 'feature_image'`
                }
            })
        }
        
        CategoriesService
            .updateCategory(
                req.app.get('db'),
                req.params.category_id,
                categoryToUpdate
            )
            .then(numRowsAffected => {
                res.status(204).end()
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
                    error: { message: `Category does not exist.` }
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
                try {
                    const prodPromises = []

                    const productCerts = await ProductsService.getProdCerts(
                        req.app.get('db'),
                        product.id
                    )

                    prodPromises.push(productCerts.map(serializeCertification))

                    const productColorsImages = await ProductsService.getColorsImages(
                        req.app.get('db'),
                        product.id
                    )

                    prodPromises.push(productColorsImages.map(serializeColorsImages))

                    const cmtFactories = await ProductsService.getFactoriesForProduct(
                        req.app.get('db'),
                        product.id
                    )

                    prodPromises.push(cmtFactories.map(serializeFactories))

                    const productNotions = await ProductsService.getNotionsForProduct(
                        req.app.get('db'),
                        product.id
                    )

                    prodPromises.push(productNotions.map(serializeNotions))

                    await Promise.all(prodPromises)

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

                    const productData = {
                        productObject: serializeProdOnlyGet(product),
                        prodCertArray: productCerts,
                        prodColorArray: makeColorArray(),
                        cmtFactArray: cmtFactories,
                        prodNotArray: productNotions
                    }
                    
                    const getNotCerts = productData.prodNotArray.map(async notion => {
                        try {

                            const notCerts = await NotionsService.getCertsForNot(
                                req.app.get('db'),
                                notion.id
                            )

                            return notCerts
                        } catch (e) {
                            console.log('catch getNotCerts error:', e)
                            next(e)
                        }
                    })

                    const awaitNotCerts = await Promise.all(getNotCerts)

                    const unnestNotCerts = () => {
                        const unnestedNotCerts = []

                        awaitNotCerts.forEach(array => {
                            array.forEach(object => {
                                unnestedNotCerts.push(object)
                            })
                        })

                        return unnestedNotCerts
                    }

                    const newProductData = {
                        ...productData,
                        notCertArray: unnestNotCerts()
                    }

                    return newProductData
                } catch (e) {
                    console.log('catch GET /api/categories/:category_id/products', e)
                    next(e)
                }

            })

            await Promise.all(newProductArray)

            res.json(await Promise.all(newProductArray))
        }
        
        makeNewProductArray(productArray)
    })

module.exports = categoriesRouter