const path = require('path')
const express = require('express')
const xss = require('xss').escapeHtml
const FibersService = require('./fibers-service')
const fibersRouter = express.Router()
const jsonParser = express.json()

const serializeFibers = fiber => ({
    id: fiber.id,
    english_name: xss(fiber.english_name),
    country: fiber.country,
    website: xss(fiber.website),
    notes: xss(fiber.notes),
    approved_by_admin: fiber.approved_by_admin,
    date_published: fiber.date_published
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
                        error: { message: `Fiber does not exist` }
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
            fiber_type_id: res.fiber.fiber_type_id,
            fiber_type: xss(res.fiber.fiber_type),
            class: res.fiber.class,
            brand_id: res.fiber.brand_id,
            producer_country: res.fiber.producer_country,
            producer_id: res.fiber.producer_id,
            production_notes: xss(res.fiber.production_notes),
            producer: xss(res.fiber.producer),
            producer_website: xss(res.fiber.producer_website),
            producer_notes: xss(res.fiber.producer_notes),
            approved_by_admin: res.fiber.approved_by_admin,
            date_published: res.fiber.date_published,
        })
        .catch(next)
    })
    .patch(jsonParser, (req, res, next) => {
        const {
            english_name,
            country,
            website,
            notes,
            approved_by_admin
        } = req.body

        const newFiberFields = {
            english_name,
            country,
            website,
            notes,
            approved_by_admin
        }

        const numberOfValues = Object.values(newFiberFields).filter(Boolean).length
        if (numberOfValues === 0) {
            return res.status(400).json({
                error: {
                    message: `Request body must contain 'english_name', 'country', 'website', 'notes', 'approved_by_admin'`
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
    .delete((req, res, next) => {
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
                    error: { message: `Fiber does not exist` }
                })
            }
            res.fiber = fiber
            next()
        })
        .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
        const { certification_id } = req.body
        const fibCertPair = {
            fiber_id: req.params.fiber_id, 
            certification_id
        }
        
        for (const [key, value] of Object.entries(fibCertPair)) {
            if (value === undefined) {
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body`}
                })
            }
        }

        FibersService
            .insertFiberCertification(
                req.app.get('db'),
                fibCertPair
            )
            .then(fiberCertification => {

                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl))
                    .json(fiberCertification)
            })
            .catch(next)
    })

module.exports = fibersRouter