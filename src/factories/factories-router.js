const { requireAuth, requireAdmin } = require('../middleware/basic-auth')
const express = require('express')
const FactoriesService = require('./factories-service')
const factoriesRouter = express.Router()
const jsonParser = express.json()
const path = require('path')
const xss = require('xss').escapeHtml

const serializeFactories = factory => ({
    id: factory.id,
    english_name: xss(factory.english_name),
    country: factory.country,
    website: factory.website ? xss(factory.website) : null,
    notes: xss(factory.notes),
    approved_by_admin: factory.approved_by_admin,
    date_published: factory.date_published
})

factoriesRouter
    .route('/')
    .get((req, res, next) => {
        FactoriesService
            .getAllFactories(
                req.app.get('db')
            )
            .then(factories => {
                res.json(factories.map(serializeFactories))
            })
            .catch(next)
    })
    .post(requireAuth, jsonParser, (req, res, next) => {
        const { 
            english_name,
            country,
            website,
            notes,
            approved_by_admin
        } = req.body

        const newFactory = {
            english_name,
            country,
            website,
            notes,
            approved_by_admin
        }

        const requiredFields = {
            english_name,
            country
        }

        for (const [key, value] of Object.entries(requiredFields)) {
            if (value === undefined) {
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body`}
                })
            }
        }

        FactoriesService
            .insertFactory(
                req.app.get('db'),
                newFactory
            )
            .then(factory => {
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl + `/${factory.id}`))
                    .json(serializeFactories(factory))
            })
            .catch(next)
    })


factoriesRouter
    .route('/:factory_id')
    .all((req, res, next) => {
        FactoriesService.getFactoryById(
            req.app.get('db'),
            req.params.factory_id
        )
        .then(factory => {
            if (!factory) {
                return res.status(404).json({
                    error: { message: `Factory does not exist` }
                })
            }
            res.factory = factory
            next()
        })
        .catch(next)
    })
    .get((req, res, next) => {
        res.json({
            id: res.factory.id,
            english_name: xss(res.factory.english_name),
            country: res.factory.country,
            website: xss(res.factory.website),
            notes: xss(res.factory.notes),
            approved_by_admin: res.factory.approved_by_admin,
            date_published: res.factory.date_published
        })
        next()
    })
    .patch(requireAdmin, jsonParser, (req, res, next) => {
        const {
            english_name,
            country,
            website,
            notes,
            approved_by_admin
        } = req.body

        const factoryToUpdate = {
            english_name,
            country,
            website,
            notes,
            approved_by_admin
        }

        const numberOfValues = Object.values(factoryToUpdate).filter(Boolean).length
        if (numberOfValues === 0) {
            return res.status(400).json({
                error: {
                    message: `Request body must contain 'english_name', 'country', 'website', 'notes', and/or 'approved_by_admin'`
                }
            })
        }
        
        FactoriesService
            .updatefactory(
                req.app.get('db'),
                req.params.factory_id,
                factoryToUpdate
            )
            .then(numRowsAffected => {
                res.status(204).end()
            })
            .catch(error => {
                console.log(error)
                next()
            })
    })
    .delete(requireAdmin, (req, res, next) => {
        FactoriesService
            .deleteFactory(
                req.app.get('db'),
                req.params.factory_id
            )
            .then(() => {
                res.status(204).end()
            })
            .catch(next)
    })

module.exports = factoriesRouter