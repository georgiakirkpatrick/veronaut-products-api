const path = require('path')
const express = require('express')
const xss = require('xss')
const ProductsService = require('./products-service')
const productsRouter = express.Router()
const jsonParser = express.json()

const serializeProductGet = product => ({
    id: product.id,
    english_name: xss(product.english_name),
    brand_id: product.brand_id,
    brand_name: xss(product.brand_name),
    category_id: product.category_id,
    product_url: xss(product.product_url),
    feature_image_url: xss(product.feature_image_url),
    multiple_color_options: product.multiple_color_options,
    home_currency: product.home_currency,
    cost_in_home_currency: product.cost_in_home_currency,
    wash_id: product.wash_id,
    dry_id: product.dry_id,
    cmt_country: product.cmt_country,
    cmt_factory_notes: xss(product.cmt_factory_notes),
    approved_by_admin: product.approved_by_admin,
    date_published: product.date_published
})

const serializeProductPost = product => ({
    id: product.id,
    english_name: xss(product.english_name),
    brand_id: product.brand_id,
    category_id: product.category_id,
    product_url: xss(product.product_url),
    feature_image_url: xss(product.feature_image_url),
    multiple_color_options: product.multiple_color_options,
    home_currency: product.home_currency,
    cost_in_home_currency: product.cost_in_home_currency,
    wash_id: product.wash_id,
    dry_id: product.dry_id,
    cmt_country: product.cmt_country,
    cmt_factory_notes: xss(product.cmt_factory_notes),
    approved_by_admin: product.approved_by_admin,
    date_published: product.date_published
})

const serializeCertification = certification => ({
    id: certification.id,
    english_name: xss(certification.english_name),
    website: xss(certification.website)
})

const serializeFabric = fabric => ({
    id: fabric.id,
    fabric_type: fabric.fabric_type,
    fabric_mill_country: fabric.fabric_mill_country,
    fabric_mill_notes: xss(fabric.fabric_mill_notes),
    dye_print_finish_country: fabric.dye_print_finish_country,
    dye_print_finish_notes: xss(fabric.dye_print_finish_notes)
})

const serializeFactories = factory => ({
    id: factory.id,
    fabric_type: factory.fabric_type,
    country: factory.country,
    website: factory.website,
    notes: xss(factory.notes),
    stage: factory.stage
})

const serializeFibers = fibers => ({
    id: fibers.id,
    fiber_type_id: fibers.fiber_type_id,
    fiber_type: fibers.fiber_type,
    class: fibers.class,
    producer_country: fibers.producer_country,
    producer_id: fibers.producer_id,
    producer: fibers.producer,
    producer_country: fibers.producer_country,
    producer_website: fibers.producer_website,
    factory_notes: xss(fibers.factory_notes),
    producer_notes: xss(fibers.producer_notes)
})

const serializeImages = image => ({
    id: image.id,
    product_id: image.product_id,
    product_image_url: xss(image.product_image_url),
    swatch_image_url: xss(image.swatch_image_url),
    color_english_name: xss(image.color_english_name),
    color_description_id: image.color_description_id,
    primary_image_for_color: image.primary_image_for_color
})

const serializeNotions = notion => ({
    id: notion.id,
    notion_type_id: notion.notion_type_id,
    notion_type: notion.notion_type,
    notion_factory_country: notion.notion_factory_country,
    notion_factory_id: notion.notion_factory_id,
    factory: notion.factory,
    notion_factory_notes: xss(notion.notion_factory_notes),
    material_id: notion.material_id,
    fiber_or_material_type_id: notion.fiber_or_material_type_id,
    material: notion.material,
    class: notion.class,
    producer_country: notion.notion_country,
    material_producer: notion.material_producer
})

const serializeSizes = size => ({
    id: size.id,
    size_type_id: size.size_type_id,
    size_type: size.size_type,
    size_class_id: size.size_class_id,
    size_class: size.size_class,
    us_size: size.us_size
})

productsRouter
    .route('/')
    .get((req, res, next) => {
        ProductsService
            .getAllProducts(req.app.get('db'))
            .then(products => {
                res.json(products.map(serializeProductGet))
        })
        .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
        const {
            english_name,
            brand_id,
            category_id,
            product_url,
            feature_image_url,
            multiple_color_options,
            cost_in_home_currency,
            wash_id,
            dry_id,
            cmt_country,
            cmt_factory_notes,
            approved_by_admin
        } = req.body

        const newProduct = {
            english_name,
            brand_id,
            category_id,
            product_url,
            feature_image_url,
            multiple_color_options,
            cost_in_home_currency,
            wash_id,
            dry_id,
            cmt_country,
            cmt_factory_notes,
            approved_by_admin,
        }

        for (const [key, value] of Object.entries(newProduct)) {
            if (value === undefined) {
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body`}
                })
            }
        }

        // insert into 'products'
        ProductsService.insertProduct(
            req.app.get('db'),
            newProduct
        )
        .then(product => {
            res
                .status(201)
                .location(path.posix.join(req.originalUrl, `/${product.id}`))
                .json(serializeProductPost(product))
        })
        .catch(next)
    })

productsRouter
    .route('/:product_id')
    .all((req, res, next) => {
        ProductsService.getProductById(
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
            brand_name: xss(res.product.brand_name),
            home_currency: res.product.home_currency,
            category_id: res.product.category_id,
            product_url: xss(res.product.product_url),
            feature_image_url: xss(res.product.feature_image_url),
            multiple_color_options: res.product.multiple_color_options,
            cost_in_home_currency: res.product.cost_in_home_currency,
            wash_id: res.product.wash_id,
            dry_id: res.product.dry_id,
            cmt_country: res.product.cmt_country,
            cmt_factory_notes: xss(res.product.cmt_factory_notes),
            approved_by_admin: res.product.approved_by_admin,
            date_published: res.product.date_published
        })
    })
    .patch(jsonParser, (req, res, next) => {
        const {
            english_name,
            brand_id,
            category_id,
            product_url,
            feature_image_url,
            multiple_color_options,
            cost_in_home_currency,
            wash_id,
            dry_id,
            cmt_country,
            cmt_factory_notes,
            approved_by_admin
        } = req.body

        const productToUpdate = {
            english_name,
            brand_id,
            category_id,
            product_url,
            feature_image_url,
            multiple_color_options,
            cost_in_home_currency,
            wash_id,
            dry_id,
            cmt_country,
            cmt_factory_notes,
            approved_by_admin
        }

        const numberOfValues = Object.values(productToUpdate).filter(Boolean).length
        if (numberOfValues === 0) {
            return res.status(400).json({
                error: { 
                    message: `Request body must contain 'english_name', 'brand_id', 'category_id', 'product_url', 'feature_image_url', 'multiple_color_options', 'cost_in_home_currency', 'wash_id', 'dry_id', 'cmt_country', 'cmt_factory_notes', or 'approved_by_admin'`
                }
            })
        }
        
        ProductsService
            .updateProduct(
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
        ProductsService.deleteProduct(
            req.app.get('db'),
            req.params.product_id
        )
        .then(() => {
            res.status(204).end()
        })
        .catch(next)
    })

productsRouter
    .route('/:product_id/certifications')
    .all((req, res, next) => {
        ProductsService.getProductById(
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
        const productId = res.product.id
        ProductsService
            .getCertificationsForProduct(
                req.app.get('db'), 
                productId
            ) 
            .then(certifications => {
                res.json(certifications.map(serializeCertification))
        })
        .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
        const {product_id, certification_id} = req.body
        const newProductCertification = {product_id, certification_id}
        
        for (const [key, value] of Object.entries(newProductCertification)) {
            if (value === null) {
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body`}
                })
            }
        }

        ProductsService
            .insertProductCertification(
                req.app.get('db'),
                newProductCertification
            )
            .then(response => {
                res
                    .status(201)
                    .json(response)
            })
            .catch(next)
    })

productsRouter
    .route('/:product_id/fabrics')
    .all((req, res, next) => {
        ProductsService.getProductById(
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
        const productId = res.product.id
        ProductsService
            .getFabricsForProduct(
                req.app.get('db'), 
                productId
            ) 
            .then(fabrics => {
                res.json(fabrics.map(serializeFabric))
            })
            .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
        const {product_id, fabric_id} = req.body
        const newProductFabric = {product_id, fabric_id}
        
        for (const [key, value] of Object.entries(newProductFabric)) {
            if (value === null) {
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body`}
                })
            }
        }

        ProductsService
            .insertProductFabric(
                req.app.get('db'),
                newProductFabric
            )
            .then(response => {
                res
                    .status(201)
                    .json(response)
            })
            .catch(next)
    })
    
productsRouter
    .route('/:product_id/factories')
    .all((req, res, next) => {
        ProductsService.getProductById(
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
        const productId = res.product.id
        ProductsService
            .getFactoriesForProduct(
                req.app.get('db'),
                productId
            )
            .then(factories => {
                res.json(factories.map(serializeFactories))
            })
            .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
        const { product_id, factory_id, stage } = req.body
        const newProductFactory = { product_id, factory_id, stage }

        for (const [ key, value ] of Object.entries(newProductFactory)) {
            if (value === null) {
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body`}
                })
            }
        }

        ProductsService
            .insertProductFactory(
                req.app.get('db'),
                newProductFactory
            )
            .then(response => {
                res
                    .status(201)
                    .json(response)
            })
            .catch(next)
    })

productsRouter
    .route('/:product_id/fibers')
    .all((req, res, next) => {
        ProductsService.getProductById(
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
        const productId = res.product.id
        ProductsService
            .getFibersForProduct(
                req.app.get('db'),
                productId
            )
            .then(fibers => {
                res.json(fibers.map(serializeFibers))
            })
            .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
        const { product_id, fiber_or_material_id } = req.body
        const newProductFiber = { product_id, fiber_or_material_id }

        for (const [ key, value ] of Object.entries(newProductFiber)) {
            if (value === null) {
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body`}
                })
            }
        }

        ProductsService
            .insertProductFiber(
                req.app.get('db'),
                newProductFiber
            )
            .then(response => {
                res
                    .status(201)
                    .json(response)
            })
            .catch(next)
    })

productsRouter
    .route('/:product_id/images')
    .all((req, res, next) => {
        ProductsService.getProductById(
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
        const productId = res.product.id
        ProductsService
            .getImagesForProduct(
                req.app.get('db'),
                productId
            )
            .then(images => {
                res.json(images.map(serializeImages))
        })
        .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
        const {
            product_id,
            product_image_url,
            swatch_image_url,
            color_english_name,
            color_description_id,
            primary_image_for_color
        } = req.body

        const newImage = {
            product_id,
            product_image_url,
            swatch_image_url,
            color_english_name,
            color_description_id,
            primary_image_for_color
        }

        for (const [key, value] of Object.entries(newImage)) {
            if (value === null) {
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body`}
                })
            }
        }
        ProductsService.insertProduct(
            req.app.get('db'),
            newImage
        )
        .then(image => {
            res
                .status(201)
                .location(path.posix.join(req.originalUrl, `/${image.id}`))
                .json(serializeImages(image))
        })
        .catch(next)
    })

productsRouter
    .route('/:product_id/notions')
    .all((req, res, next) => {
        ProductsService.getProductById(
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
        const productId = product.id
        ProductsService
            .getNotionsForProduct(
                req.app.get('db'),
                productId
            )
            .then(notions => {
                res.json(notions.map(serializeNotions))
            })
            .catch(next)
        })
    .post(jsonParser, (req, res, next) => {
        const { notion_id, product_id } = req.body

        const newPair = { notion_id, product_id}
        ProductsService
            .insertProductNotion(
                req.app.get('db'),
                newPair
            )
            .then(response => {
                res
                    .status(201)
                    .json(response)
            })
            .catch(next)
    })


productsRouter
    .route('/:product_id/sizes')
    .all((req, res, next) => {
        ProductsService.getProductById(
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
        const productId = product.id
        ProductsService
            .getSizesForProduct(
                req.app.get('db'), 
                productId
            )
            .then(sizes => {
                res.json(sizes.map(serializeSizes))
            })
            .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
        const { size_id, product_id } = req.body
        const newPair = { size_id, product_id }

        ProductsService
            .insertProductSizes(
                req.app.get('db'),
                newPair
            )
            .then(response => {
                res
                    .status(201)
                    .json(response)
            })
            .catch(next)
    })


module.exports = productsRouter