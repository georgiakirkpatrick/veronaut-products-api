const path = require('path')
const express = require('express')
const xss = require('xss')
const FabricsService = require('./fabrics-service')
const fabricsRouter = express.Router()
const jsonParser = express.json()

const serializeFabrics = fabric => ({
    id: fabric.id,
    fabric_type: fabric.fabric_type,
    fabric_mill_country: fabric.fabric_mill_country,
    fabric_mill_notes: fabric.fabric_mill_notes,
    dye_print_finish_country: fabric.dye_print_finish_country,
    dye_print_finish_notes: fabric.dye_print_finish_notes
})

const serializeFabricPost = fabric => ({
    id: fabric.id,
    fabric_type_id: fabric.fabric_type_id,
    brand_id: fabric.brand_id,
    fabric_mill_country: fabric.fabric_mill_country,
    fabric_mill_notes: fabric.fabric_mill_notes,
    dye_print_finish_country: fabric.dye_print_finish_country,
    dye_print_finish_notes: fabric.dye_print_finish_notes
})

const serializeFibers = fiber => ({
    id: fiber.id,
    fiber_or_material_type_id: fiber.fiber_or_material_type_id,
    fiber_type: fiber.fiber_type,
    class: fiber.class,
    producer_country: fiber.producer_country,
    producer_id: fiber.producer_id,
    factory: fiber.factory,
    factory_country: fiber.factory_country,
    factory_website: fiber.factory_website,
    producer_notes: fiber.producer_notes,
    approved_by_admin: fiber.approved_by_admin,
    date_published: fiber.date_published
})

const serializeCertifications = certifiction => ({
    id: certifiction.id,
    certifiction_name: certification.certifiction_name,
    website: certifiction.website
})

const serializeFactories = factory => ({
    id: factory.id,
    factory_name: factory.factory_name,
    country: factory.country,
    website: factory.website,
    noetes: factory.notes,
})

fabricsRouter
    .route('/')
    .get((req, res, next) => {
        FabricsService
            .getAllFabrics(
                req.app.get('db')
            )
            .then(fabrics => {
                res.json(fabrics.map(serializeFabrics))
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
        })
        .catch(next)
    })
    .get((req, res, next) => {
        res.json({
            id: fabric.id,
            fabric_type_id: fabric.fabric_type_id,
            brand_id: fabric.brand_id,
            fabric_mill_country: fabric.fabric_mill_country,
            fabric_mill_notes: fabric.fabric_mill_notes,
            dye_print_finish_country: fabric.dye_print_finish_country,
            dye_print_finish_notes: fabric.dye_print_finish_notes,
            approved_by_admin: fabric.approved_by_admin,
            date_published: fabric.date_published
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
    .route('/:fabric-id/fibers')
    .all((req, res, next) => {
        ProductsService.getFabricById(
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
        const fabricId = res.fabric.id
        FabricsService
            .getFibersForFabric(
                req.app.get('db'),
                fabricId
            )
            .then(fibers => {
                res.json(fibers.map(serializeFibers))
            })
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

        FabricService
            .insertFabricFiber(
                req.app.get('db'),
                newFabricFiber
            )
            .then(response => {
                console.log('response', response)

                res
                    .status(201)
                    .json(response)
            })
            .catch(next)
    })

fabricsRouter
    .route(':fabric_id/certifications')
    .all((req, res, next) => {
        ProductsService.getFabricById(
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
        const fabricId = res.fabric.id
        FabricsService
            .getCertificationsForFabric(
                req.app.get('db'),
                fabricId
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

        FabricService
            .insertFabricCertification(
                req.app.get('db'),
                newFabricCertification
            )
            .then(response => {
                console.log('response', response)

                res
                    .status(201)
                    .json(response)
            })
            .catch(next)
    })

fabricsRouter
    .route(':fabric_id/factories')
    .all((req, res, next) => {
        ProductsService.getFabricById(
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
        const fabricId = res.fabric.id
        FabricsService
            .getFactoriesForFabric(
                req.app.get('db'),
                fabricId
            )
            .then(factories => {
                res.json(factories.map(serializeFactories))
            })
    })
    .post()

module.exports = fabricsRouter