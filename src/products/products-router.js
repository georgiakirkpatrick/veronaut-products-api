const path = require('path')
const express = require('express')
const xss = require('xss').escapeHtml
const ProductsService = require('./products-service')
const FabricsService = require('../fabrics/fabrics-service')
const FibersService = require('../fibers/fibers-service')
const NotionsService = require('../notions/notions-service')
const productsRouter = express.Router()
const jsonParser = express.json()

const serializeProductGet = product => {
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
            res
                .status(201)
                .location(path.posix.join(req.originalUrl, `/${product.id}`))
                .json(serializeProductPost(product))
        })
        .catch(next)
    })

productsRouter
    .route('/product-form')
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
            color_fieldsets,
            sew_fact,
            cut_fact,
            man_cert_checks,
            cmt_notes,
            selected_sizes,
            fabrics,
            notions
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
        const notionsArray = notions

        const isObject = variable => (
            Object.prototype.toString.call(variable) === '[object Object]'
        )
        
        const formEntries = [
            newProduct, 
            colorFieldsets, 
            sewFact, 
            cutFact, 
            manCertArray, 
            sizeArray, 
            fabricArray, 
            notionsArray
        ]

        formEntries.forEach(entry => {
            if (entry === undefined) {
                return res.status(400).json({
                    error: { message: `Missing '${entry}' in request body`}
                })
            }

            if (isObject(entry)) {
                for (const [key, value] of Object.entries(entry)) {
                    if (value === undefined) {
                        return res.status(400).json({
                            error: { message: `Missing '${key}' in request body`}
                        })
                    }
                }
            }
        })

        req.app.get('db').transaction(async function (trx) {
            try {
                // INSERT PRODUCT
                    const product = await ProductsService.insertProduct(
                        req.app.get('db'),
                        newProduct
                    )

                const promises = []

                // INSERT COLORS AND IMAGES
                if (colorFieldsets.length > 0) {
                    for (const colorFieldset of colorFieldsets) {
                        for (let i=0; i<colorFieldset.imageUrls.length; ++i) {
                            const imageDetails = {
                                'product_id': product.id,
                                'product_image_url': colorFieldset.imageUrls[i],
                                'color_description_id': colorFieldset.descriptionId,
                                'primary_image_for_color': (i === 0)
                            }

                            const imgPromise = ProductsService.insertImages(
                                req.app.get('db'),
                                imageDetails
                            )

                            promises.push(imgPromise)
                        }
                        
                        const colorDetails = {
                            'product_id': product.id,
                            'color_description_id': colorFieldset.descriptionId,
                            'color_english_name': colorFieldset.name,
                            'swatch_image_url': colorFieldset.swatchUrl
                        }

                        const colorPromise = ProductsService.insertProductColor(
                            req.app.get('db'),
                            colorDetails
                        )
                        
                        promises.push(colorPromise)
                    }
                }

                // LINK PRODUCT SEWING INFO
                const sewSet = {
                    "product_id": product.id, 
                    "factory_id": sewFact.factory, 
                    "stage": "sew"
                }

                const sewPromise = ProductsService.insertProductFactory(
                    req.app.get('db'),
                    sewSet
                )

                promises.push(sewPromise)
                
                // LINK PRODUCT CUTTING INFO
                const cutSet = {
                    "product_id": product.id, 
                    "factory_id": cutFact.factory, 
                    "stage": "cut"
                }

                const cutPromise = ProductsService.insertProductFactory(
                    req.app.get('db'),
                    cutSet
                )

                promises.push(cutPromise)

                // LINK MANUFACTURING CERTIFICATIONS and NOTES
                manCertArray.forEach(cert => {
                    const certPair = {
                        "product_id": product.id,
                        "certification_id": cert
                    }

                    const certPromise = ProductsService.insertProductCertification(
                        req.app.get('db'),
                        certPair
                    )

                    promises.push(certPromise)
                })

                // LINK PRODUCT SIZES
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

                // INSERT FABRICS
                fabricArray.forEach(async fabric => {
                    const fabricDetails = {
                        "brand_id": product.brand_id,
                        "fabric_mill_country": fabric.fabric_details.wovKnitLocation,
                        "fabric_mill_id": fabric.fabric_details.wovKnitId,
                        "fabric_mill_notes": fabric.fabric_details.wovKnitNotes, 
                        "dye_print_finish_country": fabric.fabric_details.dyeFinLocation,
                        "dye_print_finish_id": fabric.fabric_details.dyeFinId,
                        "dye_print_finish_notes": fabric.fabric_details.dyeFinNotes
                    }

                    const fabricPromise = await FabricsService.insertFabric(
                        req.app.get('db'),
                        fabricDetails
                    )

                    promises.push(fabricPromise)
                    
                    // LINK PRODUCT AND FABRIC
                    const prodFabricSet = {
                        "product_id": product.id,
                        "fabric_id": fabricPromise.id,
                        "relationship": fabric.relationship
                    }

                    const prodFabPromise = ProductsService.insertProductFabric(
                        req.app.get('db'),
                        prodFabricSet
                    )

                    promises.push(prodFabPromise)
                    
                    // INSERT FABRIC CERTIFICATIONS
                    fabric.certs.forEach(cert => {
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

                    // INSERT FIBERS
                    fabric.fiber_array.forEach(async fiber => {
                        const fiberSet = {
                            "fiber_or_material_type_id": fiber.fiberTypeId,
                            "brand_id": product.brand_id,
                            "producer_country": fiber.originId,
                            "producer_id": fiber.producerId,
                            "production_notes": fiber.producerNotes
                        }

                        const fiberPromise = await FibersService.insertFiber(
                            req.app.get('db'),
                            fiberSet
                        )

                        promises.push(fiberPromise)

                        // LINK PRODUCT AND FIBER
                        const prodFiberPair = {
                            "product_id": product.id,
                            "fiber_or_material_id": fiberPromise.id
                        }

                        const prodFiberPromise = ProductsService.insertProductFiber(
                            req.app.get('db'),
                            prodFiberPair
                        )

                        promises.push(prodFiberPromise)
                    
                        // LINK FABRIC AND FIBER
                        const fabFibSet = {
                            "fabric_id": fabricPromise.id,
                            "fiber_or_material_id": fiberPromise.id,
                            "percent_of_fabric": fiber.percentage
                        }

                        const fabFibPromise = FabricsService.insertFabricFiber(
                            req.app.get('db'),
                            fabFibSet
                        )

                        promises.push(fabFibPromise)

                        // LINK FIBER AND CERTIFICATIONS
                        fiber.certIds.forEach(certId => {
                            const fibCertPair = {
                                "fiber_or_material_id": fiberPromise.id,
                                "certification_id": certId
                            }

                            const fibCertPromise = FibersService.insertFiberCert(
                                req.app.get('db'),
                                fibCertPair
                            )

                            promises.push(fibCertPromise)
                        })
                    })
                })

                // INSERT NOTIONS
                notionsArray.forEach(async notion => {
                    const notionDetails = {
                        "notion_type_id": notion.typeId,
                        "brand_id": product.brand_id,
                        "manufacturer_country": notion.locationId,
                        "manufacturer_id": notion.factoryId,
                        "manufacturer_notes": notion.notes,
                        "material_type_id": notion.materialTypeId,
                        "material_origin_id": notion.materialOriginId,
                        "material_producer_id": notion.materialProducerId
                    }

                    const notionPromise = await NotionsService.insertNotion(
                        req.app.get('db'),
                        notionDetails
                    )

                    promises.push(notionPromise)

                    // LINK PRODUCT AND NOTION
                    const prodNotPair = {
                        "product_id": product.id,
                        "notion_id": notionPromise.id
                    }

                    const prodNotPromise = ProductsService.insertProductNotion(
                        req.app.get('db'),
                        prodNotPair
                    )

                    promises.push(prodNotPromise)

                    // LINK NOTION AND CERTIFICATIONS
                    notion.certIds.forEach(cert => {
                        const notCertPair = {
                            notion_id: notionPromise.id,
                            certification_id: cert
                        }

                        const notCertPromise = NotionsService.insertNotCert(
                            req.app.get('db'),
                            notCertPair
                        )

                        promises.push(notCertPromise)
                    })
                })
                await Promise.all(promises)

                trx.commit()

                return res.json(product)
            } catch (e) {
                trx.rollback()
                next(e)
            }
        })
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