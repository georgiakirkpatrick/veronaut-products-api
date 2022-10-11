const { requireAuth, requireAdmin } = require('../middleware/jwt-auth')
const express = require('express')
const fabricsRouter = express.Router()
const FabricsService = require('./fabrics-service')
const jsonParser = express.json()
const path = require('path')
const xss = require('xss').escapeHtml

const serializeCertifications = certification => ({
    id: certification.id,
    english_name: xss(certification.english_name),
    website: xss(certification.website),
    approved_by_admin: certification.approved_by_admin,
    date_published: certification.date_published
})

const serializeFabric = fabric => ({
    id: fabric.id,
    brand_id: fabric.brand_id,
    fabric_mill_country: fabric.fabric_mill_country,
    fabric_mill_id: fabric.fabric_mill_id,
    fabric_mill_notes: xss(fabric.fabric_mill_notes),
    dye_print_finish_country: fabric.dye_print_finish_country,
    dye_print_finish_id: fabric.dye_print_finish_id,
    dye_print_finish_notes: xss(fabric.dye_print_finish_notes),
    approved_by_admin: fabric.approved_by_admin,
    date_published: fabric.date_published
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
    english_name: xss(factory.english_name),
    country: factory.country,
    website: xss(factory.website),
    notes: xss(factory.notes),
    approved_by_admin: factory.approved_by_admin,
    date_published: factory.date_published
})

const serializeFibers = fiber => ({
    id: fiber.id,
    brand_id: fiber.brand_id,
    fiber_type_id: fiber.fiber_type_id,
    fiber_type: xss(fiber.fiber_type),
    class: fiber.class,
    producer_country: fiber.producer_country,
    producer_id: fiber.producer_id,
    producer: xss(fiber.producer),
    factory_country: fiber.factory_country,
    producer_website: xss(fiber.producer_website),
    production_notes: fiber.production_notes ? xss(fiber.production_notes) : null,
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
                res.json(fabrics.map(serializeFabric))
            })
            .catch(next)
            
    })
    .post(requireAuth, jsonParser, (req, res, next) => {
        const { 
            brand_id, 
            fabric_mill_country,
            fabric_mill_id,
            fabric_mill_notes, 
            dye_print_finish_country,
            dye_print_finish_id,
            dye_print_finish_notes,
            approved_by_admin
        } = req.body

        const newFabric = {
            brand_id, 
            fabric_mill_country,
            fabric_mill_id,
            fabric_mill_notes, 
            dye_print_finish_country,
            dye_print_finish_id,
            dye_print_finish_notes,
            approved_by_admin
        }

        const requiredFields = {
            brand_id, 
            fabric_mill_country,
            fabric_mill_id,
            dye_print_finish_country,
            dye_print_finish_id
        }

        for (const [key, value] of Object.entries(requiredFields)) {
            if (value === undefined) {
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body`}
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
                    .json(serializeFabric(fabric))
                    
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
    .post(requireAuth, jsonParser, (req, res, next) => {
        const { 
            english_name,
            approved_by_admin
        } = req.body

        const newNotionType = {
            english_name,
            approved_by_admin
        }

        const requiredFields = {
            english_name
        }

        for (const [key, value] of Object.entries(requiredFields)) {
            if (value === undefined) {
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body`}
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
    })
    .get(async (req, res, next) => {
        try {
            const fabCerts = await FabricsService.getFabCerts(
                req.app.get('db'),
                res.fabric.id
            )

            const fabFibs = await FabricsService.getFabFibers(
                req.app.get('db'),
                res.fabric.id
            )

            const makeFibArray = () => {
                const newFibArray = []
                fabFibs.map(fiber => {
                    const fibIndex = newFibArray.findIndex(fib => fib.id === fiber.id)
                    if (fibIndex === -1) {
                        const newFiber = {
                            approved_by_admin: fiber.approved_by_admin,
                            brand_id: fiber.brand_id,
                            certification_ids: [fiber.certification_id],
                            class: fiber.class,
                            date_published: fiber.date_published,
                            factory_country: fiber.factory_country,
                            fiber_type: fiber.fiber_type,
                            fiber_type_id: fiber.fiber_type_id,
                            id: fiber.id,
                            percent_of_fabric: fiber.percent_of_fabric,
                            producer: fiber.producer,
                            producer_country: fiber.producer_country,
                            producer_id: fiber.producer_id,
                            producer_website: fiber.producer_website,
                            production_notes: fiber.production_notes
                        }

                        newFibArray.push(newFiber)
                    } else {
                        newFibArray[fibIndex].certification_ids.push(fiber.certification_id)
                    }
                })
                return newFibArray
            }
            
            const fabric = {
                id: res.fabric.id,
                brand_id: res.fabric.brand_id,
                relationship: res.fabric.relationship,
                fabric_mill_country: res.fabric.fabric_mill_country,
                fabric_mill_id: res.fabric.fabric_mill_id,
                fabric_mill_notes: xss(res.fabric.fabric_mill_notes),
                dye_print_finish_country: res.fabric.dye_print_finish_country,
                dye_print_finish_id: res.fabric.dye_print_finish_id,
                dye_print_finish_notes: xss(res.fabric.dye_print_finish_notes),
                certification_ids: fabCerts.map(cert => cert.certification_id),
                fibers: makeFibArray(),
                approved_by_admin: res.fabric.approved_by_admin,
                date_published: res.fabric.date_published
            }

            res.json(fabric)
            next()
        } catch (e) {
            console.log('catch POST "/:fabric_id" ', e)
            next(e)
        }
    })
    .patch(requireAdmin, jsonParser, (req, res, next) => {
        const {
            brand_id,
            fabric_mill_country,
            fabric_mill_id,
            fabric_mill_notes,
            dye_print_finish_country,
            dye_print_finish_id,
            dye_print_finish_notes,
            approved_by_admin
        } = req.body

        const fabricToUpdate = {
            brand_id,
            fabric_mill_country,
            fabric_mill_id,
            fabric_mill_notes,
            dye_print_finish_country,
            dye_print_finish_id,
            dye_print_finish_notes,
            approved_by_admin
        }

        const numberOfValues = Object.values(fabricToUpdate).filter(Boolean).length

        if (numberOfValues === 0) {
            return res.status(400).json({
                error: { message: `Request body must include 'brand_id', 'fabric_mill_country', 'fabric_mill_id', 'fabric_mill_notes', 'dye_print_finish_country', 'dye_print_finish_id', 'dye_print_finish_notes', or 'approved_by_admin'`}
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
    .delete(requireAdmin, (req, res, next) => {
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
    .route('/:fabric_id/certifications')
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
            .getFabCerts(
                req.app.get('db'),
                req.params.fabric_id
            )
            .then(certifications => {
                res.json(certifications.map(serializeCertifications))
            })
            .catch(next)
    })
    .post(requireAuth, jsonParser, (req, res, next) => {
        const {certification_id} = req.body
        const newFabricCertification = {
            fabric_id: req.params.fabric_id, 
            certification_id
        }
        
        if (certification_id === undefined) {
            return res.status(400).json({
                error: { message: `Missing 'certification_id' in request body`}
            })
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
    .route('/:fabric_id/factories')
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
            .getFactoriesForFabric(
                req.app.get('db'),
                req.params.fabric_id
            )
            .then(factories => {
                res.json(factories.map(serializeFactories))
            })
            .catch(next)
    })
    .post(requireAuth, jsonParser, (req, res, next) => {
        const {factory_id} = req.body
        const newFabricFactory = {fabric_id: req.params.fabric_id, factory_id}
        
        for (const [key, value] of Object.entries(newFabricFactory)) {
            if (value === undefined) {
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
    .get(async (req, res, next) => {
        try {
            const fabFibers = await FabricsService.getFabFibers(
                req.app.get('db'),
                req.params.fabric_id
            )
  
            res.json(fabFibers.map(serializeFibers))
        } catch (e) {
            console.log('catch /:fabric_id/fibers get', e)
            next(e)
        }
        
    })
    .post(requireAuth, jsonParser, (req, res, next) => {
        const fabricId = res.fabric.id

        const {
            fiber_or_material_id, 
            percent_of_fabric
        } = req.body

        const newFabricFiber = {
            fabric_id: fabricId, 
            fiber_or_material_id, 
            percent_of_fabric
        }

        const requiredFields = {            
            fiber_or_material_id
        }

        for (const [key, value] of Object.entries(requiredFields)) {
            if (value === undefined) {
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

module.exports = fabricsRouter