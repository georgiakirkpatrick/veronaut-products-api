const path = require('path')
const express = require('express')
const xss = require('xss').escapeHtml
const ProductsService = require('./products-service')
const FabricsService = require('../fabrics/fabrics-service')
const BrandsService = require('../brands/brands-service')
const productsRouter = express.Router()
const jsonParser = express.json()

const serializeProductGet = product => {
    console.log('serializeProductGet ran and product is ', product)

    return {
        id: product.id,
        english_name: xss(product.english_name),
        brand_id: product.brand_id,
        brand_name: product.brand_name,
        category_id: product.category_id,
        product_url: xss(product.product_url),
        feature_image_url: xss(product.feature_image_url),
        multiple_color_options: product.multiple_color_options,
        cost_in_home_currency: product.cost_in_home_currency,
        wash_id: product.wash_id,
        dry_id: product.dry_id,
        cmt_notes: xss(product.cmt_notes),
        approved_by_admin: product.approved_by_admin,
        date_published: product.date_published
    }
}

const serializeProductPost = product => {
    console.log('serializeProductPost ran and product is ', product)

    return {
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
        cmt_notes: xss(product.cmt_notes),
        approved_by_admin: product.approved_by_admin,
        date_published: product.date_published
    }
}

const serializeCertification = certification => ({
    id: certification.id,
    english_name: xss(certification.english_name),
    website: xss(certification.website),
    approved_by_admin: certification.approved_by_admin,
    date_published: certification.date_published
})

const serializeColors = color => ({
    color_id: color.id,
    product_id: color.product_id,
    color_description_id: color.color_description_id,
    color_english_name: xss(color.color_english_name),
    swatch_image_url: xss(color.swatch_image_url)
})

const serializeFabric = fabric => ({
    id: fabric.id,
    fabric_mill_country: fabric.fabric_mill_country,
    fabric_mill_notes: xss(fabric.fabric_mill_notes),
    dye_print_finish_country: fabric.dye_print_finish_country,
    dye_print_finish_notes: xss(fabric.dye_print_finish_notes)
})

const serializeFactories = factory => ({
    id: factory.id,
    english_name: xss(factory.english_name),
    country: factory.country,
    website: xss(factory.website),
    notes: xss(factory.notes),
    stage: factory.stage,
    approved_by_admin: factory.approved_by_admin,
    date_published: factory.date_published
})

const serializeFibers = fiber => ({
    id: fiber.id,
    fiber_type_id: fiber.fiber_type_id,
    fiber_type: xss(fiber.fiber_type),
    class: fiber.class,
    brand_id: fiber.brand_id,
    producer_country: fiber.producer_country,
    producer_id: fiber.producer_id,
    producer: xss(fiber.producer),
    producer_country: fiber.producer_country,
    producer_website: xss(fiber.producer_website),
    factory_notes: xss(fiber.factory_notes),
    producer_notes: xss(fiber.producer_notes),
    approved_by_admin: fiber.approved_by_admin,
    date_published: fiber.date_published
})

const serializeImages = image => ({
    id: image.id,
    product_id: image.product_id,
    product_image_url: xss(image.product_image_url),
    color_description_id: image.color_description_id,
    primary_image_for_color: image.primary_image_for_color
})

const serializeNotions = notion => ({
    id: notion.id,
    notion_type_id: notion.notion_type_id,
    notion_type: xss(notion.notion_type),
    brand_id: notion.brand_id,
    notion_factory_country: notion.notion_factory_country,
    notion_factory_id: notion.notion_factory_id,
    factory: xss(notion.factory),
    notion_factory_notes: xss(notion.notion_factory_notes),
    material_id: notion.material_id,
    fiber_or_material_type_id: notion.fiber_or_material_type_id,
    material: xss(notion.material),
    class: notion.class,
    producer_country: notion.notion_country,
    material_producer: notion.material_producer
})

const serializeSizes = size => ({
    id: size.id,
    country_system: size.country_system,
    size_text: size.size_text,
    size_category: size.size_category,
    size_class: size.size_class,
    us_size: size.us_size
})

productsRouter
    .route('/')
    .get((req, res, next) => {
        ProductsService
            .getAllProducts(req.app.get('db'))
            .then(products => {
                console.log('getAllProducts ran and products is', products)
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
            dry_id
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
            dry_id
        }

        for (const [key, value] of Object.entries(newProduct)) {
            if (value === undefined) {
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
            console.log('product', product)

            res
                .status(201)
                .location(path.posix.join(req.originalUrl, `/${product.id}`))
                .json(serializeProductPost(product))
        })
        .catch(next)
    })

productsRouter
    .route('/product-form')
    .post(jsonParser, async (req, res, next) => {
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
            color_fieldsets,
            sew_fact,
            cut_fact,
            man_cert_checks,
            cmt_notes,
            selected_sizes,
            fabrics
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
            cmt_notes
        }

        const colorFieldsets = color_fieldsets
        const sewFact = sew_fact
        const cutFact = cut_fact
        const manCertArray = man_cert_checks
        const sizeArray = selected_sizes
        const fabricArray = fabrics

        console.log('newProduct', newProduct)
        console.log('colorFieldsets', colorFieldsets)
        console.log('sewFact', sewFact)
        console.log('cutFact', cutFact)

        for (const [key, value] of Object.entries(newProduct)) {
            if (value === undefined) {
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body`}
                })
            }
        }

        if (colorFieldsets === undefined) {
            return res.status(400).json({
                error: { message: `Missing 'color_fieldsets' in request body`}
            })
        }

        for (const [key, value] of Object.entries(colorFieldsets)) {
            if (value === undefined) {
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body`}
                })
            }
        }

        // INSERT PRODUCT
            const product = await ProductsService.insertProduct(
                req.app.get('db'),
                newProduct
            )

            console.log('product', product)
        // INSERT PRODUCT   

        const promises = []
        // INSERT COLORS AND IMAGES
        if (colorFieldsets.length > 0) {
            for (const colorFieldset of colorFieldsets) {
                for (let i=0; i<colorFieldset.imageUrls.length; ++i) {
                    const image = {
                        'product_id': product.id,
                        'product_image_url': colorFieldset.imageUrls[i],
                        'color_description_id': colorFieldset.description,
                        'primary_image_for_color': (i === 0)
                    }

                    const imgPromise = ProductsService.insertImages(
                        req.app.get('db'),
                        image
                    )

                    promises.push(imgPromise)
                }
                
                const newColor = {
                    'product_id': product.id,
                    'color_description_id': colorFieldset.description,
                    'color_english_name': colorFieldset.name,
                    'swatch_image_url': colorFieldset.swatchUrl
                }

                const colorPromise = ProductsService.insertProductColor(
                    req.app.get('db'),
                    newColor
                )
                
                promises.push(colorPromise)
            }
        }
        // INSERT COLORS AND IMAGES

        // INSERT PRODUCT MANUFACTURING INFO
        const newSewFact = {
            "product_id": product.id, 
            "factory_id": sewFact.factory, 
            "stage": "sew"
        }

        const sewFactPromise = ProductsService.insertProductFactory(
            req.app.get('db'),
            newSewFact
        )

        promises.push(sewFactPromise)

        const newCutFact = {
            "product_id": product.id, 
            "factory_id": cutFact.factory, 
            "stage": "cut"
        }

        const cutFactPromise = ProductsService.insertProductFactory(
            req.app.get('db'),
            newCutFact
        )

        promises.push(cutFactPromise)
        // INSERT PRODUCT MANUFACTURING INFO

        // INSERT MANUFACTURING CERTIFICATIONS and NOTES
        manCertArray.forEach(cert => {
            const manCertPair = {
                "product_id": product.id,
                "certification_id": cert
            }

            const manCertPromise = ProductsService.insertProductCertification(
                req.app.get('db'),
                manCertPair
            )

            promises.push(manCertPromise)
        })
        // INSERT MANUFACTURING CERTIFICATIONS

        // INSERT PRODUCT SIZES
        sizeArray.forEach(size => {
            const sizePair = {
                "product_id": product.id,
                "size_id": size
            }

            const sizePromise = ProductsService.insertProductSizes(
                req.app.get('db'),
                sizePair
            )

            promises.push(sizePromise)
        })
        // INSERT PRODUCT SIZES

        // INSERT PRODUCT FABRICS
        sizeArray.forEach(size => {
            const sizePair = {
                "product_id": product.id,
                "size_id": size
            }

            const sizePromise = ProductsService.insertProductSizes(
                req.app.get('db'),
                sizePair
            )

            promises.push(sizePromise)
        })
        // INSERT PRODUCT SIZES

        // INSERT FABRICS
        fabricArray.forEach(fabric => {
            const fabricDetails = {
                "fabric_mill_country": fabric.wovKnitLocation,
                "fabric_mill_id": fabric.wovKnitId,
                "fabric_mill_notes": fabric.wovKnitNotes, 
                "dye_print_finish_country": fabric.dyeFinLocation,
                "dye_print_finish_id": fabric.dyeFinId,
                "dye_print_finish_notes": fabric.dyeFinNotes
            }

            const fabricPromise = FabricsService.insertFabric(
                req.app.get('db'),
                fabricDetails
            )

            promises.push(fabricPromise)

            const prodFabSet = {
                "product_id": product.id,
                "fabric_id": fabricPromise.id,
                "relationship": fabric.relationship
            }

            const prodFabPromise = ProductsService.insertProductFabric(
                req.app.get('db'),
                prodFabSet
            )

            promises.push(prodFabPromise)

            const certArray = []

            for (const [key, value] of Object.entries(fabric.certs)) {
                if (value) {
                    certArray.push(key)
                }
            }

            certArray.forEach(cert => {
                const certPair = {
                    fabric_id: fabricPromise.id,
                    certification_id: cert
                }

                const certPromise = FabricsService.insertFabricCertification(
                    req.app.get('db'),
                    certPair
                )

                promises.push(certPromise)
            })

            fabric.fiber_array.forEach(fiber => {

                // fiberTypeId: 0,
                // percentage: '',
                // originId: 0,
                // producerId: 0,
                // certIds: []

                const fibSet = {
                    "fiber_or_material_type_id": fiber.fiberTypeId,
                    "brand_id": product.brand_id,
                    "producer_country": fiber.originId,
                    "producer_id": fiber.producerId,
                    "producer_notes": fiber.producerNotes
                }    

                const fibPromise = BrandsService.insertFiber(
                    req.app.get('db'),
                    fibSet
                )

                promises.push(fibPromise)

                const prodFibPair = {
                    "product_id": product.id,
                    "fiber_or_material_id": fibPromise.id
                }

                const prodFibPromise = ProductsService.insertProductFiber(
                    req.app.get('db'),
                    prodFibPair
                )
            

                const fabFibSet = {
                    "fabric_id": fabricPromise.id,
                    "fiber_or_material_id": fibPromise.id,
                    "percent_of_fabric": fiber.percentage
                }

                const fabFibPromise = FabricsService.insertFabricFiber(
                    req.app.get('db'),
                    fabFibSet
                )

                promises.push(fabFibPromise)

                fiber.certIds.forEach(certId => {
                    const fibCertPair = {
                        "fiber_or_material_id": fibPromise.id,
                        "certification_id": certId
                    }

                    // const fibCertPromise = 
                })
                
            })
        })
        // INSERT FABRICS


        await Promise.all(promises)
    })

productsRouter
    .route('/:product_id')
    .all((req, res, next) => {
        console.log('req.params.product_id', req.params.product_id)

        ProductsService.getProductById(
            req.app.get('db'),
            req.params.product_id
        )
        .then(product => {
            console.log('product', product)
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
            brand_name: res.product.brand_name,
            category_id: res.product.category_id,
            product_url: xss(res.product.product_url),
            feature_image_url: xss(res.product.feature_image_url),
            multiple_color_options: res.product.multiple_color_options,
            cost_in_home_currency: res.product.cost_in_home_currency,
            wash_id: res.product.wash_id,
            dry_id: res.product.dry_id,
            cmt_notes: xss(res.product.cmt_notes),
            approved_by_admin: res.product.approved_by_admin,
            date_published: res.product.date_published
        })
        .catch(next)
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
            cmt_notes,
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
            cmt_notes,
            approved_by_admin
        }

        const numberOfValues = Object.values(productToUpdate).filter(Boolean).length
        if (numberOfValues === 0) {
            return res.status(400).json({
                error: { 
                    message: `Request body must contain 'english_name', 'brand_id', 'category_id', 'product_url', 'feature_image_url', 'multiple_color_options', 'cost_in_home_currency', 'wash_id', 'dry_id', 'cmt_notes', or 'approved_by_admin'`
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
            if (value === undefined) {
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
    .route('/:product_id/colors')
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
            .getColorsForProduct(
                req.app.get('db'),
                productId
            ) 
            .then(colors => {
                console.log("colors", colors)
                res.json(colors.map(serializeColors))
            })
        .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
        const {
            color_description_id,
            color_english_name,
            swatch_image_url
        } = req.body

        const newProductColor = {
            product_id: req.params.product_id,
            color_description_id,
            color_english_name,
            swatch_image_url
        }
    
        for (const [key, value] of Object.entries(newProductColor)) {
            if (value === undefined) {
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body`}
                })
            }
        }
    
        ProductsService.insertProductColor(
            req.app.get('db'),
            newProductColor
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
        const {product_id, fabric_id, relationship} = req.body
        const newProductFabric = {product_id, fabric_id, relationship}
        
        for (const [key, value] of Object.entries(newProductFabric)) {
            if (value === undefined) {
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
            if (value === undefined) {
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
            if (value === undefined) {
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
            product_image_url,
            color_description_id,          
            primary_image_for_color
        } = req.body

        // CHANGE THIS SO ALL I NEED IS THE COLOR ID NOT NAME, DESC, PRIM IMAGE.

        const newImage = {
            product_id: req.params.product_id,
            product_image_url,
            color_description_id,
            primary_image_for_color
        }

        for (const [key, value] of Object.entries(newImage)) {
            if (value === undefined) {
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body`}
                })
            }
        }

        ProductsService.insertImages(
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
        const productId = res.product.id
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

        for (const [key, value] of Object.entries(newPair)) {
            if (value === undefined) {
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body`}
                })
            }
        }

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
            console.log('product', product)
            res.product = product
            next()
        })
        .catch(next)
    })
    .get((req, res, next) => {
        const productId = res.product.id
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

        for (const [key, value] of Object.entries(newPair)) {
            if (value === undefined) {
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body`}
                })
            }
        }

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