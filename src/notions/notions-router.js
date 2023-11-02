const { requireAuth, requireAdmin } = require('../middleware/jwt-auth')
const express = require('express')
const jsonParser = express.json()
const notionsRouter = express.Router()
const NotionsService = require('./notions-service')
const path = require('path')
const xss = require('xss').escapeHtml

const serializeNotionGet = notion => ({
    id: notion.id,
    notion_type_id: notion.notion_type_id,
    notion_type: notion.type ? xss(notion.type) : null,
    brand_id: notion.brand_id,
    manufacturer_country: notion.manufacturer_country,
    manufacturer_id: notion.manufacturer_id,
    manufacturer_notes: notion.manufacturer_notes ? xss(notion.manufacturer_notes) : null,
    material_type_id: notion.material_type_id,
    material_origin_id: notion.material_origin_id,
    material_producer_id: notion.material_producer_id,
    material_notes: notion.material_notes ? xss(notion.material_notes) : null,
    approved_by_admin: notion.approved_by_admin,
    created_at: notion.created_at,
    updated_at: notion.updated_at
})

const serializeNotionPost = notion => ({
    id: notion.id,
    notion_type_id: notion.notion_type_id,
    brand_id: notion.brand_id,
    manufacturer_country: notion.manufacturer_country,
    manufacturer_id: notion.manufacturer_id,
    manufacturer_notes: notion.manufacturer_notes ? xss(notion.manufacturer_notes) : null,
    material_type_id: notion.material_type_id,
    material_origin_id: notion.material_origin_id,
    material_producer_id: notion.material_producer_id,
    material_notes: notion.material_notes ? xss(notion.material_notes) : null,
    approved_by_admin: notion.approved_by_admin,
    created_at: notion.created_at,
    updated_at: notion.updated_at
})

const serializeNotTypes = notionType => ({
    id: notionType.id,
    english_name: notionType.english_name ? xss(notionType.english_name) : null,
    approved_by_admin: notionType.approved_by_admin,
    created_at: notionType.created_at,
    updated_at: notionType.updated_at
})

const serializeCerts = cert => ({
    id: cert.id,
    english_name: xss(cert.english_name),
    website: cert.website ? xss(cert.website) : null,
    approved_by_admin: cert.approved_by_admin,
    created_at: cert.created_at,
    updated_at: cert.updated_at
})

notionsRouter
    .route('/')
    .get((req, res, next) => {
        NotionsService
            .getAllNotions(req.app.get('db'))
            .then(notions => {
                res.json(notions.map(serializeNotionGet))
            })
            .catch(next)
    })
    .post(requireAuth, jsonParser, (req, res, next) => {
        const {
            id,
            notion_type_id,
            brand_id,
            manufacturer_country,
            manufacturer_id,
            manufacturer_notes,
            material_type_id,
            material_origin_id,
            material_producer_id,
            material_notes,
            approved_by_admin
        } = req.body

        const newNotion = {
            id,
            notion_type_id,
            brand_id,
            manufacturer_country,
            manufacturer_id,
            manufacturer_notes,
            material_type_id,
            material_origin_id,
            material_producer_id,
            material_notes,
            approved_by_admin
        }

        const requiredFields = { 
            notion_type_id,
            brand_id,
            manufacturer_country,
            manufacturer_id,
            material_type_id,
            material_origin_id,
            material_producer_id
        }

        for (const [key, value] of Object.entries(requiredFields)) {
            if (value === undefined) {
                res.status(400).json({ error: { message: `Missing '${key}' in request body` } })
            }
        }

        NotionsService
            .insertNotion(req.app.get('db'), newNotion)
            .then(notion => {
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl + `/${notion.id}`))
                    .json(serializeNotionPost(notion))
            })
            .catch(next)
    })

notionsRouter
    .route('/notion-types')
    .get((req, res, next) => {
        NotionsService
            .getAllNotTypes(
                req.app.get('db')
            )
            .then(notionTypes => {
                res.json(notionTypes.map(serializeNotTypes))
            })
            .catch(next)
    })
    .post(requireAuth, jsonParser, (req, res, next) => {
        const {
            id,
            english_name, 
            approved_by_admin,
            created_at,
            updated_at
        } = req.body

        const newNotionType = {
            id,
            english_name, 
            approved_by_admin,
            created_at,
            updated_at
        }

        if (newNotionType.english_name === undefined) {

            return res.status(400).json({
                error: { message: `Missing 'english_name' in request body`}
            })
        }

        NotionsService
            .insertNotType(
                req.app.get('db'),
                newNotionType
            )
            .then(notionType => {
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl + `/${notionType.id}`))
                    .json(serializeNotTypes(notionType))
                    
            })
            .catch(next)
    })    

notionsRouter
    .route('/:notion_id')
    .all((req, res, next) => {
        NotionsService.getNotionById(
            req.app.get('db'),
            req.params.notion_id
        )
        .then(notion => {
            if (!notion) {
                return res.status(404).json({
                    error: { message: `Notion does not exist.` }
                })
            }
            res.notion = notion
            next()
        })
        .catch(next)
    })
    .get((req, res, next) => {
        res.json({
            id: res.notion.id,
            notion_type_id: res.notion.notion_type_id,
            notion_type: res.notion.type ? xss(res.notion.type) : null,
            brand_id: res.notion.brand_id,
            manufacturer_country: res.notion.manufacturer_country,
            manufacturer_id: res.notion.manufacturer_id,
            manufacturer_notes: res.notion.manufacturer_notes ? xss(res.notion.manufacturer_notes) : null,
            material_type_id: res.notion.material_type_id,
            material_origin_id: res.notion.material_origin_id,
            material_producer_id: res.notion.material_producer_id,
            material_notes: res.notion.material_notes ? xss(res.notion.material_notes) : null,
            approved_by_admin: res.notion.approved_by_admin,
            created_at: res.notion.created_at,
            updated_at: res.notion.updated_at
        })
        next()
    })
    .patch(requireAdmin, jsonParser, (req, res, next) => {
        const {
            notion_type_id,
            brand_id,
            manufacturer_country,
            manufacturer_id,
            manufacturer_notes,
            material_type_id,
            material_origin_id,
            material_producer_id,
            material_notes,
            approved_by_admin
        } = req.body

        const newNotionFields = {
            notion_type_id,
            brand_id,
            manufacturer_country,
            manufacturer_id,
            manufacturer_notes,
            material_type_id,
            material_origin_id,
            material_producer_id,
            material_notes,
            approved_by_admin
        }

        const numberOfValues = Object.values(newNotionFields).filter(Boolean).length

        if (numberOfValues === 0) {
            return res.status(400).json({
                error: {
                    message: `Request body must contain 'notion_type_id', 'brand_id', 'manufacturer_country', 'manufacturer_id', 'manufacturer_notes', 'material_type_id', 'material_origin_id', 'material_producer_id','material_notes','approved_by_admin', 'created_at', or 'updated_at'.`
                }
            })
        }
        
        NotionsService
            .updateNotion(
                req.app.get('db'),
                req.params.notion_id,
                newNotionFields
            )
            .then(numRowsAffected => {
                res.status(204).end()
            })
            .catch(next)
    })
    .delete(requireAdmin, jsonParser, (req, res, next) => {
        NotionsService
            .deleteNotion(
                req.app.get('db'),
                req.params.notion_id
            )
            .then(() => {
                res.status(204).end()
            })
            .catch(next)
    })

notionsRouter
    .route('/:notion_id/certifications')
    .all((req, res, next) => {
        NotionsService.getNotionById(
            req.app.get('db'),
            req.params.notion_id
        )
        .then(notion => {
            if (!notion) {
                return res.status(404).json({
                    error: { message: `Notion does not exist.` }
                })
            }
            res.notion = notion
            next()
        })
        .catch(next)
    })
    .get((req, res, next) => {
        NotionsService
            .getCertsForNot(
                req.app.get('db'),
                req.params.notion_id
            )
            .then(certs => {
                res.json(certs.map(serializeCerts))
            })
            .catch(next)
    })
    .post(requireAuth, jsonParser, (req, res, next) => {
        const { certification_id } = req.body
        const notCertPair = {
            notion_id: req.params.notion_id,
            certification_id
        }
        const requiredFields = {
            certification_id
        }
        
        for (const [key, value] of Object.entries(requiredFields)) {
            if (value === undefined) {
                return res.status(400).json({
                    error: { message: `Missing 'certification_id' in request body`}
                })
            }
        }

        NotionsService
            .insertNotCert(
                req.app.get('db'),
                notCertPair
            )
            .then(notionCert => {

                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl))
                    .json(notionCert)
            })
            .catch(next)
    })

module.exports = notionsRouter