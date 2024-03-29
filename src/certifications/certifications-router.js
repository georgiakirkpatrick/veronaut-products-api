const express = require('express')
const { requireAuth, requireAdmin } = require('../middleware/jwt-auth')
const CertificationsService = require('./certifications-service')
const certificationsRouter = express.Router()
const jsonParser = express.json()
const path = require('path')
const xss = require('xss').escapeHtml


const serializeCertifications = certification => ({
    id: certification.id,
    english_name: xss(certification.english_name),
    website: xss(certification.website),
    approved_by_admin: certification.approved_by_admin,
    created_at: certification.created_at,
    updated_at: certification.updated_at
})

certificationsRouter
    .route('/')
    .get((req, res, next) => {
        CertificationsService
            .getAllCertifications(
                req.app.get('db')
            )
            .then(certifications => {
                res.json(certifications.map(serializeCertifications))
            })
            .catch(next)
    })
    .post(requireAuth, jsonParser, (req, res, next) => {
        const { 
            english_name,
            website,
            approved_by_admin
        } = req.body

        const newCertification = {
            english_name,
            website,
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

        CertificationsService
            .insertCertification(
                req.app.get('db'),
                newCertification
            )
            .then(certification => {
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl + `/${certification.id}`))
                    .json(serializeCertifications(certification))
            })
            .catch(next)
    })

certificationsRouter
    .route('/:certification_id')
    .all((req, res, next) => {
        CertificationsService.getCertificationById(
            req.app.get('db'),
            req.params.certification_id
        )
        .then(certification => {
            if (!certification) {
                return res.status(404).json({
                    error: { message: `Certification does not exist.` }
                })
            }
            res.certification = certification
            next()
        })
        .catch(next)
    })
    .get((req, res, next) => {
        res.json(serializeCertifications(res.certification))
        next()
    })
    .patch(requireAdmin, jsonParser, (req, res, next) => {
        const {
            english_name,
            website,
            approved_by_admin
        } = req.body

        const certificationToUpdate = {
            english_name,
            website,
            approved_by_admin
        }

        const numberOfValues = Object.values(certificationToUpdate).filter(Boolean).length
        if (numberOfValues === 0) {
            return res.status(400).json({
                error: { 
                    message: `Request body must contain 'english_name', 'website', 'approved_by_admin', 'created_at', and/or 'updated_at'`
                }
            })
        }
        
        CertificationsService
            .updateCertification(
                req.app.get('db'),
                req.params.certification_id,
                certificationToUpdate
            )
            .then(numRowsAffected => {
                res.status(204).end()
            })
            .catch(next)
    })
    .delete(requireAdmin, (req, res, next) => {
        CertificationsService
            .deleteCertification(
                req.app.get('db'),
                req.params.certification_id
            )
            .then(() => {
                res.status(204).end()
            })
            .catch(next)
    })

module.exports = certificationsRouter