describe('Notions Endpoints', () => {
    const app = require('../src/app')
    const { expect } = require('chai')
    const knex = require('knex')
    const jwt = require('jsonwebtoken')
    const supertest = require('supertest')
    const { hashedAdminArray, hashedUserArray } = require('./users.fixtures')
    const { makeBrand, makeMalBrand } = require('./brands.fixtures')
    const { makeFactory,makeMalFactory } = require('./factories.fixtures')
    const { makeFiberType, makeMalFiberType } = require('./fibers.fixtures')
    const { makeMalNotion, makeNotionType, makeNotion, makeMalNotionType, makeNotsToCerts, makeMalNotToMalCert } = require('./notions.fixtures')
    const { makeCertArray, makeMalCert } = require('./certifications.fixtures')
    const { makeAdminArray, makeUserArray } = require('./users.fixtures')
    const { brandInsert } = makeBrand()
    const { certArrayInsert, certArrayGet} = makeCertArray()
    const { malBrandInsert } = makeMalBrand()
    const { malCertGet, malCertInsert } = makeMalCert()
    const { malFactInsert } = makeMalFactory()
    const { malFtInsert } = makeMalFiberType()
    const { malNotionPost, malNotionInsert, malNotionGet } = makeMalNotion()
    const { notionPost, notionInsert, notionGet } = makeNotion()
    const { malNtPost, malNtInsert, malNtGet } = makeMalNotionType()
    const { ntPost, ntGet, ntInsert } = makeNotionType()
    const admin = makeAdminArray()[0]
    const {factoryInsert} = makeFactory()
    const { ftInsert } = makeFiberType()
    const hashAdminArray = hashedAdminArray()
    const hashUserArray = hashedUserArray()
    const notsToCerts = makeNotsToCerts()
    const user = makeUserArray()[0]

    let db

    const makeAuthHeader = (user, secret = process.env.JWT_SECRET) => {
        const token = jwt.sign({ user_id: user.id }, secret, {
            subject: user.email,
            algorithm: 'HS256',
        })
        return `Bearer ${token}`
    }

    const insertNotion = () => (
        Promise.all([
            db.into('brands').insert(brandInsert),
            db.into('notion_types').insert(ntInsert),
            db.into('fiber_and_material_types').insert(ftInsert),
            db.into('factories').insert(factoryInsert)
        ])
        .then(() => db.into('notions').insert(notionInsert))
    )

    const insertNotReqs = () => (
        Promise.all([
            db.into('brands').insert(brandInsert),
            db.into('notion_types').insert(ntInsert),
            db.into('fiber_and_material_types').insert(ftInsert),
            db.into('factories').insert(factoryInsert)
        ])
    )

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DATABASE_URL,
        })
        app.set('db', db)
    })

    after('disconnect from db', () => db.destroy())

    before('clean the table', () => db.raw(
        `TRUNCATE table notions, fabric_types, brands, fabrics, factories, fiber_and_material_types, 
        fibers_to_factories, fabrics_to_fibers_and_materials, notion_types,  certifications, 
        fabrics_to_certifications, users RESTART IDENTITY CASCADE`
    ))

    beforeEach(() => db.into('users').insert(hashUserArray))

    afterEach('cleanup', () => db.raw(
        `TRUNCATE table notions, fabric_types, brands, fabrics, factories, fiber_and_material_types, 
        fibers_to_factories, fabrics_to_fibers_and_materials, notion_types, certifications, 
        fabrics_to_certifications, users RESTART IDENTITY CASCADE`
    ))

    describe('GET /api/notions', () => {
        context('when there are notions in the database', () => {
            beforeEach(insertNotion)

            it('returns 200 and all the notions', async () => {
                const getResponse = await supertest(app)
                    .get('/api/notions')

                expect(getResponse.status).to.eql(200)
                expect(getResponse.body).to.eql(notionGet)
            })
        })

        context('when there are no notions in the database', () => {
            it('responds with 200 and an empty list', async () => {
                const getResponse = await supertest(app)
                    .get('/api/notions')

                expect(getResponse.status).to.eql(200)
                expect(getResponse.body).to.eql([])
            })
        })

        context('given a malicious notion', () => {
            beforeEach(() => db.into('brands').insert(malBrandInsert))
            beforeEach(() => db.into('notion_types').insert(malNtInsert))
            beforeEach(() => db.into('fiber_and_material_types').insert(malFtInsert))
            beforeEach(() => db.into('factories').insert(malFactInsert))
            beforeEach(() => db.into('notions').insert(malNotionInsert))

            it('removes the attack content', async () => {
               const getResponse = await supertest(app)
                    .get('/api/notions')
                
                expect(getResponse.status).to.eql(200)
                expect(getResponse.body[0]).to.eql(malNotionGet[0])
            })
        })
    })

    describe('GET /api/notions/notion-types', () => { 
        context('when there are notion types in the database', () => {
            beforeEach(() => db.into('notion_types').insert(ntInsert))

            it('returns 200 and all the notion types', async () => {
               const getResponse = await supertest(app)
                    .get('/api/notions/notion-types')

                expect(getResponse.status).to.eql(200)
                expect(getResponse.body).to.eql(ntGet)
            })
        })

        context('when there are no notion types in the database', () => {
            it('responds with 200 and an empty list', async () => {
               const getResponse = await supertest(app)
                    .get('/api/notions/notion-types')

                expect(getResponse.status).to.eql(200)
                expect(getResponse.body).to.eql([])    
            })
        })

        context('given a malicious notion type', () => {
            beforeEach(() => db.into('brands').insert(malBrandInsert))
            beforeEach(() => db.into('notion_types').insert(malNtInsert))
            beforeEach(() => db.into('fiber_and_material_types').insert(malFtInsert))
            beforeEach(() => db.into('factories').insert(malFactInsert))
            beforeEach(() => db.into('notions').insert(malNotionInsert))

            it('removes the attack content', async () => {
               const getResponse = await supertest(app)
                    .get('/api/notions/notion-types')

                expect(getResponse.status).to.eql(200)
                expect(getResponse.body).to.eql(malNtGet)
            })
        })
    })

    describe('GET /api/notions/:notion_id', () => {
        const notionId = notionInsert.id
        const malNotionId = malNotionInsert.id

        context('when the notion with id notion_id exists', () => {
            beforeEach(insertNotion)
            

            it('returns the notion with id notion_id', async () => {
               const getResponse = await supertest(app)
                    .get(`/api/notions/${notionId}`)

                expect(getResponse.status).to.eql(200)
                expect(getResponse.body).to.eql(notionGet[0])
            })
        })

        context('when the notion does not exist.', () => {
            it('responds with 404 and an error message', async () => {
               const getResponse = await supertest(app)
                    .get(`/api/notions/${notionId}`)

                expect(getResponse.status).to.eql(404)
                expect(getResponse.error.text).to.eql('{"error":{"message":"Notion does not exist."}}')
            })
        })

        context('given a malicious notion', () => {
            beforeEach(() => db.into('brands').insert(malBrandInsert))
            beforeEach(() => db.into('notion_types').insert(malNtInsert))
            beforeEach(() => db.into('fiber_and_material_types').insert(malFtInsert))
            beforeEach(() => db.into('factories').insert(malFactInsert))
            beforeEach(() => db.into('notions').insert(malNotionInsert))

            it('removes the attack content', async () => {
               const getResponse = await supertest(app)
                    .get(`/api/notions/${malNotionId}`)

                expect(getResponse.status).to.eql(200)
                expect(getResponse.body).to.eql(malNotionGet[0])
            })
        })
    })

    describe('GET /api/notions/:notion_id/certifications', () => {
        const notionId = 1

        context('when there are certifications in the database', () => {
            beforeEach(insertNotion)
            beforeEach(() =>  db.into('certifications').insert(certArrayInsert))
            beforeEach(() =>  db.into('notions_to_certifications').insert(notsToCerts))
            
            it('returns all the certifications', async () => {
               const getResponse = await supertest(app)
                    .get(`/api/notions/${notionId}/certifications`)

                expect(getResponse.status).to.eql(200)
                expect(getResponse.body).to.eql(certArrayInsert)
            })
        })

        context('when there are no certifications in the database', () => {
            beforeEach(insertNotion)

            it('responds with 200 and an empty list', async () => {
               const getResponse = await supertest(app)
                    .get(`/api/notions/${notionId}/certifications`)

                expect(getResponse.status).to.eql(200)
                expect(getResponse.body).to.eql([])    
            })
        })

        context('given a malicious certification', () => {
            const malNotToMalCert = makeMalNotToMalCert()

            beforeEach(() => db.into('brands').insert(malBrandInsert))
            beforeEach(() => db.into('notion_types').insert(malNtInsert))
            beforeEach(() => db.into('fiber_and_material_types').insert(malFtInsert))
            beforeEach(() => db.into('factories').insert(factoryInsert))
            beforeEach(() => db.into('notions').insert(malNotionInsert))
            beforeEach(() =>  db.into('certifications').insert(malCertInsert))
            beforeEach(() =>  db.into('notions_to_certifications').insert(malNotToMalCert))

            const malNotId = 666

            it('removes the attack content', async () => {
               const getResponse = await supertest(app)
                    .get(`/api/notions/${malNotId}/certifications`)

                expect(getResponse.status).to.eql(200)
                expect(getResponse.body).to.eql([ malCertGet ])
            })
        })
    })

    describe('Protected endpoints', () => {
        beforeEach(() => db.into('brands').insert(brandInsert))
        beforeEach(() => db.into('notion_types').insert(ntInsert))
        beforeEach(() => db.into('fiber_and_material_types').insert(ftInsert))
        beforeEach(() => db.into('factories').insert(factoryInsert))
        beforeEach(() =>  db.into('notions').insert(notionInsert))
        beforeEach(() =>  db.into('certifications').insert(malCertInsert))
        const invalidSecret = 'bad-secret'
        const invalidUser =  { email: 'not-a-user', password: 'password' }
        const notAnAdmin = { email: user.email, password: user.password }
        const userNoCreds = { email: '', password: '' }
        const validUser = user
        const notionId = notionInsert.id
        const ProtPostPoints = [
            {
                name: 'POST /api/notions',
                path: '/api/notions'
            },
            {
                name: 'POST /api/notions/notion-types',
                path: '/api/notions/notion-types'
            },
            {
                name: 'POST /api/notions/:notion_id/certifications',
                path: `/api/notions/${notionId}/certifications`
            }
        ]

        ProtPostPoints.forEach(endpoint => {
            describe(endpoint.name, () => {
                it(`responds with 401 and 'Missing bearer token' when no bearer token is provided`, async () => {
                    const postResponse = await supertest(app)
                        .post(endpoint.path)
                        .send({})

                    expect(postResponse.status).to.eql(401)
                    expect(postResponse.error.text).to.eql('{"error":"Missing bearer token"}')
                })

                it(`responds with 401 and 'Unauthorized request' when no credentials are in the token`, async () => {
                    const postResponse = await supertest(app)
                        .post(endpoint.path)
                        .set('Authorization', makeAuthHeader(userNoCreds))
                        .send({})

                    expect(postResponse.status).to.eql(401)
                    expect(postResponse.error.text).to.eql('{"error":"Unauthorized request"}')
                })
    
                it(`responds with 401 and 'Unauthorized request' when the JWT secret is invalid`, async () => {
                    const postResponse = await supertest(app)
                        .post(endpoint.path)
                        .set('Authorization', makeAuthHeader(validUser, invalidSecret))
                        .send({})

                    expect(postResponse.status).to.eql(401)
                    expect(postResponse.error.text).to.eql('{"error":"Unauthorized request"}')
                })
    
                it(`responds with 401 and 'Unauthorized request' when the user is invalid`, async () => {                    
                    const postResponse = await supertest(app)
                        .post(endpoint.path)
                        .set('Authorization', makeAuthHeader(invalidUser))

                    expect(postResponse.status).to.eql(401)
                    expect(postResponse.error.text).to.eql('{"error":"Unauthorized request"}')
                })
            })
        })

        describe('PATCH /api/notions/:notion_id', () => {
            it(`responds with 401 and 'Missing bearer token' when no bearer token is provided`, async () => {
               const patchResponse = await supertest(app)
                    .patch(`/api/notions/${notionId}`)
                    .send({})
                
                expect(patchResponse.status).to.eql(401)
                expect(patchResponse.error.text).to.eql('{"error":"Missing bearer token"}')
            })

            it(`responds with 401 and 'Unauthorized request' when no credentials are in the token`, async () => {
               const patchResponse = await supertest(app)
                    .patch(`/api/notions/${notionId}`)
                    .set('Authorization', makeAuthHeader(userNoCreds))
                    .send({})

                expect(patchResponse.status).to.eql(401)
                expect(patchResponse.error.text).to.eql('{"error":"Unauthorized request"}')
            })

            it(`responds with 401 and 'Unauthorized request' when the JWT secret is invalid`, async () => {
                const patchResponse = await supertest(app)
                    .patch(`/api/notions/${notionId}`)
                    .set('Authorization', makeAuthHeader(validUser, invalidSecret))
                    .send({})

                expect(patchResponse.status).to.eql(401)
                expect(patchResponse.error.text).to.eql('{"error":"Unauthorized request"}')
            })

            it(`responds with 401 and 'Unauthorized request' when the user is invalid`, async () => {                
                const patchResponse = await supertest(app)
                    .patch(`/api/notions/${notionId}`)
                    .set('Authorization', makeAuthHeader(invalidUser))
                    .send({})

                expect(patchResponse.status).to.eql(401)
                expect(patchResponse.error.text).to.eql('{"error":"Unauthorized request"}')            
            })

            it(`responds with 401 and 'Unauthorized request' when the user is not an admin`, async () => {
                const patchResponse = await supertest(app)
                    .patch(`/api/notions/${notionId}`)
                    .set('Authorization', makeAuthHeader(notAnAdmin))
                    .send({})

                expect(patchResponse.status).to.eql(401)
                expect(patchResponse.error.text).to.eql('{"error":"Unauthorized request"}')
            })
        })

        describe('DELETE /api/notions/:notion_id', () => {
            it(`responds with 401 and 'Missing bearer token' when no bearer token is provided`, async () => {
                const delResponse = await supertest(app)
                    .delete(`/api/notions/${notionId}`)

                expect(delResponse.status).to.eql(401)
                expect(delResponse.error.text).to.eql('{"error":"Missing bearer token"}')
            })

            it(`responds with 401 and 'Unauthorized request' when no credentials are in the token`, async () => {
                const delResponse = await supertest(app)
                    .delete(`/api/notions/${notionId}`)
                    .set('Authorization', makeAuthHeader(userNoCreds))

                    expect(delResponse.status).to.eql(401)
                    expect(delResponse.error.text).to.eql('{"error":"Unauthorized request"}')
            })

            it(`responds with 401 and 'Unauthorized request' when the JWT secret is invalid`, async () => {
                const delResponse = await supertest(app)
                    .delete(`/api/notions/${notionId}`)
                    .set('Authorization', makeAuthHeader(validUser, invalidSecret))

                    expect(delResponse.status).to.eql(401)
                    expect(delResponse.error.text).to.eql('{"error":"Unauthorized request"}')
            })

            it(`responds with 401 and 'Unauthorized request' when the user is invalid`, async () => {
                const delResponse = await supertest(app)
                    .delete(`/api/notions/${notionId}`)
                    .set('Authorization', makeAuthHeader(invalidUser))

                expect(delResponse.status).to.eql(401)
                expect(delResponse.error.text).to.eql('{"error":"Unauthorized request"}')
            })

            it(`responds with 401 and 'Unauthorized request' when the user is not an admin`, async () => {
                const delResponse = await supertest(app)
                    .delete(`/api/notions/${notionId}`)
                    .set('Authorization', makeAuthHeader(notAnAdmin))

                expect(delResponse.status).to.eql(401)
                expect(delResponse.error.text).to.eql('{"error":"Unauthorized request"}')
            })
        })
    })

    describe('POST /api/notions', () => {
        beforeEach(insertNotReqs)
        // beforeEach(() => db.into('brands').insert(brandInsert))
        // beforeEach(() => db.into('factories').insert(factoryInsert))
        // beforeEach(() => db.into('fiber_and_material_types').insert(ftInsert))
        // beforeEach(() => db.into('notion_types').insert(ntInsert))

        it('creates a new notion, returning 201 and the new notion', async function () {
            this.retries(3)
            
            const postResponse = await supertest(app)
                .post(`/api/notions`)
                .set('Authorization', makeAuthHeader(user))
                .send(notionPost)

            const getResponse = await supertest(app)
                .get(`/api/notions/${postResponse.body.id}`)

            const expected = new Date().toLocaleString()
            const created = new Date(postResponse.body.created_at).toLocaleString()
            const updated = new Date(postResponse.body.updated_at).toLocaleString()

            const expectedPostBody = {
                id: postResponse.body.id,
                ...notionPost,
                approved_by_admin: false,
                created_at: postResponse.body.created_at,
                updated_at: postResponse.body.updated_at
            }

            const expectedGet = {
                ...expectedPostBody,
                notion_type: ntInsert.english_name
            }

            expect(postResponse.status).to.eql(201)
            expect(postResponse.headers.location).to.eql(`/api/notions/${postResponse.body.id}`)
            expect(postResponse.body.approved_by_admin).to.eql(false)
            expect(postResponse.body).to.eql(expectedPostBody)
            expect(created).to.eql(expected)
            expect(updated).to.eql(expected)
            expect(getResponse.status).to.eql(200)
            expect(getResponse.body).to.eql(expectedGet)

        })

        const requiredFields = [
            'notion_type_id',
            'brand_id',
            'manufacturer_country',
            'manufacturer_id',
            'material_type_id',
            'material_origin_id',
            'material_producer_id'    
        ]

        requiredFields.forEach(field => {
            const newNotion = {
                notion_type_id: 1,
                brand_id: 2,
                manufacturer_country: 1,
                manufacturer_id: 1,
                manufacturer_notes: 'These are the notes.',
                material_type_id: 1,
                material_origin_id: 1,
                material_producer_id: 1,
                material_notes: 'These are the notes.'
            }

            it(`responds with 400 and an error message when the '${field}' is missing`, async () => {
                delete newNotion[field]

                const postResponse = await supertest(app)
                    .post('/api/notions')
                    .set('Authorization', makeAuthHeader(user))
                    .send(newNotion)
                
                expect(postResponse.status).to.eql(400)
                expect(postResponse.error.text).to.eql(`{"error":{"message":"Missing '${field}' in request body"}}`)
            })
        })

        context('given a malicious notion', () => {
            beforeEach(() => db.into('brands').insert(malBrandInsert))
            beforeEach(() => db.into('fiber_and_material_types').insert(malFtInsert))
            beforeEach(() => db.into('factories').insert(malFactInsert))
            beforeEach(() => db.into('notion_types').insert(malNtInsert))

            it('removes the attack content from the response', async function () {
                this.retries(3)

                const postResponse = await supertest(app)
                    .post('/api/notions')
                    .set('Authorization', makeAuthHeader(user))
                    .send(malNotionPost)
                    
                const getResponse = await supertest(app)
                    .get(`/api/notions/${postResponse.body.id}`)

                const expected = new Date().toLocaleString()
                const created = new Date(postResponse.body.created_at).toLocaleString()
                const updated = new Date(postResponse.body.updated_at).toLocaleString()
    
                const expectedPostBody = {
                    id: postResponse.body.id,
                    ...malNotionPost,
                    manufacturer_notes: malNotionGet[0].manufacturer_notes,
                    material_notes: malNotionGet[0].material_notes,
                    approved_by_admin: false,
                    created_at: postResponse.body.created_at,
                    updated_at: postResponse.body.updated_at
                }
    
                const expectedGet = {
                    ...expectedPostBody,
                    notion_type: malNotionGet[0].notion_type
                }

                expect(postResponse.status).to.eql(201)
                expect(postResponse.headers.location).to.eql(`/api/notions/${postResponse.body.id}`)
                expect(postResponse.body.approved_by_admin).to.eql(false)
                expect(postResponse.body).to.eql(expectedPostBody)
                expect(created).to.eql(expected)
                expect(updated).to.eql(expected)
                expect(getResponse.status).to.eql(200)
                expect(getResponse.body).to.eql(expectedGet)
            })
        })
    })

    describe('POST /api/notions/notion-types', () => {
        it('creates a new notion type, responding with 201 and the new notion type', async function () {
            this.retries(3)
            
            const postResponse = await supertest(app)
                .post('/api/notions/notion-types')
                .set('Authorization', makeAuthHeader(user))
                .send(ntPost)

            const getResponse = await supertest(app)
                .get('/api/notions/notion-types')

            const expected = new Date().toLocaleString()
            const created = new Date(postResponse.body.created_at).toLocaleString()
            const updated = new Date(postResponse.body.updated_at).toLocaleString()
            const expectedGet = [
                {
                    id: postResponse.body.id,
                    english_name: ntPost.english_name,
                    approved_by_admin: false,
                    created_at: postResponse.body.created_at,
                    updated_at: postResponse.body.updated_at
                }
            ]

            expect(postResponse.status).to.eql(201)
            expect(postResponse.body.approved_by_admin).to.eql(false)
            expect(created).to.eql(expected)
            expect(updated).to.eql(expected)
            expect(getResponse.status).to.eql(200)
            expect(getResponse.body).to.eql(expectedGet)

        })

        it(`responds with 400 and an error message when the 'english_name' field is missing`, async () => {
            const postResponse = await supertest(app)
                .post('/api/notions/notion-types')
                .set('Authorization', makeAuthHeader(user))
                .send({})

            expect(postResponse.status).to.eql(400)
            expect(postResponse.error.text).to.eql(`{"error":{"message":"Missing 'english_name' in request body"}}`)
        })

        context('given a malicious notion type', () => {
            it('removes the attack content from the response', async function () {
                this.retries(3)
                
                const postResponse = await supertest(app)
                    .post('/api/notions/notion-types')
                    .set('Authorization', makeAuthHeader(user))
                    .send(malNtPost)

                const getResponse = await supertest(app)
                    .get('/api/notions/notion-types') 

                const expected = new Date().toLocaleString()
                const created = new Date(postResponse.body.created_at).toLocaleString()
                const updated = new Date(postResponse.body.updated_at).toLocaleString()
                const expectedGet = [
                    {
                        id: postResponse.body.id,
                        english_name: malNtGet[0].english_name,
                        approved_by_admin: false,
                        created_at: postResponse.body.created_at,
                        updated_at: postResponse.body.updated_at
                    }
                ]

                expect(postResponse.status).to.eql(201)
                expect(postResponse.body.approved_by_admin).to.eql(false)
                expect(created).to.eql(expected)
                expect(updated).to.eql(expected)
                expect(getResponse.status).to.eql(200)
                expect(getResponse.body).to.eql(expectedGet)
            })
        })
    })

    describe('POST /api/notions/notion_id/certifications', () => {
        // before('clean the table', () => db.raw(`TRUNCATE table notion_types RESTART IDENTITY CASCADE`))
        beforeEach(insertNotion)
        beforeEach(() => db.into('certifications').insert(certArrayInsert))

        it('creates a notion-certification pair, responding with 201 and the notion-certification pair', async function () {
            this.retries(3)
            
            const notionId = 1
            const notCert = {
                certification_id: 1
            }

            const postResponse = await supertest(app)
                .post(`/api/notions/${notionId}/certifications`)
                .set('Authorization', makeAuthHeader(user))
                .send(notCert)

            const getResponse = await supertest(app)
                .get(`/api/notions/${notionId}/certifications`)

            const expected = new Date().toLocaleString()
            const created = new Date(postResponse.body.created_at).toLocaleString()
            const updated = new Date(postResponse.body.updated_at).toLocaleString()
            const makeCert = () => certArrayGet.find(cert => cert.id === notCert.certification_id)
            const cert1Get = makeCert()
            const expectedGet = [
                {
                    id: notCert.certification_id,
                    english_name: cert1Get.english_name,
                    website: cert1Get.website,
                    approved_by_admin: cert1Get.approved_by_admin,
                    created_at: cert1Get.created_at,
                    updated_at: cert1Get.updated_at
                }
            ]

            expect(postResponse.status).to.eql(201)
            expect(postResponse.body.notion_id).to.eql(notionId)
            expect(postResponse.body.certification_id).to.eql(notCert.certification_id)
            expect(postResponse.body.approved_by_admin).to.eql(false)
            expect(created).to.eql(expected)
            expect(updated).to.eql(expected)
            expect(getResponse.body).to.eql(expectedGet)
        })

        it(`responds with 400 and an error message when 'certification_id' is missing`, async () => {
            const notionId = 1

            const postResponse = await supertest(app)
                .post(`/api/notions/${notionId}/certifications`)
                .set('Authorization', makeAuthHeader(user))
                .send({})
                
                expect(postResponse.status).to.eql(400)
                expect(postResponse.error.text).to.eql(`{"error":{"message":"Missing 'certification_id' in request body"}}`)
        })
    })

    describe('PATCH /api/notions/:notion_id', () => {
        const idToUpdate = 1
        const fullUpdate = {
            notion_type_id: 1,
            brand_id: 1,
            manufacturer_country: 2,
            manufacturer_id: 1,
            manufacturer_notes: 'New notes',
            material_type_id: 1,
            material_origin_id: 2,
            material_producer_id: 1,
            material_notes: 'New notes',
            approved_by_admin: true
        }

        context(`given the notion with id notion_id' exists`, () => {
            beforeEach(insertNotion)
            beforeEach(() => db.into('users').insert(hashAdminArray))

            it('updates the notion and responds with 204', async function () {
                this.retries(3)
                
                const patchResponse = await supertest(app)
                    .patch(`/api/notions/${idToUpdate}`)
                    .set('Authorization', makeAuthHeader(admin))
                    .send(fullUpdate)

                const getResponse = await supertest(app)
                    .get(`/api/notions/${idToUpdate}`)
                
                const expectedNotion = {
                    id: idToUpdate,
                    ...fullUpdate,
                    notion_type: ntGet[0].english_name,
                    created_at: notionInsert.created_at,
                    updated_at: notionInsert.updated_at
                }

                const created = new Date(getResponse.body.created_at).toLocaleString()
                const updated = new Date(getResponse.body.updated_at).toLocaleString()
                const expectedCreated = new Date(notionInsert.created_at).toLocaleString()
                const expectedUpdated = new Date(notionInsert.updated_at).toLocaleString()

                expect(patchResponse.status).to.eql(204)
                expect(getResponse.status).to.eql(200)
                expect(getResponse.body).to.eql(expectedNotion)      
                expect(created).to.eql(expectedCreated)
                expect(updated).to.eql(expectedUpdated)
            })

            it('responds with 400 and an error message when no required fields are supplied', async () => {
                const patchResponse = await supertest(app)
                    .patch(`/api/notions/${idToUpdate}`)
                    .set('Authorization', makeAuthHeader(admin))
                    .send({})
                
                expect(patchResponse.status).to.eql(400)    
                expect(patchResponse.error.text).to.eql(`{"error":{"message":"Request body must contain 'notion_type_id', 'brand_id', 'manufacturer_country', 'manufacturer_id', 'manufacturer_notes', 'material_type_id', 'material_origin_id', 'material_producer_id','material_notes','approved_by_admin', 'created_at', or 'updated_at'."}}`)
            })

            it('responds with 204 when updating only a subset of fields', async function () {
                this.retries(3)

                const subsetUpdate = {
                    manufacturer_notes: fullUpdate.manufacturer_notes,
                    material_notes: fullUpdate.material_notes
                }

                const patchResponse = await supertest(app)
                    .patch(`/api/notions/${idToUpdate}`)
                    .set('Authorization', makeAuthHeader(admin))
                    .send(subsetUpdate)

                const getResponse = await supertest(app)
                    .get(`/api/notions/${idToUpdate}`)

                const expectedNotion = {
                    ...notionInsert,
                    ...subsetUpdate,
                    notion_type: ntGet[0].english_name,
                }    

                const created = new Date(getResponse.body.created_at).toLocaleString()
                const updated = new Date(getResponse.body.updated_at).toLocaleString()
                const expectedCreated = new Date(notionInsert.created_at).toLocaleString()
                const expectedUpdated = new Date(notionInsert.updated_at).toLocaleString()

                expect(patchResponse.status).to.eql(204)
                expect(getResponse.status).to.eql(200)
                expect(getResponse.body).to.eql(expectedNotion)      
                expect(created).to.eql(expectedCreated)
                expect(updated).to.eql(expectedUpdated)
                expect(getResponse.body.manufacturer_notes).to.eql(fullUpdate.manufacturer_notes)
                expect(getResponse.body.material_notes).to.eql(fullUpdate.material_notes)
            })
        })

        context(`given the notion with id notion_id does not exist.`, () => {
            beforeEach(insertNotReqs)

            it('responds with 404 and an error message', async () => {
                const patchResponse = await supertest(app)
                    .patch(`/api/notions/${idToUpdate}`)
                    .set('Authorization', makeAuthHeader(admin))
                    .send(fullUpdate)

                expect(patchResponse.status).to.eql(404)
                expect(patchResponse.error.text).to.eql(`{"error":{"message":"Notion does not exist."}}`)
            })
        })
    })

    describe('DELETE /api/notions/:notion_id', () => {
        beforeEach(insertNotion)
        beforeEach(() => db.into('users').insert(hashAdminArray))
        const idToDelete = notionInsert.id

        context(`when the notion with id notion_id' exists`, () => {
            it('responds with 204 and removes the notion', async () => {
                const deleteResponse = await supertest(app)
                    .delete(`/api/notions/${idToDelete}`)
                    .set('Authorization', makeAuthHeader(admin))
                    
                const getResponse = await supertest(app)
                    .get(`/api/notions/${idToDelete}`)

                expect(deleteResponse.status).to.eql(204)
                expect(getResponse.status).to.eql(404)
            })
        })

        context(`when the notion with id notion_id does not exist.`, () => {
            it('responds with 404 and an error message', async () => {
                const nonexistantId = 123

                const delResponse = await supertest(app)
                    .delete(`/api/notions/${nonexistantId}`)
                    .set('Authorization', makeAuthHeader(admin))

                expect(delResponse.status).to.eql(404)
                expect(delResponse.error.text).to.eql('{"error":{"message":"Notion does not exist."}}')
            })
        })
    })
})