const path = require('path')
const express = require('express')
const xss = require('xss').escapeHtml
const NotionsService = require('./notions-service')
const notionsRouter = express.Router()
const jsonParser = express.json()

const serializeNotions = notion => ({
    id: notion.id,
    notion_type_id: notion.notion_type_id,
    notion_type: xss(notion.type),
    brand_id: notion.brand_id,
    manufacturer_country: notion.manufacturer_country,
    manufacturer_id: notion.manufacturer_id,
    manufacturer_notes: xss(notion.manufacturer_notes),
    approved_by_admin: notion.approved_by_admin,
    date_published: notion.date_published
})

notionsRouter
    .route('/')
    .get((req, res, next) => {
        NotionsService
            .getAllNotions(req.app.get('db'))
            .then(notions => {
                res.json(notions.map(serializeNotions))
            })
            .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
        const {
            notion_type_id,
            brand_id,
            manufacturer_country,
            manufacturer_id,
            manufacturer_notes
        } = req.body

        const newNotion = {
            notion_type_id,
            brand_id,
            manufacturer_country,
            manufacturer_id,
            manufacturer_notes
        }

        for (const [key, value] of Object.entries(newNotion)) {
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
                    .json(serializeNotions(notion))
            })
    })

notionsRouter
    .route('/:notion_id')
    .all((req, res, next) => {
        NotionsService
            .getNotionById(
                req.app.get('db'),
                req.params.notion_id
            )
            .then(notion => {
                if (!notion) {
                    return res.status(404).json({
                        error: { message: `Notion does not exist` }
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
            notion_type: xss(res.notion.notion_type),
            brand_id: res.notion.brand_id,
            manufacturer_country: res.notion.manufacturer_country,
            manufacturer_id: res.notion.manufacturer_id,
            manufacturer_notes: xss(res.notion.manufacturer_notes),
            approved_by_admin: res.notion.approved_by_admin,
            date_published: res.notion.date_published
        })
        .catch(next)
    })
    .patch(jsonParser, (req, res, next) => {
        const {
            notion_type_id,
            brand_id,
            manufacturer_country,
            manufacturer_id,
            manufacturer_notes,
            approved_by_admin
        } = req.body

        const newNotionFields = {
            notion_type_id,
            brand_id,
            manufacturer_country,
            manufacturer_id,
            manufacturer_notes,
            approved_by_admin
        }

        const numberOfValues = Object.values(newNotionFields).filter(Boolean).length
        if (numberOfValues === 0) {
            return res.status(400).json({
                error: {
                    message: `Request body must contain 'notion_type_id', 'brand_id', 'manufacturer_country', 'manufacturer_id', 'manufacturer_notes', 'approved_by_admin'`
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
    .delete((req, res, next) => {
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
                    error: { message: `Notion does not exist` }
                })
            }
            res.notion = notion
            next()
        })
        .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
        const { certification_id } = req.body
        const fibCertPair = {
            notion_id: req.params.notion_id,
            certification_id
        }
        
        for (const [key, value] of Object.entries(fibCertPair)) {
            if (value === undefined) {
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body`}
                })
            }
        }

        NotionsService
            .insertNotionCert(
                req.app.get('db'),
                fibCertPair
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