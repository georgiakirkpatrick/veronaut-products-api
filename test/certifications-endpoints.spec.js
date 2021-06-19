const knex = require('knex')
const app = require('../src/app')
const supertest = require('supertest')
const { expect } = require('chai')
const { makeCertificationArray, makeMalCertification  } = require('./certifications.fixtures')

describe('Certifications Endpoints', function() {
    const certifications = makeCertificationArray()
    const { malCertification, expectedCertification } = makeMalCertification()
    
    let db

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DATABASE_URL,
        })
        app.set('db', db)
    })

    after('disconnect from db', () => db.destroy())
    before('clean the table', () => db.raw('TRUNCATE table certifications RESTART IDENTITY CASCADE'))
    afterEach('cleanup', () => db.raw('TRUNCATE table certifications RESTART IDENTITY CASCADE'))

    describe('GET /api/certifications', () => {
        context('when there are certifications in the database', () => {
            beforeEach(() => db.into('certifications').insert(certifications))

            it('returns all the certifications', () => {
                return supertest(app)
                    .get('/api/certifications')
                    .expect(200, certifications)
            })
        })

        context('when there are no certifications in the database', () => {
            it('responds with 200 and an empty list', () => {
                return supertest(app)
                    .get('/api/certifications')
                    .expect(200, [])
            })
        })

        context('given a malicious certification', () => {
            beforeEach(() => db.into('certifications').insert(malCertification))
            
            it('removes the attack content', () => {
                return supertest(app)
                    .get('/api/certifications')
                    .expect(200)
                    .expect(res => {
                        expect(res.body[0].english_name).to.eql(expectedCertification.english_name)
                        expect(res.body[0].website).to.eql(expectedCertification.website)
                    })
            })
        })
    })

    describe('GET /api/certifications/:certification_id', () => {
        context('when the certification with id certification_id exists', () => {
            beforeEach(() => db.into('certifications').insert(certifications))

            it('responds with the certfication', () => {
                const certificationId = 1

                return supertest(app)
                    .get(`/api/certifications/${certificationId}`)
                    .expect(200, certifications[certificationId - 1])
            })
        })

        context('when the certification with id certification_id does not exist', () => {
            const certificationId = 1

            it('responds with 404 and an error message', () => {
                return supertest(app)
                    .get(`/api/certifications/${certificationId}`)
                    .expect(404, { error: { message: 'Certification does not exist' } })
            })
        })

        context('when certification with certification_id is a malicious certification', () => {
            beforeEach(() => db.into('certifications').insert(malCertification))
            const certificationId = 666
            it('removes the attack content in the response', () => {
                return supertest(app)
                    .get(`/api/certifications/${certificationId}`)
                    .expect(200)
                    .expect(res => {
                        expect(res.body.english_name).to.eql(expectedCertification.english_name)
                        expect(res.body.website).to.eql(expectedCertification.website)
                    })
            })
        })
    })

    describe('POST /api/certifications', () => {
        const newCertification = {
            english_name: 'Organic',
            website: 'www.organic.com',
            approved_by_admin: true
        }

        it('creates a certification, responding with 201 and the new certification', () => {
            return supertest(app)
                .post('/api/certifications')
                .send(newCertification)
                .expect(201)
                .expect(res => {
                    expect(res.body.english_name).to.eql(newCertification.english_name)
                    expect(res.body.website).to.eql(newCertification.website)
                    expect(res.body.approved_by_admin).to.eql(newCertification.approved_by_admin)
                    const expected = new Date().toLocaleString()
                    const actual = new Date(res.body.date_published).toLocaleString()
                    expect(actual).to.eql(expected)
                })
                .then(res => {
                    supertest(app)
                        .get(`/api/certifications/${res.body.id}`)
                        .expect(res.body)
                })
        })    

        const requiredFields = [
            'english_name',
            'website'

        ]

        requiredFields.forEach(field => {
            const newCertification = {
                english_name: 'Zara',
                website: 'www.zara.com'
            }

            it(`responds with 400 and an error message when the '${field}' is missing`, () => {
                delete newCertification[field]

                return supertest(app)
                    .post('/api/certifications')
                    .send(newCertification)
                    .expect(400, {
                        error: { message: `Missing '${field}' in request body`}
                    })
            })
        })

        it('removes XSS attack content from the response', () => {
            const { malCertification, expectedCertification } = makeMalCertification()

            return supertest(app)
                .post('/api/certifications')
                .send(malCertification)
                .expect(201)
                .expect(res => {
                    expect(res.body.english_name).to.eql(expectedCertification.english_name)
                    expect(res.body.website).to.eql(expectedCertification.website)
                })
        })
    })

    describe('PATCH /api/certifications/:certification_id', () => {
        beforeEach(() => db.into('certifications').insert(certifications))

        context('given there the certification exists', () => {
            const idToUpdate = 1
            const updateCertification = {
                english_name: 'Moganic',
                website: 'www.Moganic.com',
                approved_by_admin: false
            }

            it('updates the certification and responds 204', () => {
                return supertest(app)
                    .patch(`/api/certifications/${idToUpdate}`)
                    .send(updateCertification)
                    .expect(204)
                    .then(res => {
                        supertest(app)
                            .get(`/api/certifications/${idToUpdate}`)
                            .expect(res => {
                                expect(res.body.english_name).to.eql(updateCertification.english_name)
                                expect(res.body.website).to.eql(updateCertification.website)
                                expect(res.body.approved_by_admin).to.eql(updateCertification.approved_by_admin)
                            })
                    })
            })

            it('responds with 400 when no required fields are supplied', () => {
                return supertest(app)
                    .patch(`/api/certifications/${idToUpdate}`)
                    .send({ irreleventField: 'foo' })
                    .expect(400, { error: { message: `Request body must contain 'english_name', 'website', and/or 'approved_by_admin'` } } )
            })

            it('responds with 204 when updating only a subset of fields', () => {
                return supertest(app)    
                    .patch(`/api/certifications/${idToUpdate}`)
                    .send({ english_name: 'Moganic' })
                    .expect(204)
                    .then(res => {
                        supertest(app)
                            .get(`/api/certifications/${idToUpdate}`)
                            .expect(res => {
                                expect(res.body.english_name).to.eql(updateCertification.english_name)
                            })
                    })
            })
        })

        context('given the certification does not exist', () => {
            it('responds with 404', () => {
                const idToUpdate = 123456
                return supertest(app)
                    .patch(`/api/certifications/${idToUpdate}`)
                    .expect(404, { error: { message: 'Certification does not exist' } })
            })
        })
    })

    describe('DELETE /api/certifications/:certification_id', () => {
        beforeEach(() => db.into('certifications').insert(certifications))
        const idToDelete = 1
        const expectedCertifications = certifications.filter(certification => certification.id !== idToDelete)

        context('given the certification exists', () => {
            it('removes the certification and responds 204', () => {
                return supertest(app)
                    .delete(`/api/certifications/${idToDelete}`)
                    .expect(204)
                    .then(res => {
                        supertest(app)
                            .get('/api/certifications')
                            .expect(expectedCertifications)
                    })
            })
        })

        context('given the certification does not exist', () => {
            it('responds with 404', () => {
                const idToDelete = 123456

                return supertest(app)
                    .delete(`/api/certifications/${idToDelete}`)
                    .expect(404, { error: { message: `Certification does not exist` } })
            })
        })
    })
})