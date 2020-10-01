const path = require('path')
const express = require('express')
const xss = require('xss')
const FabricsService = require('./fabrics-service')
const fabricsRouter = express.Router()
const jsonParser = express.json()

const serializeCertifications = certifiction => ({
    id: certifiction.id,
    certifiction_name: xss(certification.certifiction_name),
    website: xss(certifiction.website)
})

const serializeFabricGet = fabric => ({
    id: fabric.id,
    fabric_type: fabric.fabric_type,
    fabric_mill_country: fabric.fabric_mill_country,
    fabric_mill_notes: xss(fabric.fabric_mill_notes),
    dye_print_finish_country: fabric.dye_print_finish_country,
    dye_print_finish_notes: xss(fabric.dye_print_finish_notes),
    date_published: fabric.date_published
})

const serializeFabricPost = fabric => ({
    id: fabric.id,
    fabric_type_id: fabric.fabric_type_id,
    brand_id: fabric.brand_id,
    fabric_mill_country: fabric.fabric_mill_country,
    fabric_mill_notes: xss(fabric.fabric_mill_notes),
    dye_print_finish_country: fabric.dye_print_finish_country,
    dye_print_finish_notes: xss(fabric.dye_print_finish_notes),
})

const serializeFabricTypes = fabricType => ({
    id: fabricType.id,
    english_name: xss(fabricType.english_name),
    fabric_type_class: fabricType.fabric_type_class,
    approved_by_admin: fabricType.approved_by_admin,
    date_published: fabricType.date_published
})

const serializeFactories = factory => ({
    id: factory.id,
    factory_name: xss(factory.factory_name),
    country: factory.country,
    website: xss(factory.website),
    notes: xss(factory.notes),
})

const serializeFiberTypes = fiberType => ({
    id: fiberType.id,
    english_name: xss(fiberType.english_name),
    fiber_type_class: fiberType.fiber_type_class,
    approved_by_admin: fiberType.approved_by_admin,
    date_published: fiberType.date_published
})

const serializeFibers = fiber => ({
    id: fiber.id,
    fiber_or_material_type_id: fiber.fiber_or_material_type_id,
    fiber_type: fiber.fiber_type,
    class: fiber.class,
    producer_country: fiber.producer_country,
    producer_id: fiber.producer_id,
    factory: xss(fiber.factory),
    factory_country: fiber.factory_country,
    factory_website: xss(fiber.factory_website),
    producer_notes: xss(fiber.producer_notes),
    approved_by_admin: fiber.approved_by_admin,
    date_published: fiber.date_published
})

const serializeNotionTypes = notionType => ({
    id: notionType.id,
    english_name: xss(notionType.english_name),
    approved_by_admin: notionType.approved_by_admin,
    date_published: notionType.date_published
})

fabricsRouter
    .route('/')
    .get((req, res, next) => {
        FabricsService
            .getAllFabrics(
                req.app.get('db')
            )
            .then(fabrics => {
                res.json(fabrics.map(serializeFabricGet))
            })
            .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
        const { 
            fabric_type_id, 
            brand_id, 
            fabric_mill_country, 
            fabric_mill_notes, 
            dye_print_finish_country, 
            dye_print_finish_notes,
            approved_by_admin
        } = req.body

        const newFabric = {
            fabric_type_id, 
            brand_id, 
            fabric_mill_country, 
            fabric_mill_notes, 
            dye_print_finish_country, 
            dye_print_finish_notes,
            approved_by_admin
        }

        for (const [key, value] of Object.entries(newFabric)) {
            if (value === null) {
                return res.status(400).json({
                    error: { message: `Missing ${key} in request body.`}
                })
            }
        }

        FabricsService
            .insertFabric(
                req.app.get('db'),
                newFabric
            )
            .then(fabric => {
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl + `/${fabric.id}`))
                    .json(serializeFabricPost(fabric))
                    
            })
            .catch(next)
    })

fabricsRouter
    .route('/fabric-types')
    .get((req, res, next) => {
        FabricsService
            .getAllFabricTypes(
                req.app.get('db')
            )
            .then(fabricTypes => {
                res.json(fabricTypes.map(serializeFabricTypes))
            })
            .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
        const { english_name, fabric_type_class, approved_by_admin } = req.body
        const newFabricType = { english_name, fabric_type_class, approved_by_admin }

        for (const [key, value] of Object.entries(newFabricType)) {
            if (value === null) {
                return res.status(400).json({
                    error: { message: `Missing ${key} in request body.`}
                })
            }
        }

        FabricsService
            .insertFabricType(
                req.app.get('db'),
                newFabricType
            )
            .then(fabricType => {
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl + `/${fabricType.id}`))
                    .json(serializeFabricypes(fabricType))
                    
            })
            .catch(next)
    })

fabricsRouter
    .route('/fiber-types')
    .get((req, res, next) => {
        FabricsService
            .getAllFiberTypes(
                req.app.get('db')
            )
            .then(fiberTypes => {
                res.json(fiberTypes.map(serializeFiberTypes))
            })
            .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
        const { english_name, fiber_type_class, approved_by_admin } = req.body
        const newFiberType = { english_name, fiber_type_class, approved_by_admin }

        for (const [key, value] of Object.entries(newFiberType)) {
            if (value === null) {
                return res.status(400).json({
                    error: { message: `Missing ${key} in request body.`}
                })
            }
        }

        FabricsService
            .insertFiberType(
                req.app.get('db'),
                newFiberType
            )
            .then(fiberType => {
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl + `/${fiberType.id}`))
                    .json(serializeFiberTypes(fiberType))
                    
            })
            .catch(next)
    })

fabricsRouter
    .route('/notion-types')
    .get((req, res, next) => {
        FabricsService
            .getAllNotionTypes(
                req.app.get('db')
            )
            .then(notionTypes => {
                res.json(notionTypes.map(serializeNotionTypes))
            })
            .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
        const { english_name, approved_by_admin } = req.body
        const newNotionType = { english_name, approved_by_admin }

        for (const [key, value] of Object.entries(newNotionType)) {
            if (value === null) {
                return res.status(400).json({
                    error: { message: `Missing ${key} in request body.`}
                })
            }
        }

        FabricsService
            .insertNotionType(
                req.app.get('db'),
                newNotionType
            )
            .then(notionType => {
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl + `/${notionType.id}`))
                    .json(serializeNotionTypes(notionType))
                    
            })
            .catch(next)
    })

fabricsRouter
    .route('/:fabric_id')
    .all((req, res, next) => {
        FabricsService.getFabricById(
            req.app.get('db'),
            req.params.fabric_id
        )
        .then(fabric => {
            if (!fabric) {
                return res.status(404).json({
                    error: { message: `Fabric does not exist.`}
                })
            }
            res.fabric = fabric
            next()
        })
        .catch(next)
    })
    .get((req, res, next) => {
        res.json({
            id: res.fabric.id,
            fabric_type_id: res.fabric.fabric_type_id,
            brand_id: res.fabric.brand_id,
            fabric_mill_country: res.fabric.fabric_mill_country,
            fabric_mill_notes: res.fabric.fabric_mill_notes,
            dye_print_finish_country: res.fabric.dye_print_finish_country,
            dye_print_finish_notes: res.fabric.dye_print_finish_notes,
            approved_by_admin: res.fabric.approved_by_admin,
            date_published: res.fabric.date_published
        })
        .catch(next)
    })
    .patch(jsonParser, (req, res, next) => {
        const {
            fabric_type_id,
            brand_id,
            fabric_mill_country,
            fabric_mill_notes,
            dye_print_finish_country,
            dye_print_finish_notes,
            approved_by_admin
        } = req.body

        const fabricToUpdate = {
            fabric_type_id,
            brand_id,
            fabric_mill_country,
            fabric_mill_notes,
            dye_print_finish_country,
            dye_print_finish_notes,
            approved_by_admin
        }

        const numberOfValues = Object.values(fabricToUpdate).filter(Boolean).length
        if (numberOfValues === 0) {
            return res.status(400).json({
                error: { message: `Request body must include fabric_type_id,brand_id, fabric_mill_country, fabric_mill_notes, dye_print_finish_country, dye_print_finish_notes, or approved_by_admin`}
            })
        }
        
        FabricsService
            .updateFabric(
                req.app.get('db'),
                req.params.fabric_id,
                fabricToUpdate
            )
            .then(numRowsAffected => {
                res.status(204).end()
            })
            .catch(next)

    })
    .delete((req, res, next) => {
        FabricsService
            .deleteFabric(
                req.app.get('db'),
                req.params.fabric_id
        )
        .then(() => {
            res.status(204).end()
        })
        .catch(next)
    })

fabricsRouter
    .route('/:fabric_id/fibers')
    .all((req, res, next) => {
        FabricsService.getFabricById(
            req.app.get('db'),
            req.params.fabric_id
        )
        .then(fabric => {
            if (!fabric) {
                return res.status(404).json({
                    error: { message: `Fabric does not exist` }
                })
            }
            res.fabric = fabric
            next()
        })
        .catch(next)
    })
    .get((req, res, next) => {
        FabricsService
            .getFibersForFabric(
                req.app.get('db'),
                req.params.fabric_id
            )
            .then(fibers => {
                res.json(fibers.map(serializeFibers))
            })
            .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
        const {fabric_id, fiber_or_material_id} = req.body
        const newFabricFiber = {fabric_id, fiber_or_material_id}

        for (const [key, value] of Object.entries(newFabricFiber)) {
            if (value === null) {
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body`}
                })
            }
        }

        FabricsService
            .insertFabricFiber(
                req.app.get('db'),
                newFabricFiber
            )
            .then(fabricFiber => {
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl))
                    .json(fabricFiber)
            })
            .catch(next)
    })

fabricsRouter
    .route(':fabric_id/certifications')
    .all((req, res, next) => {
        FabricsService.getFabricById(
            req.app.get('db'),
            req.params.fabric_id
        )
        .then(fabric => {
            if (!fabric) {
                return res.status(404).json({
                    error: { message: `Product does not exist` }
                })
            }
            res.fabric = fabric

            next()
        })
        .catch(next)
    })
    .get((req, res, next) => {
        FabricsService
            .getCertificationsForFabric(
                req.app.get('db'),
                req.params.fabric_id
            )
            .then(certifications => {
                res.json(certifications.map(serializeCertifications))
            })
    })
    .post(jsonParser, (req, res, next) => {
        const {fabric_id, certification_id} = req.body
        const newFabricCertification = {fabric_id, certification_id}
        
        for (const [key, value] of Object.entries(newFabricCertification)) {
            if (value === null) {
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body`}
                })
            }
        }

        FabricsService
            .insertFabricCertification(
                req.app.get('db'),
                newFabricCertification
            )
            .then(fabricCertification => {

                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl))
                    .json(fabricCertification)
            })
            .catch(next)
    })

fabricsRouter
    .route(':fabric_id/factories')
    .all((req, res, next) => {
        console.log('.route(:fabric_id/factories)')
        FabricsService.getFabricById(
            req.app.get('db'),
            req.params.fabric_id
        )
        .then(fabric => {
            console.log('fabric', fabric)
            if (!fabric) {
                return res.status(404).json({
                    error: { message: `Product does not exist` }
                })
            }
            res.fabric = fabric
            next()
        })
        .catch(next)
    })
    .get((req, res, next) => {
        FabricsService
            .getFactoriesForFabric(
                req.app.get('db'),
                req.params.fabric_id
            )
            .then(factories => {
                res.json(factories.map(serializeFactories))
            })
    })
    .post(jsonParser, (req, res, next) => {
        const {fabric_id, factory_id} = req.body
        const newFabricFactory = {fabric_id, factory_id}
        
        for (const [key, value] of Object.entries(newFabricFactory)) {
            if (value === null) {
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body`}
                })
            }
        }

        FabricsService
            .insertFabricFactory(
                req.app.get('db'),
                newFabricFactory
            )
            .then(fabricFactory => {

                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl))
                    .json(fabricFactory)
            })
            .catch(next)
    })

module.exports = fabricsRouter