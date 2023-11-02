describe('Certifications Endpoints', function() {
    const app = require('../src/app')
    const { expect } = require('chai')
    const knex = require('knex')
    const jwt = require('jsonwebtoken')
    const supertest = require('supertest')

    const { makeCertArray, makeMalCert  } = require('./certifications.fixtures')
    const { hashedAdminArray, hashedUserArray, makeAdminArray, makeUserArray } = require('./users.fixtures')

    const { certPost, certArrayGet, certArrayInsert} = makeCertArray()
    const { malCertGet, malCertInsert, malCertPost } = makeMalCert()
    const hashAdminArray = hashedAdminArray()
    const hashUserArray = hashedUserArray()
    const admin = makeAdminArray()[0]
    const user = makeUserArray()[0]

    let db

    const makeAuthHeader = (user, secret = process.env.JWT_SECRET) => {
        const token = jwt.sign({ user_id: user.id }, secret, {
            subject: user.email,
            algorithm: 'HS256',
        })
        return `Bearer ${token}`
    }

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DATABASE_URL,
        })
        app.set('db', db)
    })

    after('disconnect from db', () => db.destroy())
    before('clean the table', () => db.raw('TRUNCATE table certifications, users RESTART IDENTITY CASCADE'))
    afterEach('cleanup', () => db.raw('TRUNCATE table certifications, users RESTART IDENTITY CASCADE'))

    describe('GET /api/certifications', () => {
        context('given there are certifications in the database', () => {
            beforeEach(() => db.into('certifications').insert(certArrayInsert))

            it('responds with 200 and all the certifications', () => {
                return supertest(app)
                    .get('/api/certifications')
                    .expect(200, certArrayGet)
            })
        })

        context('when there are no certifications in the database', () => {
            it('responds with 200 and an empty list', () => {
                return supertest(app)
                    .get('/api/certifications')
                    .expect(200)
                    .expect([])
            })
        })

        context('given a malicious certification', () => {
            beforeEach(() => db.into('certifications').insert(malCertInsert))
            
            it('removes the attack content', () => {
                return supertest(app)
                    .get('/api/certifications')
                    .expect(200)
                    .expect([malCertGet])
            })
        })
    })

    describe('GET /api/certifications/:certification_id', () => {
        const certId = certArrayInsert[0].id
        const malCertId = malCertInsert.id

        context('given the certification with id certification_id exists', () => {
            beforeEach(() => db.into('certifications').insert(certArrayInsert))
            it('responds with 200 and the certfication', () => {


                return supertest(app)
                    .get(`/api/certifications/${certId}`)
                    .expect(200)
                    .expect(certArrayInsert[certId - 1])
            })
        })

        context('when the certification with id certification_id does not exist.', () => {
            it('responds with 404 and an error message', () => {
                return supertest(app)
                    .get(`/api/certifications/${certId}`)
                    .expect(404, { error: { message: 'Certification does not exist.' } })
            })
        })

        context('when certification with certification_id is a malicious certification', () => {
            beforeEach(() => db.into('certifications').insert(malCertInsert))
            
            it('removes the attack content from the response', () => {
                return supertest(app)
                    .get(`/api/certifications/${malCertId}`)
                    .expect(200)
                    .expect(malCertGet)
            })
        })
    })

    describe('Protected endpoints', () => {
        beforeEach(() => db.into('users').insert(hashUserArray))
        beforeEach(() => db.into('users').insert(hashAdminArray))

        const invalidSecret = 'bad-secret'
        const invalidUser =  { email: 'not-a-user', password: 'password' }
        const notAnAdmin = { email: user.email, password: user.password }
        const userNoCreds = { email: '', password: '' }
        const validUser = user

        describe('POST /api/certifications/', () => {
            it(`responds with 401 and 'Missing bearer token' when no bearer token is provided`, () => {
                return supertest(app)
                    .post('/api/certifications')
                    .send({})
                    .expect(401, { error: 'Missing bearer token'})
            })

            it(`responds with 401 and 'Unauthorized request' when no credentials are in the token`, () => {
                return supertest(app)
                    .post('/api/certifications')
                    .set('Authorization', makeAuthHeader(userNoCreds))
                    .send({})
                    .expect(401, { error: 'Unauthorized request' })
            })

            it(`responds with 401 and 'Unauthorized request' when the JWT secret is invalid`, () => {
                return supertest(app)
                    .post('/api/certifications')
                    .set('Authorization', makeAuthHeader(validUser, invalidSecret))
                    .send({})
                    .expect(401, { error: 'Unauthorized request' })
            })

            it(`responds with 401 and 'Unauthorized request' when the user is invalid`, () => {                    
                return supertest(app)
                    .post('/api/certifications')
                    .set('Authorization', makeAuthHeader(invalidUser))
                    .expect(401, { error: 'Unauthorized request' })
            })
        })

        describe('PATCH /api/certifications/:certification_id', () => {
            beforeEach(() => db.into('certifications').insert(certArrayInsert))
            afterEach('cleanup', () => db.raw('TRUNCATE table certifications RESTART IDENTITY CASCADE'))

            it(`responds with 401 'Missing bearer token' when no bearer token is provided`, () => {
                return supertest(app)
                    .patch('/api/certifications/1')
                    .send({})
                    .expect(401, { error: 'Missing bearer token'})
            })

            it(`responds with 401 and 'Unauthorized request' when no credentials are in the token`, () => {
                return supertest(app)
                    .patch('/api/certifications/1')
                    .set('Authorization', makeAuthHeader(userNoCreds))
                    .send({})
                    .expect(401, { error: 'Unauthorized request' })
            })

            it(`responds with 401 and 'Unauthorized request' when the JWT secret is invalid`, () => {
                return supertest(app)
                    .patch('/api/certifications/1')
                    .set('Authorization', makeAuthHeader(validUser, invalidSecret))
                    .send({})
                    .expect(401, { error: 'Unauthorized request' })
            })

            it(`responds with 401 and 'Unauthorized request' when the user is invalid`, () => {                    
                return supertest(app)
                    .post('/api/certifications')
                    .set('Authorization', makeAuthHeader(invalidUser))
                    .send({})
                    .expect(401, { error: 'Unauthorized request' })
            })

            it(`responds with 401 and 'Unauthorized request' when the user is not an admin`, () => {
                return supertest(app)
                    .patch('/api/certifications/1')
                    .set('Authorization', makeAuthHeader(notAnAdmin))
                    .send({})
                    .expect(401, { error: 'Unauthorized request' })
            })
        })

        describe('DELETE /api/certifications/:certification_id', () => {
            beforeEach(() => db.into('certifications').insert(certArrayInsert))

            it(`responds with 401 'Missing bearer token' when no bearer token is provided`, () => {
                return supertest(app)
                    .delete('/api/certifications/1')
                    .expect(401, { error: 'Missing bearer token'})
            })

            it(`responds with 401 and 'Unauthorized request' when no credentials are in the token`, () => {
                return supertest(app)
                    .delete('/api/certifications/1')
                    .set('Authorization', makeAuthHeader(userNoCreds))
                    .expect(401, { error: 'Unauthorized request' })
            })

            it(`responds with 401 and 'Unauthorized request' when the JWT secret is invalid`, () => {
                return supertest(app)
                    .delete('/api/certifications/1')
                    .set('Authorization', makeAuthHeader(validUser, invalidSecret))
                    .expect(401, { error: 'Unauthorized request' })
            })

            it(`responds with 401 and 'Unauthorized request' when the user is invalid`, () => {                    
                return supertest(app)
                    .post('/api/certifications')
                    .set('Authorization', makeAuthHeader(invalidUser))
                    .expect(401, { error: 'Unauthorized request' })
            })

            it(`responds with 401 and 'Unauthorized request' when the user is not an admin`, () => {
                return supertest(app)
                    .delete('/api/certifications/1')
                    .set('Authorization', makeAuthHeader(notAnAdmin))
                    .expect(401, { error: 'Unauthorized request' })
            })
        })
    })

    describe('POST /api/certifications', () => {
        beforeEach(() => db.into('users').insert(hashUserArray))

        it('creates a certification, responding with 201 and the new certification', async () => {
            this.retries(3)

            const postResponse = await supertest(app)
                .post('/api/certifications')
                .set('Authorization', makeAuthHeader(user))
                .send(certPost)

            const getResponse = await supertest(app)
                .get(`/api/certifications/${postResponse.body.id}`)

            const expected = new Date().toLocaleString()
            const postCreated = new Date(postResponse.body.created_at).toLocaleString()
            const postUpdated = new Date(postResponse.body.updated_at).toLocaleString()

            const expectedPostBody = {
                id: postResponse.body.id,
                ...certPost,
                approved_by_admin: false,
                created_at: postResponse.body.created_at,
                updated_at: postResponse.body.updated_at
            }

            const expectedGetBody = expectedPostBody

            expect(postResponse.status).to.eql(201)
            expect(postResponse.headers.location).to.eql(`/api/certifications/${postResponse.body.id}`)
            expect(postResponse.body.approved_by_admin).to.eql(false)
            expect(postResponse.body).to.eql(expectedPostBody)
            expect(postCreated).to.eql(expected)
            expect(postUpdated).to.eql(expected)
            expect(getResponse.status).to.eql(200)
            expect(getResponse.body).to.eql(expectedGetBody)
        })    

        it(`responds with 400 and an error message when the 'english_name' is missing`, () => {
            const newCert = certPost
            delete newCert.english_name

            return supertest(app)
                .post('/api/certifications')
                .set('Authorization', makeAuthHeader(user))
                .send(newCert)
                .expect(400, {
                    error: { message: `Missing 'english_name' in request body`}
                })
        })

        context('given a malicious example', () => {
            it('removes the attack content from the response', async () => {
                this.retries(3)

                const postResponse = await supertest(app)
                    .post('/api/certifications')
                    .set('Authorization', makeAuthHeader(user))
                    .send(malCertPost)

                const getResponse = await supertest(app)
                    .get(`/api/certifications/${postResponse.body.id}`)

                const expected = new Date().toLocaleString()
                const postCreated = new Date(postResponse.body.created_at).toLocaleString()
                const postUpdated = new Date(postResponse.body.updated_at).toLocaleString()

                const expectedPostBody = {
                    ...malCertGet,
                    id: postResponse.body.id,
                    approved_by_admin: false,
                    created_at: postResponse.body.created_at,
                    updated_at: postResponse.body.updated_at
                }

                const expectedGetBody = expectedPostBody

                expect(postResponse.status).to.eql(201)
                expect(postResponse.headers.location).to.eql(`/api/certifications/${postResponse.body.id}`)
                expect(postResponse.body.approved_by_admin).to.eql(false)
                expect(postResponse.body).to.eql(expectedPostBody)
                expect(postCreated).to.eql(expected)
                expect(postUpdated).to.eql(expected)
                expect(getResponse.status).to.eql(200)
                expect(getResponse.body).to.eql(expectedGetBody)    
            })
        })
    })

    describe('PATCH /api/certifications/:certification_id', () => {
        beforeEach(() => db.into('certifications').insert(certArrayInsert))
        beforeEach(() => db.into('users').insert(hashAdminArray))
        const idToUpdate = certArrayInsert[0].id
        const certToUpdate = certArrayInsert.find(cert => cert.id === idToUpdate)
        const fullUpdate = {
            english_name: 'New Name',
            website: 'www.newsite.com',
            approved_by_admin: true
        }

        const subsetUpdate = {
            english_name: fullUpdate.english_name
        }

        context('given the certification with id certification_id exists', () => {
            it('updates the certification and responds with 204', async () => {
                const patchResponse = await supertest(app)
                    .patch(`/api/certifications/${idToUpdate}`)
                    .set('Authorization', makeAuthHeader(admin))
                    .send(fullUpdate)

                const getResponse = await supertest(app)
                    .get(`/api/certifications/${idToUpdate}`)
                
                const expectedCert = {
                    id: idToUpdate,
                    ...certToUpdate,
                    ...fullUpdate
                }

                const created = new Date(getResponse.body.created_at).toLocaleString()
                const updated = new Date(getResponse.body.updated_at).toLocaleString()
                const expectedCreated = new Date(expectedCert.created_at).toLocaleString()
                const expectedUpdated = new Date(expectedCert.updated_at).toLocaleString()

                expect(patchResponse.status).to.eql(204)
                expect(getResponse.status).to.eql(200)
                expect(getResponse.body).to.eql(expectedCert)      
                expect(created).to.eql(expectedCreated)
                expect(updated).to.eql(expectedUpdated)
            })

            it('responds with 400 and an error message when no required fields are supplied', () => {
                return supertest(app)
                    .patch(`/api/certifications/${idToUpdate}`)
                    .set('Authorization', makeAuthHeader(admin))
                    .send({ irreleventField: 'foo' })
                    .expect(400, { error: { message: `Request body must contain 'english_name', 'website', 'approved_by_admin', 'created_at', and/or 'updated_at'` } } )
            })

            it('responds with 204 when updating only a subset of fields', async () => {
                const patchResponse = await supertest(app)
                    .patch(`/api/certifications/${idToUpdate}`)
                    .set('Authorization', makeAuthHeader(admin))
                    .send(subsetUpdate)

                const getResponse = await supertest(app)
                    .get(`/api/certifications/${idToUpdate}`)
                
                const expectedCert = {
                    id: idToUpdate,
                    ...certToUpdate,
                    ...subsetUpdate
                }

                const created = new Date(getResponse.body.created_at).toLocaleString()
                const updated = new Date(getResponse.body.updated_at).toLocaleString()
                const expectedCreated = new Date(expectedCert.created_at).toLocaleString()
                const expectedUpdated = new Date(expectedCert.updated_at).toLocaleString()

                expect(patchResponse.status).to.eql(204)
                expect(getResponse.status).to.eql(200)
                expect(getResponse.body).to.eql(expectedCert)      
                expect(created).to.eql(expectedCreated)
                expect(updated).to.eql(expectedUpdated)
            })
        })

        context('when the certification does not exist.', () => {
            it('responds with 404 and an error message', () => {
                const idToUpdate = 123456
                return supertest(app)
                    .patch(`/api/certifications/${idToUpdate}`)
                    .set('Authorization', makeAuthHeader(admin))
                    .expect(404, { error: { message: 'Certification does not exist.' } })
            })
        })
    })

    describe('DELETE /api/certifications/:certification_id', () => {
        beforeEach(() => db.into('certifications').insert(certArrayInsert))
        beforeEach(() => db.into('users').insert(hashAdminArray))

        const idToDelete = certArrayInsert[0].id
        const expCertArray = certArrayGet.filter(certification => certification.id !== idToDelete)

        context('given the certification with id certification_id exists', () => {    
            it('removes the certification and responds with 204', async () => {
                const deleteResponse = await supertest(app)
                    .delete(`/api/certifications/${idToDelete}`)
                    .set('Authorization', makeAuthHeader(admin))
                    
                const getResponse = await supertest(app)
                    .get(`/api/certifications/${idToDelete}`)

                expect(deleteResponse.status).to.eql(204)
                expect(getResponse.status).to.eql(404)
            })
        })

        context('when the certification with id certification_id does not exist.', () => {
            it('responds with 404 and an error message', () => {
                const nonexistantId = 123

                return supertest(app)
                    .delete(`/api/certifications/${nonexistantId}`)
                    .set('Authorization', makeAuthHeader(admin))
                    .expect(404, { error: { message: `Certification does not exist.` } })
            })
        })
    })
})