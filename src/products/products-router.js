const { requireAuth, requireAdmin } = require('../middleware/jwt-auth')
const express = require('express')
const FabricsService = require('../fabrics/fabrics-service')
const FibersService = require('../fibers/fibers-service')
const jsonParser = express.json()
const NotionsService = require('../notions/notions-service')
const path = require('path')
const productsRouter = express.Router()
const ProductsService = require('./products-service')
const xss = require('xss').escapeHtml

const serializeProductGet = product => {
    return {
        id: product.id,
        english_name: xss(product.english_name),
        brand_currency: product.brand_currency,
        brand_id: product.brand_id,
        brand_name: xss(product.brand_name),
        category_id: product.category_id,
        product_url: xss(product.product_url),
        feature_image_url: xss(product.feature_image_url),
        multiple_color_options: product.multiple_color_options,
        cost_in_home_currency: product.cost_in_home_currency,
        wash_id: product.wash_id,
        dry_id: product.dry_id,
        cmt_sew_country: product.cmt_sew_country,
        cmt_cut_country: product.cmt_cut_country,
        cmt_notes: product.cmt_notes ? xss(product.cmt_notes) : '',
        featured: product.featured,
        approved_by_admin: product.approved_by_admin,
        created_at: product.created_at,
        updated_at: product.updated_at
    }
}

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
        cmt_sew_country: product.cmt_sew_country,
        cmt_cut_country: product.cmt_cut_country,
        cmt_notes: product.cmt_notes ? xss(product.cmt_notes) : '',
        featured: product.featured,
        approved_by_admin: product.approved_by_admin,
        created_at: product.created_at,
        updated_at: product.updated_at
    })

const serializeCert = certification => ({
    id: certification.id,
    english_name: xss(certification.english_name),
    website: xss(certification.website),
    approved_by_admin: certification.approved_by_admin,
    created_at: certification.created_at,
    updated_at: certification.updated_at
})

const serializePCPair = certification => ({
    certification_id: certification.certification_id,
    english_name: xss(certification.english_name),
    website: xss(certification.website),
    cert_approved_by_admin: certification.cert_approved_by_admin,
    pair_approved_by_admin: certification.pair_approved_by_admin,
    pair_created_at: certification.pair_created_at,
    pair_updated_at: certification.pair_updated_at
})

const serializeColors = color => ({
    id: color.id,
    product_id: color.product_id,
    color_description_id: color.color_description_id,
    color_english_name: xss(color.color_english_name),
    swatch_image_url: xss(color.swatch_image_url),
    approved_by_admin: color.approved_by_admin,
    created_at: color.created_at,
    updated_at: color.updated_at
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
    fact_approved_by_admin: factory.fact_approved_by_admin,
    pair_approved_by_admin: factory.pair_approved_by_admin,
    pair_created_at: factory.pair_created_at,
    pair_updated_at: factory.pair_updated_at
})

const serializeFibers = fiber => ({
    id: fiber.id,
    fiber_or_material_type_id: fiber.fiber_or_material_type_id,
    fiber_type: xss(fiber.fiber_type),
    class: fiber.class,
    brand_id: fiber.brand_id,
    producer_country: fiber.producer_country,
    producer_id: fiber.producer_id,
    production_notes: fiber.production_notes ? xss(fiber.production_notes) : null,
    producer: xss(fiber.producer),
    producer_country: fiber.producer_country,
    producer_website: fiber.producer_website ? xss(fiber.producer_website) : null,
    fib_approved_by_admin: fiber.fib_approved_by_admin,
    pair_approved_by_admin: fiber.pair_approved_by_admin,
    pair_created_at: fiber.pair_created_at,
    pair_updated_at: fiber.pair_updated_at
})

const serializeImages = image => ({
    id: image.id,
    product_id: image.product_id,
    product_image_url: xss(image.product_image_url),
    color_id: image.color_id,
    primary_image_for_color: image.primary_image_for_color,
    approved_by_admin: image.approved_by_admin,
    created_at: image.created_at,
    updated_at: image.updated_at
})

const serializeNotions = notion => ({
    id: notion.id,
    notion_type_id: notion.notion_type_id,
    notion_type: notion.notion_type ? xss(notion.notion_type) : null,
    brand_id: notion.brand_id,
    manufacturer_country: notion.manufacturer_country,
    manufacturer_id: notion.manufacturer_id,
    manufacturer_notes: notion.manufacturer_notes ? xss(notion.manufacturer_notes) : null,
    material_type_id: notion.material_type_id,
    material_type: notion.material_type ? xss(notion.material_type) : null,
    material_origin_id: notion.material_origin_id,
    material_producer_id: notion.material_producer_id,
    material_notes: notion.material_notes ? xss(notion.material_notes) : null,
    notion_approved_by_admin: notion.notion_approved_by_admin,
    pair_approved_by_admin: notion.pair_approved_by_admin,
    pair_created_at: notion.pair_created_at,
    pair_updated_at: notion.pair_updated_at
})

// const serializeSizes = size => ({
//     id: size.id,
//     country_system: size.country_system,
//     size_text: size.size_text,
//     size_category: size.size_category,
//     size_class: size.size_class,
//     us_size: size.us_size
// })

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
    .post(requireAuth, jsonParser, (req, res, next) => {
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
            cmt_sew_country,
            cmt_cut_country,
            cmt_notes,
            featured,
            approved_by_admin,
            created_at,
            updated_at
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
            cmt_sew_country,
            cmt_cut_country,
            cmt_notes,
            featured,
            approved_by_admin,
            created_at,
            updated_at
        }

        const requiredFields = { 
            english_name,
            brand_id,
            category_id,
            product_url,
            feature_image_url,
            cost_in_home_currency,
            wash_id,
            dry_id
        }

        for (const [key, value] of Object.entries(requiredFields)) {
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
    .route('/featured')
    .get((req, res, next) => {
        ProductsService
            .getFeaturedProducts(req.app.get('db'))
            .then(products => {
                res.json(products.map(serializeProductGet))
            })
            .catch(next)
    })

productsRouter
    .route('/product-form')
    .post(requireAuth, jsonParser, (req, res, next) => {
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
            cmt_sew_country,
            cmt_cut_country,
            cmt_notes,
            featured,
            selected_sizes,
            fabrics,
            notions,
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
            cmt_sew_country,
            cmt_cut_country,
            cmt_notes,
            featured,
            approved_by_admin
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
                const requiredFields = {
                    english_name,
                    brand_id,
                    category_id,
                    product_url,
                    feature_image_url,
                    multiple_color_options,
                    cost_in_home_currency,
                    wash_id,
                    dry_id,
                    cmt_sew_country,
                    cmt_cut_country,
                    cmt_notes
                }

                for (const [key, value] of Object.entries(requiredFields)) {
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
                        const colorDetails = {
                            'product_id': product.id,
                            'color_description_id': colorFieldset.descriptionId,
                            'color_english_name': colorFieldset.name,
                            'swatch_image_url': colorFieldset.swatchUrl
                        }

                        const colorPromise = await ProductsService.insertProductColor(
                            req.app.get('db'),
                            colorDetails
                        )
                        
                        promises.push(colorPromise)
    
                        for (let i=0; i<colorFieldset.imageUrls.length; ++i) {
                            const imageDetails = {
                                'product_id': product.id,
                                'product_image_url': colorFieldset.imageUrls[i],
                                'color_id': colorPromise.id,
                                'primary_image_for_color': (i === 0)
                            }

                            try {
                                const imgPromise = ProductsService.insertImages(
                                    req.app.get('db'),
                                    imageDetails
                                )
    
                                promises.push(imgPromise)
                            } catch (e) {
                                console.log('catch req.app.get("db").transaction error:', e)
                                trx.rollback()
                                next(e)
                            }
                        }
                    }
                }

                // LINK PRODUCT SEWING INFO
                const sewSet = {
                    "product_id": product.id, 
                    "factory_id": sewFact.factoryId, 
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
                    "factory_id": cutFact.factoryId,
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

                    const certPromise = ProductsService.insertProdCert(
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
                for (let fabric of fabricArray) {
                    const fabricDetails = {
                        "brand_id": product.brand_id,
                        "fabric_mill_country": fabric.fabric_details.wovKnitCountryId,
                        "fabric_mill_id": fabric.fabric_details.wovKnitId,
                        "fabric_mill_notes": fabric.fabric_details.wovKnitNotes, 
                        "dye_print_finish_country": fabric.fabric_details.dyeFinCountryId,
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
                    for (let cert of fabric.certs) {
                        const certPair = {
                            "fabric_id": fabricPromise.id,
                            "certification_id": cert
                        }

                        const certPromise = FabricsService.insertFabricCertification(
                            req.app.get('db'),
                            certPair
                        )

                        promises.push(certPromise)
                    }

                    // INSERT FIBERS
                    for (let fiber of fabric.fiber_array) {
                        try {
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
                        } catch (e) {
                            console.log('catch let fiber of fabric.fiber_array', e)
                            next(e)
                        }    
                    }
                }

                notionsArray.forEach(async notion => {
                    const notionDetails = {
                        "notion_type_id": notion.typeId,
                        "brand_id": product.brand_id,
                        "manufacturer_country": notion.countryId,
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

                res
                    .status(201)
                    .location(`/api/products/${product.id}`)
                    .json(serializeProductPost(product))
            } catch (e) {
                console.log('catch req.app.get("db").transaction error:', e)
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
                    error: { message: `Product does not exist.` }
                })
            }
            res.product = product
            next()
        })
        .catch(next)
    })
    .get((req, res, next) => {
        const getProductData = async () => {
            try {
                const prodPromises = []

                const productCerts = await ProductsService.getProdCerts(
                    req.app.get('db'),
                    res.product.id
                )

                prodPromises.push(productCerts.map(serializeCert))

                const productColorsImages = await ProductsService.getColorsImages(
                    req.app.get('db'),
                    res.product.id
                )

                prodPromises.push(productColorsImages.map(serializeColorsImages))

                const cmtFactories = await ProductsService.getFactoriesForProduct(
                    req.app.get('db'),
                    res.product.id
                )

                prodPromises.push(cmtFactories.map(serializeFactories))

                const productNotions = await ProductsService.getNotionsForProduct(
                    req.app.get('db'),
                    res.product.id
                )

                prodPromises.push(productNotions.map(serializeNotions))

                await Promise.all(prodPromises)

                const productData = {
                    productObject: serializeProductGet(res.product),
                    prodCertArray: productCerts,
                    prodColorArray: productColorsImages,
                    cmtFactArray: cmtFactories,
                    prodNotArray: productNotions
                }

                return productData
            } catch (e) {
                console.log('catch GET /:product_id', e)
                next(e)
            }
        }

        getProductData()
            .then(async productData => {
                try {
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
                    console.log('catch getProductData().then() error:', e)
                    next(e)
                }
            })
            .then(newProductData => {
                res.json(newProductData)
            })
            .catch(next)
    })
    .patch(requireAdmin, jsonParser, (req, res, next) => {
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
            cmt_sew_country,
            cmt_cut_country,
            cmt_notes,
            featured,
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
            cmt_sew_country,
            cmt_cut_country,
            cmt_notes,
            featured,
            approved_by_admin
        }

        const numberOfValues = Object.values(productToUpdate).filter(Boolean).length
        if (numberOfValues === 0) {
            return res.status(400).json({
                error: {
                    message: `Request body must contain 'english_name', 'brand_id', 'category_id', 'product_url', 'feature_image_url', 'multiple_color_options', 'cost_in_home_currency', 'wash_id', 'dry_id', 'cmt_sew_country', 'cmt_cut_country', 'cmt_notes', 'featured', or 'approved_by_admin'`
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
    .delete(requireAdmin, (req, res, next) => {
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
                    error: { message: `Product does not exist.` }
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
            .getProdCerts(
                req.app.get('db'), 
                productId
            ) 
            .then(certifications => {
                res.json(certifications.map(serializePCPair))
        })
        .catch(next)
    })
    .post(requireAuth, jsonParser, (req, res, next) => {
        const productId = res.product.id

        const { 
            certification_id,
            approved_by_admin,
            created_at,
            updated_at
        } = req.body

        const newProdCert = { 
            product_id: productId,
            certification_id,
            approved_by_admin,
            created_at,
            updated_at
        }

        const requiredFields = {
            certification_id
        }
        
        if (requiredFields.certification_id === undefined) {
            return res.status(400).json({
                error: { message: `Missing 'certification_id' in request body`}
            })
        }

        ProductsService
            .insertProdCert(
                req.app.get('db'),
                newProdCert
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
                    error: { message: `Product does not exist.` }
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
    .post(requireAuth, jsonParser, (req, res, next) => {
        const productId = res.product.id

        const {
            id,
            color_description_id,
            color_english_name,
            swatch_image_url,
            approved_by_admin,
            created_at,
            updated_at
        } = req.body

        const newProductColor = {
            id,
            product_id: productId,
            color_description_id,
            color_english_name,
            swatch_image_url,
            approved_by_admin,
            created_at,
            updated_at
        }

        const requiredFields = {
            color_description_id,
            color_english_name
        }
    
        for (const [key, value] of Object.entries(requiredFields)) {
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
                .json(serializeColors(response))    
        })
        .catch(next)
    })

productsRouter
    .route('/:product_id/colors_images')
    .all((req, res, next) => {
        ProductsService.getProductById(
            req.app.get('db'),
            req.params.product_id
        )
        .then(product => {
            if (!product) {
                return res.status(404).json({
                    error: { message: `Product does not exist.` }
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
            .getColorsImages(
                req.app.get('db'),
                productId
            ) 
            .then(colors => {
                res.json(colors.map(serializeColors))
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
                    error: { message: `Product does not exist.` }
                })
            }
            res.product = product
            next()
        })
        .catch(next)
    })
    .get(async (req, res, next) => {
        try {
            const productId = res.product.id
            const productFabrics = await ProductsService.getFabricsForProduct(req.app.get('db'), productId)
            const newFabricArray = productFabrics.map(async fabric => {
                try {
                    const fabCerts = await FabricsService.getFabCerts(
                        req.app.get('db'),
                        fabric.id
                    )

                    const fabFibs = await FabricsService.getFabFibers(
                        req.app.get('db'),
                        fabric.id
                    )

                    const allFibCerts = fabFibs.map(async fiber => {
                        try {
                            const fibCerts = await FibersService.getFibCerts(
                                req.app.get('db'),
                                fiber.id
                            )

                            return fibCerts
                        } catch (e) {
                            console.log('catch allFibCerts error:', e)
                            next(e)
                        }
                    })

                    const fabFibsWithCerts = fabFibs.map(async fiber => {
                        try {
                            const fibCertArray = await Promise.all(allFibCerts)

                            const fibFilter = () => {
                                const container = []

                                fibCertArray.forEach(array => {
                                    if (array.length > 0) {
                                        array.forEach(certSet => {
                                            if (certSet.fiber_id == fiber.id){
                                                container.push(certSet)
                                            }
                                        })
                                    }
                                })

                                return container
                            }

                            const fibCertIds = fibFilter().map(cert => cert.certification_id)
                            const newFiber = {
                                approved_by_admin: fiber.approved_by_admin,
                                brand_id: fiber.brand_id,
                                certification_ids: fibCertIds,
                                class: fiber.class,
                                created_at: fiber.created_at,
                                updated_at: fiber.updated_at,
                                factory_country: fiber.factory_country,
                                fiber_type: fiber.fiber_type,
                                fiber_or_material_type_id: fiber.fiber_or_material_type_id,
                                id: fiber.id,
                                percent_of_fabric: fiber.percent_of_fabric,
                                producer: fiber.producer,
                                producer_country: fiber.producer_country,
                                producer_id: fiber.producer_id,
                                producer_website: fiber.producer_website,
                                production_notes: fiber.production_notes
                            }

                            await Promise.all(allFibCerts)

                            return newFiber
                        } catch (e) {
                            next(e)
                        }
                    })

                    const newFabric = await {
                        id: fabric.id,
                        brand_id: fabric.brand_id,
                        relationship: fabric.relationship,
                        fabric_mill_country: fabric.fabric_mill_country,
                        fabric_mill_id: fabric.fabric_mill_id,
                        fabric_mill_notes: xss(fabric.fabric_mill_notes),
                        dye_print_finish_country: fabric.dye_print_finish_country,
                        dye_print_finish_id: fabric.dye_print_finish_id,
                        dye_print_finish_notes: xss(fabric.dye_print_finish_notes),
                        certification_ids: fabCerts.map(cert => cert.id),
                        fibers: await Promise.all(fabFibsWithCerts),
                        fab_approved_by_admin: fabric.fab_approved_by_admin,
                        pair_approved_by_admin: fabric.pair_approved_by_admin,
                        pair_created_at: fabric.pair_created_at,
                        pair_updated_at: fabric.pair_updated_at
                    }

                    return newFabric

                } catch (e) {
                    console.log('catch newFabricArray error:', e)
                    next(e)
                }
            })

            res
                .status(200)
                .json(await Promise.all(newFabricArray))

        } catch (e) {
            console.log('catch GET /:product_id/fabrics', e)
        }
    })
    .post(requireAuth, jsonParser, (req, res, next) => {
        const {
            fabric_id, 
            relationship,
            approved_by_admin,
            created_at,
            updated_at
        } = req.body

        const newProductFabric = {
            product_id: req.params.product_id, 
            fabric_id, 
            relationship,
            approved_by_admin,
            created_at,
            updated_at
        }

        const requiredFields = {
            fabric_id
        }
        
        for (const [key, value] of Object.entries(requiredFields)) {
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
                    error: { message: 'Product does not exist.' }
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
    .post(requireAuth, jsonParser, (req, res, next) => {
        const { 
            factory_id, 
            stage,
            approved_by_admin,
            created_at,
            updated_at
        } = req.body

        const newProductFactory = {  
            product_id: req.params.product_id,
            factory_id,
            stage,
            approved_by_admin,
            created_at,
            updated_at
        }

        const requiredFields = {
            factory_id
        }

        for (const [ key, value ] of Object.entries(requiredFields)) {
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
                    error: { message: `Product does not exist.` }
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
    .post(requireAuth, jsonParser, (req, res, next) => {
        const { 
            fiber_or_material_id,
            approved_by_admin,
            created_at,
            updated_at
        } = req.body

        const newProductFiber = {
            product_id: req.params.product_id,
            fiber_or_material_id,
            approved_by_admin,
            created_at,
            updated_at
        }

        const requiredFields = { 
            fiber_or_material_id 
        }

        for (const [ key, value ] of Object.entries(requiredFields)) {
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
                    error: { message: `Product does not exist.` }
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
    .post(requireAuth, jsonParser, (req, res, next) => {
        const {
            product_image_url,
            color_id,        
            primary_image_for_color,
            approved_by_admin,
            created_at,
            updated_at
        } = req.body

        const newImage = {
            product_id: req.params.product_id,
            product_image_url,
            color_id,
            primary_image_for_color,
            approved_by_admin,
            created_at,
            updated_at
        }

        const requiredFields = {
            product_image_url,
            color_id,
            primary_image_for_color
        }

        for (const [key, value] of Object.entries(requiredFields)) {
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
                    error: { message: `Product does not exist.` }
                })
            }
            res.product = product
            next()
        })
        .catch(next)
    })
    .get(async (req, res, next) => {
        try {
            const productId = res.product.id
            const productNotions = await ProductsService.getNotionsForProduct( req.app.get('db'), productId )
            const newNotionArray = productNotions.map(async notion => {
                try {
                    const notionCerts = await NotionsService.getCertsForNot(
                        req.app.get('db'),
                        notion.id
                    )

                    const newNotion = {
                        ...serializeNotions(notion),
                        certifications: notionCerts.map(serializeCert),
                    }

                    return newNotion

                } catch (e) {
                    console.log('catch newNotionArray error:', e)
                    next(e)
                }
            })

            res.json(await Promise.all(newNotionArray))
            
        } catch (e) {
            console.log('catch GET /:product_id/notions error:', e)
            next(e)
        }
    })
    .post(requireAuth, jsonParser, (req, res, next) => {
        const { 
            notion_id,
            approved_by_admin,
            created_at,
            updated_at
        } = req.body

        const newPair = {
            product_id: Number(req.params.product_id),
            notion_id, 
            approved_by_admin,
            created_at,
            updated_at
        }

        const requiredFields = {
            notion_id
        }

        for (const [key, value] of Object.entries(requiredFields)) {
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
                    error: { message: 'Product does not exist.' }
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
                res.json(sizes)
            })
            .catch(next)
    })
    .post(requireAuth, jsonParser, (req, res, next) => {
        const { 
            size_id,
            approved_by_admin,
            created_at,
            updated_at
        } = req.body

        const newPair = {
            product_id: req.params.product_id,
            size_id, 
            approved_by_admin,
            created_at,
            updated_at
        }

        if (req.body.size_id === undefined) {
            return res.status(400).json({
                error: { message: `Missing 'size_id' in request body`}
            })
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