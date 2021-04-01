const path = require('path')
const express = require('express')
const BrandsService = require('./brands-service')
const brandsRouter = express.Router()
const xss = require('xss').escapeHtml
const jsonParser = express.json()

const serializeBrands = brand => ({
    id: brand.id,
    english_name: xss(brand.english_name),
    website: xss(brand.website),
    home_currency: brand.home_currency,
    size_system: brand.size_system,
    approved_by_admin: brand.approved_by_admin,
    date_published: brand.date_published
})

const serializeFibers = fiber => ({
    id: fiber.id,
    fiber_or_material_type_id: fiber.fiber_or_material_type_id,
    fiber_type: fiber.fiber_type,
    fiber_type_class: fiber.fiber_type_class,
    brand_id: fiber.brand_id,
    producer_country: fiber.producer_country,
    producer_id: fiber.producer_id,
    producer_notes: xss(fiber.producer_notes),
    approved_by_admin: fiber.approved_by_admin,
    date_published: fiber.date_published
})

const serializeNotions = notion => ({
    id: notion.id,
    notion_type_id: notion.notion_type_id,
    notion_type: notion.notion_type,
    brand_id: notion.brand_id,
    notion_factory_country: notion.notion_factory_country,
    notion_factory_id: notion.notion_factory_id,
    notion_factory_notes: xss(notion.notion_factory_notes),
    approved_by_admin: notion.approved_by_admin,
    date_published: notion.date_published
})

brandsRouter
    .route('/')
    .get((req, res, next) => {
        BrandsService
            .getAllBrands(
                req.app.get('db')
            )
            .then(brands => {
                console.log('brands', brands)
                res.json(brands.map(serializeBrands))
            })
            .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
        const {
            english_name,
            website,
            home_currency,
            size_system
        } = req.body

        const newBrand = {
            english_name,
            website,
            home_currency,
            size_system
        }

        for (const [key, value] of Object.entries(newBrand)) {
            if (value === undefined) {
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body`}
                })
            }
        }

        BrandsService
            .insertBrand(
                req.app.get('db'),
                newBrand
            )
            .then(brand => {
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl + `/${brand.id}`))
                    .json(serializeBrands(brand))
            })
            .catch(next)
    })

brandsRouter
    .route('/:brand_id')
    .all((req, res, next) => {
        BrandsService.getBrandById(
            req.app.get('db'),
            req.params.brand_id
        )
        .then(brand => {
            if (!brand) {
                return res.status(404).json({
                    error: { message: `Brand does not exist.` }
                })
            }
            res.brand = brand
            next()
        })
        .catch(next)
    })
    .get((req, res, next) => {
        res.json(serializeBrands(res.brand)) 
    })
    .patch(jsonParser, (req, res, next) => {
        const {english_name, website, size_system, home_currency, approved_by_admin} = req.body
        
        const brandToUpdate = {english_name, website, size_system, home_currency, approved_by_admin}

        const numberOfValues = Object.values(brandToUpdate).filter(Boolean).length
        if (numberOfValues === 0) {
            return res.status(400).json({
                error: { message: `Request body must include 'english_name', 'website', 'home_currency', 'size_system', 'approved_by_admin'`}
            })
        }

        BrandsService
            .updateBrand(res.app.get('db'), req.params.brand_id, brandToUpdate)
            .then(numRowsAffected => {
                res.status(204).end()
            })
            .catch(next)
    })
    .delete((req, res, next) => {
        BrandsService
            .deleteBrand(
                req.app.get('db'), 
                req.params.brand_id
            )
            .then(() => {
                res.status(204).end()
            })
            .catch(next)
        })

brandsRouter
    .route('/:brand_id/fibers')
    .all((req, res, next) => {
        BrandsService.getBrandById(
            req.app.get('db'),
            req.params.brand_id
        )
        .then(brand => {
            if (!brand) {
                return res.status(404).json({
                    error: { message: `Brand does not exist.`}
                })
            }
            res.brand = brand
            next()
        })
        .catch(next)
    })
    .get((req, res, next) => {
        BrandsService.getFibersForBrand(
                req.app.get('db'),
                req.params.brand_id
            )
            .then(fibers => {
                res.status(200).json(fibers.map(serializeFibers))
            })
            .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
        const {
            fiber_or_material_type_id,
            brand_id,
            producer_country,
            producer_id,
            producer_notes
        } = req.body

        const newFiber = {
            fiber_or_material_type_id,
            brand_id,
            producer_country,
            producer_id,
            producer_notes
        }

        for (const [key, value] of Object.entries(newFiber)) {
            if (value === undefined) {
                return res.status(400).json({ error: { message: `Missing '${key}' in request body` } })
            }
        }

        BrandsService.insertFiber(req.app.get('db'), newFiber)
            .then(fiber => {
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl + `/${fiber.id}` ))
                    .json(serializeFibers(fiber))
                    // .json(serializeBrands(brand))
            })
    })

brandsRouter
    .route('/:brand_id/notions')
    .all((req, res, next) => {
        BrandsService.getBrandById(
            req.app.get('db'),
            req.params.brand_id
        )
        .then(brand => {
            if (!brand) {
                return res.status(404).json({
                    error: { message: `Brand does not exist.`}
                })
            }
            res.brand = brand
            next()
        })
        .catch(next)
    })
    .get((req, res, next) => {
        BrandsService
            .getNotionsForBrands(
                req.app.get('db'),
                req.params.brand_id
            )
            .then(notions => {
                res.status(200).json(notions.map(serializeNotions))
            })
            .catch(next)

    })
    .post(jsonParser, (req, res, next) => {
        const {
            notion_type_id,
            brand_id,
            notion_factory_country,
            notion_factory_id,
            notion_factory_notes
        } = req.body

        const newNotion = {
            notion_type_id,
            brand_id,
            notion_factory_country,
            notion_factory_id,
            notion_factory_notes
        }

        for (const [key, value] of Object.entries(newNotion)) {
            if (value === undefined) {
                res.status(400).json({ error: { message: `Missing '${key}' in request body` } })
            }
        }

        BrandsService
            .insertNotion(req.app.get('db'), newNotion)
            .then(notion => {
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl + `/${notion.id}`))
                    .json(serializeNotions(notion))
            })
    })

module.exports = brandsRouter