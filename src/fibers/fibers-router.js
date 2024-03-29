const { requireAuth, requireAdmin } = require('../middleware/jwt-auth')
const express = require('express')
const fibersRouter = express.Router()
const FibersService = require('./fibers-service')
const jsonParser = express.json()
const path = require('path')
const xss = require('xss').escapeHtml

const serializeCertifications = certification => ({
    certification_id: certification.certification_id,
    fiber_id: certification.fiber_id,
    english_name: xss(certification.english_name),
    website: xss(certification.website),
    approved_by_admin: certification.approved_by_admin,
    created_at: certification.created_at,
    updated_at: certification.updated_at
})

const serializeFibers = fiber => ({
    id: fiber.id,
    fiber_or_material_type_id: fiber.fiber_or_material_type_id,
    fiber_type: fiber.fiber_type ? xss(fiber.fiber_type) : null,
    class: fiber.class,
    brand_id: fiber.brand_id,
    producer_country: fiber.producer_country,
    producer_id: fiber.producer_id,
    production_notes: fiber.production_notes ? xss(fiber.production_notes) : null,
    producer: xss(fiber.producer),
    producer_website: fiber.producer_website ? xss(fiber.producer_website) : null,
    approved_by_admin: fiber.approved_by_admin,
    created_at: fiber.created_at,
    updated_at: fiber.updated_at
})

const serializeFiberTypes = fiberType => ({
    id: fiberType.id,
    english_name: xss(fiberType.english_name),
    fiber_type_class: fiberType.fiber_type_class,
    approved_by_admin: fiberType.approved_by_admin,
    created_at: fiberType.created_at,
    updated_at: fiberType.updated_at
})

fibersRouter
    .route('/')
    .get((req, res, next) => {
        FibersService
            .getAllFibers(req.app.get('db'))
            .then(fibers => {
                res.json(fibers.map(serializeFibers))
            })
            .catch(next)
    })
    .post(requireAuth, jsonParser, (req, res, next) => {
        const {
            fiber_or_material_type_id,
            brand_id,
            producer_country,
            producer_id,
            production_notes,
            approved_by_admin
        } = req.body

        const newFiber = {
            fiber_or_material_type_id,
            brand_id,
            producer_country,
            producer_id,
            production_notes,
            approved_by_admin
        }

        const requiredFields = {
            fiber_or_material_type_id,
            brand_id,
            producer_country,
            producer_id
        }

        for (const [key, value] of Object.entries(requiredFields)) {
            if (value === undefined) {
                return res.status(400).json({ error: { message: `Missing '${key}' in request body` } })
            }
        }

        FibersService
            .insertFiber(req.app.get('db'), newFiber)
            .then(fiber => {
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl + `/${fiber.id}` ))
                    .json({
                        id: fiber.id,
                        fiber_or_material_type_id: fiber.fiber_or_material_type_id,
                        brand_id: fiber.brand_id,
                        producer_country: fiber.producer_country,
                        producer_id: fiber.producer_id,
                        production_notes: fiber.production_notes ? xss(fiber.production_notes) : null,
                        approved_by_admin: fiber.approved_by_admin,
                        created_at: fiber.created_at,
                        updated_at: fiber.updated_at
                    })
            })
    })

fibersRouter
    .route('/fiber-types')
    .get((req, res, next) => {
        FibersService
            .getAllFiberTypes(
                req.app.get('db')
            )
            .then(fiberTypes => {
                res.json(fiberTypes.map(serializeFiberTypes))
            })
            .catch(next)
    })
    .post(requireAuth, jsonParser, (req, res, next) => {
        const { 
            english_name, 
            fiber_type_class,
            approved_by_admin
        } = req.body

        const newFiberType = { 
            english_name, 
            fiber_type_class,
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

        FibersService
            .insertFiberType(
                req.app.get('db'),
                newFiberType
            )
            .then(fiberType => {
                res
                    .status(201)
                    // .location(path.posix.join(req.originalUrl + `/${fiberType.id}`))
                    .json(serializeFiberTypes(fiberType))
                    
            })
            .catch(next)
    })

fibersRouter
    .route('/:fiber_id')
    .all((req, res, next) => {
        FibersService
            .getFiberById(
                req.app.get('db'),
                req.params.fiber_id
            )
            .then(fiber => {
                if (!fiber) {
                    return res.status(404).json({
                        error: { message: `Fiber does not exist.` }
                    })
                }
                res.fiber = fiber
                next()
            })
            .catch(next)
    })
    .get((req, res, next) => {
        res.json({
            id: res.fiber.id,
            fiber_or_material_type_id: res.fiber.fiber_or_material_type_id,
            fiber_type: xss(res.fiber.fiber_type),
            class: res.fiber.class,
            brand_id: res.fiber.brand_id,
            producer_country: res.fiber.producer_country,
            producer_id: res.fiber.producer_id,
            production_notes: res.fiber.production_notes ? xss(res.fiber.production_notes) : null,
            producer: xss(res.fiber.producer),
            producer_website: res.fiber.producer_website ? xss(res.fiber.producer_website): null,
            // producer_notes: res.fiber.producer_notes ? xss(res.fiber.producer_notes) : null,
            approved_by_admin: res.fiber.approved_by_admin,
            created_at: res.fiber.created_at,
            updated_at: res.fiber.updated_at
        })
        .catch(next)
    })
    .patch(requireAdmin, jsonParser, (req, res, next) => {
        const {
            fiber_or_material_type_id,
            brand_id,
            producer_country,
            producer_id,
            production_notes,            
            approved_by_admin
        } = req.body

        const newFiberFields = {
            fiber_or_material_type_id,
            brand_id,
            producer_country,
            producer_id,
            production_notes,
            approved_by_admin
        }

        const numberOfValues = Object.values(newFiberFields).filter(Boolean).length
        if (numberOfValues === 0) {
            return res.status(400).json({
                error: {
                    message: `Request body must contain 'fiber_or_material_type_id', 'brand_id', 'producer_country', 'producer_id', 'production_notes', and/or 'approved_by_admin'`
                }
            })
        }
        
        FibersService
            .updateFiber(
                req.app.get('db'),
                req.params.fiber_id,
                newFiberFields
            )
            .then(numRowsAffected => {
                res.status(204).end()
            })
            .catch(next)
    })
    .delete(requireAdmin, (req, res, next) => {
        FibersService
            .deleteFiber(
                req.app.get('db'),
                req.params.fiber_id
            )
            .then(() => {
                res.status(204).end()
            })
            .catch(next)
    })

fibersRouter
    .route('/:fiber_id/certifications')
    .all((req, res, next) => {
        FibersService.getFiberById(
            req.app.get('db'),
            req.params.fiber_id
        )
        .then(fiber => {
            if (!fiber) {
                return res.status(404).json({
                    error: { message: `Fiber does not exist.` }
                })
            }
            res.fiber = fiber
            next()
        })
        .catch(next)
    })
    .get((req, res, next) => {
        FibersService
            .getFibCerts(
                req.app.get('db'),
                req.params.fiber_id
            )
            .then(certifications => {
                res.json(certifications.map(serializeCertifications))
            })
            .catch(next)
    })
    .post(requireAuth, jsonParser, (req, res, next) => {
        const { certification_id } = req.body

        const fibCertPair = {
            fiber_or_material_id: req.params.fiber_id,
            certification_id
        }

        const requiredFields = {
            certification_id
        }
        
        for (const [key, value] of Object.entries(requiredFields)) {
            if (value === undefined) {
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body`}
                })
            }
        }

        FibersService
            .insertFiberCert(
                req.app.get('db'),
                fibCertPair
            )
            .then(fiberCert => {

                res
                    .status(201)
                    .json(fiberCert)
            })
            .catch(next)
    })

module.exports = fibersRouter