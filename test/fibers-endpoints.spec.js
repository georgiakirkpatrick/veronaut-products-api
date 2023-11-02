describe('Fibers Endpoints', () => {
    const app = require('../src/app')
    const { expect } = require('chai')
    const knex = require('knex')
    const jwt = require('jsonwebtoken')
    const supertest = require('supertest')

    const { makeBrand, makeMalBrand } = require('./brands.fixtures')
    const { makeFactory, makeMalFactory } = require('./factories.fixtures')
    const { makeCertArray, makeMalCert } = require('./certifications.fixtures')
    const { 
        makeFiber, makeFibToCert, makeMalFibToMalCert, makeFiberType, 
        makeMalFiberType, makeMalFiber 
    } = require('./fibers.fixtures')
    const { hashedAdminArray, hashedUserArray, makeAdminArray, makeUserArray } = require('./users.fixtures')

    const { brandInsert } = makeBrand()
    const { certArrayInsert} = makeCertArray()
    const { factoryInsert } = makeFactory()
    const { fiberPost, fiberInsert, fiberGet } = makeFiber()
    const { malBrandInsert } = makeMalBrand()
    const { malCertInsert } = makeMalCert()
    const { malFactInsert } = makeMalFactory()
    const { malFiberPost, malFiberInsert, malFiberGet } = makeMalFiber()
    const { malFtInsert, malFtGet } = makeMalFiberType()
    const admin = makeAdminArray()[0]
    const { fibToCertArray, fibCertGet } = makeFibToCert()
    const { malFibToMalCert, malFibCertGet } = makeMalFibToMalCert()
    const { ftPost, ftInsert, ftGet } = makeFiberType()
    const hashAdminArray = hashedAdminArray()
    const hashUserArray = hashedUserArray()
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
    before('clean the table', () => db.raw('TRUNCATE table fiber_and_material_types, brands, certifications, factories, fibers_and_materials, fiber_and_material_types, fibers_to_certifications, users RESTART IDENTITY CASCADE'))
    afterEach('cleanup', () => db.raw('TRUNCATE table fiber_and_material_types, brands, certifications, factories, fibers_and_materials, fiber_and_material_types, fibers_to_certifications, users RESTART IDENTITY CASCADE'))

    describe('GET /api/fibers', () => {
        context('given there are fibers in the database', () => {
            beforeEach(() =>  db.into('brands').insert(brandInsert))
            beforeEach(() =>  db.into('factories').insert(factoryInsert))
            beforeEach(() =>  db.into('fiber_and_material_types').insert(ftInsert))
            beforeEach(() =>  db.into('fibers_and_materials').insert(fiberInsert))

            it('responds with 200 and returns all the fibers', () => {
                return supertest(app)
                    .get('/api/fibers')
                    .expect(200)
                    .expect(fiberGet)
            })
        })

        context('when there are no fibers in the database', () => {
            it('responds with 200 and an empty list', () => {
            
            return supertest(app)
                .get('/api/fibers')
                .expect(200)
                .expect([])
            })
        })

        context('given a malicious fiber', () => {
            beforeEach(() =>  db.into('brands').insert(malBrandInsert))
            beforeEach(() =>  db.into('factories').insert(malFactInsert))
            beforeEach(() =>  db.into('fiber_and_material_types').insert(malFtInsert))
            beforeEach(() =>  db.into('fibers_and_materials').insert(malFiberInsert))

            it('removes the attack content', () => {
                return supertest(app)
                    .get('/api/fibers')
                    .expect(200)
                    .expect(malFiberGet)
            })
        })
    })

    describe('GET /api/fibers/fiber-types', () => {
        context('given there are fiber types in the database', () => {
            beforeEach(() =>  db.into('fiber_and_material_types').insert(ftInsert))

            it('responds with 200 and all the fiber types', () => {
                return supertest(app)
                    .get('/api/fibers/fiber-types')
                    .expect(200)
                    .expect(ftGet)
            })
        })

        context('given there are no fiber types for the specified fiber', () => {
            it('responds with 200 and an empty list', () => {
                return supertest(app)
                    .get('/api/fibers/fiber-types')
                    .expect(200)
                    .expect([])
            })
        })

        context('given a malicious fiber type', () => {
            beforeEach(() =>  db.into('fiber_and_material_types').insert(malFtInsert))

            it('removes the attack content', () => {
                return supertest(app)
                    .get('/api/fibers/fiber-types')
                    .expect(200)
                    .expect(malFtGet)
            })
        })
    })

    describe('GET /api/fibers/:fiber_id', () => {
        const fiberId = 1

        context('given the fiber with id fiber_id exists', () => {
            beforeEach(() =>  db.into('brands').insert(brandInsert))
            beforeEach(() =>  db.into('factories').insert(factoryInsert))
            beforeEach(() =>  db.into('fiber_and_material_types').insert(ftInsert))
            beforeEach(() =>  db.into('fibers_and_materials').insert(fiberInsert))

            it('returns the fiber with id fiber_id', () => {
                return supertest(app)
                    .get(`/api/fibers/${fiberId}`)
                    .expect(200)
                    .expect(fiberGet[fiberId - 1])
            })
        })

        context('given the fiber with id fiber_id does not exist.', () => {
            it('responds with 404 and an error message', () => {
                return supertest(app)
                    .get(`/api/fibers/${fiberId}`)
                    .expect(404)
                    .expect({ error: { message: 'Fiber does not exist.' } })
            })
        })

        context('given the fiber with id fiber_id is a malicious fiber', () => {
            beforeEach(() =>  db.into('factories').insert(malFactInsert))
            beforeEach(() =>  db.into('brands').insert(malBrandInsert))
            beforeEach(() =>  db.into('fiber_and_material_types').insert(malFtInsert))
            beforeEach(() =>  db.into('fibers_and_materials').insert(malFiberInsert))

            const malFiberId = 666

            it('removes the attack content from the fiber with id fiber_id', () => {
                return supertest(app)
                    .get(`/api/fibers/${malFiberId}`)
                    .expect(200)
                    .expect(malFiberGet[0])
            })
        })
    })

    describe('GET /api/fibers/:fiber_id/certifications', () => {
        beforeEach(() =>  db.into('brands').insert(brandInsert))
        beforeEach(() =>  db.into('factories').insert(factoryInsert))
        beforeEach(() =>  db.into('fiber_and_material_types').insert(ftInsert))
        beforeEach(() =>  db.into('fibers_and_materials').insert(fiberInsert))
        const fiberId = 1

        context('given the fiber has certifications', () => {
            beforeEach(() =>  db.into('certifications').insert(certArrayInsert))
            beforeEach(() =>  db.into('fibers_to_certifications').insert(fibToCertArray))

            it(`responds with 200 and returns all the fiber's certifications`, () => {
                return supertest(app)
                    .get(`/api/fibers/${fiberId}/certifications`)
                    .expect(200)
                    .expect(fibCertGet)
            })
        })

        context('given the fiber does not have certifications', () => {
            it('responds with 200 and an empty array', () => {
                return supertest(app)
                    .get(`/api/fibers/${fiberId}/certifications`)
                    .expect(200)
                    .expect([])
            })
        })

        context('given a malicious certification', () => {
            beforeEach(() =>  db.into('brands').insert(malBrandInsert))
            beforeEach(() =>  db.into('factories').insert(malFactInsert))
            beforeEach(() =>  db.into('fiber_and_material_types').insert(malFtInsert))
            beforeEach(() =>  db.into('fibers_and_materials').insert(malFiberInsert))
            beforeEach(() =>  db.into('certifications').insert(malCertInsert))
            beforeEach(() =>  db.into('fibers_to_certifications').insert(malFibToMalCert))

            it('removes the attack content from the fiber with id fiber_id', () => {
                const fiberId = 666

                return supertest(app)
                    .get(`/api/fibers/${fiberId}/certifications`)
                    .expect(200)
                    .expect([ malFibCertGet ])
            })
        })
    })

    describe('Protected endpoints', () => {
        beforeEach(() =>  db.into('users').insert(hashUserArray))
        beforeEach(() =>  db.into('users').insert(hashAdminArray))
        const invalidSecret = 'bad-secret'
        const invalidUser =  { email: 'not-a-user', password: 'password' }
        const notAnAdmin = { email: user.email, password: user.password }
        const userNoCreds = { email: '', password: '' }
        const validUser = user
        const fiberId = fiberInsert.id
        const ProtPostPoints = [
            {
                name: 'POST /api/fibers',
                path: '/api/fibers'
            },
            {
                name: 'POST /api/fibers/fiber-types',
                path: '/api/fibers/fiber-types'
            },
            {
                name: 'POST /api/fibers/:fiber_id/certifications',
                path: `/api/fibers/${fiberId}/certifications`
            }
        ]

        ProtPostPoints.forEach(endpoint => {
            describe(endpoint.name, () => {
                beforeEach(() =>  db.into('fiber_and_material_types').insert(ftInsert))
                beforeEach(() =>  db.into('brands').insert(brandInsert))
                beforeEach(() =>  db.into('factories').insert(factoryInsert))
                beforeEach(() =>  db.into('fibers_and_materials').insert(fiberInsert))

                it(`responds with 401 and 'Missing bearer token' when no bearer token is provided`, () => {
                    return supertest(app)
                        .post(endpoint.path)
                        .send({})
                        .expect(401)
                        .expect({ error: 'Missing bearer token'})
                })

                it(`responds with 401 and 'Unauthorized request' when no credentials are in the token`, () => {
                    return supertest(app)
                        .post(endpoint.path)
                        .set('Authorization', makeAuthHeader(userNoCreds))
                        .send({})
                        .expect(401)
                        .expect({ error: 'Unauthorized request' })
                })
    
                it(`responds with 401 and 'Unauthorized request' when the JWT secret is invalid`, () => {
                    return supertest(app)
                        .post(endpoint.path)
                        .set('Authorization', makeAuthHeader(validUser, invalidSecret))
                        .send({})
                        .expect(401)
                        .expect({ error: 'Unauthorized request' })
                })
    
                it(`responds with 401 and 'Unauthorized request' when the user is invalid`, () => {
                    return supertest(app)
                        .post(endpoint.path)
                        .set('Authorization', makeAuthHeader(invalidUser))
                        .send({})
                        .expect(401)
                        .expect({ error: 'Unauthorized request' })
                })
            })
        })

        describe('PATCH /api/fibers/:fiber_id', () => {
            beforeEach(() =>  db.into('brands').insert(brandInsert))
            beforeEach(() =>  db.into('factories').insert(factoryInsert))
            beforeEach(() =>  db.into('fiber_and_material_types').insert(ftInsert))
            beforeEach(() =>  db.into('fibers_and_materials').insert(fiberInsert))

            it(`responds with 401 and 'Missing bearer token' when no bearer token is provided`, () => {
                return supertest(app)
                    .patch(`/api/fibers/${fiberId}`)
                    .send({})
                    .expect(401)
                    .expect({ error: 'Missing bearer token'})
            })

            it(`responds with 401 and 'Unauthorized request' when no credentials are in the token`, () => {
                return supertest(app)
                    .patch(`/api/fibers/${fiberId}`)
                    .set('Authorization', makeAuthHeader(userNoCreds))
                    .send({})
                    .expect(401)
                    .expect({ error: 'Unauthorized request' })
            })

            it(`responds with 401 and 'Unauthorized request' when the JWT secret is invalid`, () => {
                return supertest(app)
                    .patch(`/api/fibers/${fiberId}`)
                    .set('Authorization', makeAuthHeader(validUser, invalidSecret))
                    .send({})
                    .expect(401)
                    .expect({ error: 'Unauthorized request' })
            })

            it(`responds with 401 and 'Unauthorized request' when the user is invalid`, () => {
                return supertest(app)
                    .patch(`/api/fibers/${fiberId}`)
                    .set('Authorization', makeAuthHeader(invalidUser))
                    .send({})
                    .expect(401)
                    .expect({ error: 'Unauthorized request' })
            })

            it(`responds with 401 and 'Unauthorized request' when the user is not an admin`, () => {
                return supertest(app)
                    .patch(`/api/fibers/${fiberId}`)
                    .set('Authorization', makeAuthHeader(notAnAdmin))
                    .send({})
                    .expect(401)
                    .expect({ error: 'Unauthorized request' })
            })
        })

        describe('DELETE /api/fibers/:fiber_id', () => {
            beforeEach(() =>  db.into('fiber_and_material_types').insert(ftInsert))
            beforeEach(() =>  db.into('brands').insert(brandInsert))
            beforeEach(() =>  db.into('factories').insert(factoryInsert))
            beforeEach(() =>  db.into('fibers_and_materials').insert(fiberInsert))

            it(`responds with 401 and 'Missing bearer token' when no bearer token is provided`, () => {
                return supertest(app)
                    .delete(`/api/fibers/${fiberId}`)
                    .expect(401)
                    .expect({ error: 'Missing bearer token'})
            })

            it(`responds with 401 and 'Unauthorized request' when no credentials are in the token`, () => {
                return supertest(app)
                    .delete(`/api/fibers/${fiberId}`)
                    .set('Authorization', makeAuthHeader(userNoCreds))
                    .expect(401)
                    .expect({ error: 'Unauthorized request' })
            })

            it(`responds with 401 and 'Unauthorized request' when the JWT secret is invalid`, () => {
                return supertest(app)
                    .delete(`/api/fibers/${fiberId}`)
                    .set('Authorization', makeAuthHeader(validUser, invalidSecret))
                    .expect(401)
                    .expect({ error: 'Unauthorized request' })
            })

            it(`responds with 401 and 'Unauthorized request' when the user is invalid`, () => {
                return supertest(app)
                    .delete(`/api/fibers/${fiberId}`)
                    .set('Authorization', makeAuthHeader(invalidUser))
                    .expect(401)
                    .expect({ error: 'Unauthorized request' })
            })

            it(`responds with 401 and 'Unauthorized request' when the user is not an admin`, () => {
                return supertest(app)
                    .delete(`/api/fibers/${fiberId}`)
                    .set('Authorization', makeAuthHeader(notAnAdmin))
                    .expect(401)
                    .expect({ error: 'Unauthorized request' })
            })
        })
    })    

    describe('POST /api/fibers', () => {
        beforeEach(() =>  db.into('brands').insert(brandInsert))
        beforeEach(() =>  db.into('factories').insert(factoryInsert))
        beforeEach(() =>  db.into('fiber_and_material_types').insert(ftInsert))
        beforeEach(() => db.into('users').insert(hashUserArray))

        it('creates a fiber, responding with 201 and the new fiber', async () => {
            const postResponse = await supertest(app)
                .post(`/api/fibers`)
                .set('Authorization', makeAuthHeader(user))
                .send(fiberPost)

            const getResponse = await supertest(app)
                .get(`/api/fibers/${postResponse.body.id}`)

            const expected = new Date().toLocaleString()
            const postCreated = new Date(postResponse.body.created_at).toLocaleString()
            const postUpdated = new Date(postResponse.body.updated_at).toLocaleString()

            const expectedPostBody = {
                id: postResponse.body.id,
                ...fiberPost,
                approved_by_admin: false,
                created_at: postResponse.body.created_at,
                updated_at: postResponse.body.updated_at
            }

            const expectedGetBody = {
                ...fiberGet[0],
                approved_by_admin: false,
                created_at: postResponse.body.created_at,
                updated_at: postResponse.body.updated_at
            }

            expect(postResponse.status).to.eql(201)
            expect(postResponse.headers.location).to.eql(`/api/fibers/${postResponse.body.id}`)
            expect(postResponse.body.approved_by_admin).to.eql(false)
            expect(postResponse.body).to.eql(expectedPostBody)
            expect(postCreated).to.eql(expected)
            expect(postUpdated).to.eql(expected)
            expect(getResponse.status).to.eql(200)
            expect(getResponse.body).to.eql(expectedGetBody)
        })

        const requiredFields = [
            'fiber_or_material_type_id',
            'brand_id',
            'producer_country',
            'producer_id'    
        ]

        requiredFields.forEach(field => {
            const newFiber = {
                fiber_or_material_type_id: 1,
                brand_id: 1,
                producer_country: 1,
                producer_id: 1
            }

            it(`responds with 400 and an error message when the '${field}' is missing`, () => {
                delete newFiber[field]

                return supertest(app)
                    .post('/api/fibers')
                    .set('Authorization', makeAuthHeader(user))
                    .send(newFiber)
                    .expect(400)
                    .expect({ error: { message: `Missing '${field}' in request body`} })
            })
        })

        context('given a malicious fiber', () => {
            beforeEach(() =>  db.into('brands').insert(malBrandInsert))
            beforeEach(() =>  db.into('factories').insert(malFactInsert))
            beforeEach(() =>  db.into('fiber_and_material_types').insert(malFtInsert))

            it('removes the attack content from the response', async () => {
                const postResponse = await supertest(app)
                    .post(`/api/fibers`)
                    .set('Authorization', makeAuthHeader(user))
                    .send(malFiberPost)

                const getResponse = await supertest(app)
                    .get(`/api/fibers/${postResponse.body.id}`)

                const expected = new Date().toLocaleString()
                const postCreated = new Date(postResponse.body.created_at).toLocaleString()
                const postUpdated = new Date(postResponse.body.updated_at).toLocaleString()

                const expectedPostBody = {
                    id: postResponse.body.id,
                    ...malFiberPost,
                    production_notes: malFiberGet[0].production_notes,
                    approved_by_admin: false,
                    created_at: postResponse.body.created_at,
                    updated_at: postResponse.body.updated_at
                }

                const expectedGetBody = {
                    ...malFiberGet[0],
                    id: postResponse.body.id,
                    approved_by_admin: false,
                    created_at: postResponse.body.created_at,
                    updated_at: postResponse.body.updated_at
                }

                expect(postResponse.status).to.eql(201)
                expect(postResponse.headers.location).to.eql(`/api/fibers/${postResponse.body.id}`)
                expect(postResponse.body.approved_by_admin).to.eql(false)
                expect(postResponse.body).to.eql(expectedPostBody)
                expect(postCreated).to.eql(expected)
                expect(postUpdated).to.eql(expected)
                expect(getResponse.status).to.eql(200)
                expect(getResponse.body).to.eql(expectedGetBody)
            })
        })
    })

    describe('POST /api/fibers/fiber-types', () => {
        beforeEach(() => db.into('users').insert(hashUserArray))

        it('creates a fiber type, responding with 201 and the new fiber type', async () => {    
            const postResponse = await supertest(app)
                .post('/api/fibers/fiber-types')
                .set('Authorization', makeAuthHeader(user))
                .send(ftPost)

            const getResponse = await supertest(app)
                .get('/api/fibers/fiber-types')

            const expected = new Date().toLocaleString()
            const postCreated = new Date(postResponse.body.created_at).toLocaleString()
            const postUpdated = new Date(postResponse.body.updated_at).toLocaleString()

            const expectedPostBody = {
                id: postResponse.body.id,
                ...ftPost,
                approved_by_admin: false,
                created_at: postResponse.body.created_at,
                updated_at: postResponse.body.updated_at
            }

            const expectedGetBody = [
                {
                    ...expectedPostBody
                }
            ]

            expect(postResponse.status).to.eql(201)
            expect(postResponse.body.approved_by_admin).to.eql(false)
            expect(postResponse.body).to.eql(expectedPostBody)
            expect(postCreated).to.eql(expected)
            expect(postUpdated).to.eql(expected)
            expect(getResponse.status).to.eql(200)
            expect(getResponse.body).to.eql(expectedGetBody)
        })

        const requiredFields = [
            'english_name'        
        ]

        requiredFields.forEach(field => {
            const fiberType = {
                english_name: 'Piñatex'
            }

            it(`responds with 400 and an error message when the '${field}' is missing`, () => {
                delete fiberType[field]

                return supertest(app)
                    .post('/api/fibers/fiber-types')
                    .set('Authorization', makeAuthHeader(user))
                    .send(fiberType)
                    .expect(400)
                    .expect({ 
                        error: { message: `Missing '${field}' in request body`}
                    })
            })
        })

        it('removes the attack content from the response', () => {
            const malFiberType = {
                english_name: '<a>Bad fiber type</a>'
            }

            return supertest(app)
                .post('/api/fibers/fiber-types')
                .set('Authorization', makeAuthHeader(user))
                .send(malFiberType)
                .expect(201)
                .expect(res => { expect(res.body.english_name).to.eql('&lt;a&gt;Bad fiber type&lt;/a&gt;') })
        })
    })

    describe('POST /api/fibers/:fiber_id/certifications', () => {
        beforeEach(() =>  db.into('fiber_and_material_types').insert(ftInsert))
        beforeEach(() =>  db.into('brands').insert(brandInsert))
        beforeEach(() =>  db.into('factories').insert(factoryInsert))
        beforeEach(() =>  db.into('fibers_and_materials').insert(fiberInsert))
        beforeEach(() =>  db.into('certifications').insert(certArrayInsert))
        beforeEach(() =>  db.into('users').insert(hashUserArray))

        const fiberId = 1

        const fibCertPair = {
            certification_id: certArrayInsert[0].id,
        }

        it('pairs a fiber and certification, responding with 201 and the fiber-certification pair', async () => {
            const postResponse = await supertest(app)
                .post(`/api/fibers/${fiberId}/certifications`)
                .set('Authorization', makeAuthHeader(user))
                .send(fibCertPair)

            const getResponse = await supertest(app)
                .get(`/api/fibers/${fiberId}/certifications`)

            const expected = new Date().toLocaleString()
            const postCreated = new Date(postResponse.body.created_at).toLocaleString()
            const postUpdated = new Date(postResponse.body.updated_at).toLocaleString()

            const expectedPostBody = {
                fiber_or_material_id: fiberId,
                ...fibCertPair,
                approved_by_admin: false,
                created_at: postResponse.body.created_at,
                updated_at: postResponse.body.updated_at
            }

            const expectedGetBody = [
                {
                    ...fibCertGet[0]
                }
            ]

            expect(postResponse.status).to.eql(201)
            expect(postResponse.body.approved_by_admin).to.eql(false)
            expect(postResponse.body).to.eql(expectedPostBody)
            expect(postCreated).to.eql(expected)
            expect(postUpdated).to.eql(expected)
            expect(getResponse.status).to.eql(200)
            expect(getResponse.body).to.eql(expectedGetBody)
        })

        it(`returns 400 and an error message when the 'certification_id' is missing`, () => {
            delete fibCertPair['certification_id']

            return supertest(app)
                .post(`/api/fibers/${fiberId}/certifications`)
                .set('Authorization', makeAuthHeader(user))
                .send(fibCertPair)
                .expect(400)
                    .expect({ error: { message: `Missing 'certification_id' in request body`} })
        })
    })

    describe('PATCH /api/fibers/:fiber_id', () => {
        const fiberId = fiberInsert.id
        const fullUpdate = {
            ...fiberInsert,
            producer_country: 2,
            production_notes: 'New notes',
            approved_by_admin: false
        }

        context('given the fiber with id fiber_id exists', () => {
            beforeEach(() =>  db.into('fiber_and_material_types').insert(ftInsert))
            beforeEach(() =>  db.into('brands').insert(brandInsert))
            beforeEach(() =>  db.into('factories').insert(factoryInsert))
            beforeEach(() =>  db.into('fibers_and_materials').insert(fiberInsert))
            beforeEach(() => db.into('users').insert(hashAdminArray))

            it('updates the fiber and responds with 204', async () => {
                const expectedFiber = {
                    ...fiberGet[fiberId - 1],
                    ...fullUpdate
                }

                const patchResponse = await supertest(app)
                    .patch(`/api/fibers/${fiberId}`)
                    .set('Authorization', makeAuthHeader(admin))
                    .send(fullUpdate)

                const getResponse = await supertest(app)
                    .get(`/api/fibers/${fiberId}`)

                const created = new Date(getResponse.body.created_at).toLocaleString()
                const updated = new Date(getResponse.body.updated_at).toLocaleString()
                const expectedCreated = new Date(fullUpdate.created_at).toLocaleString()
                const expectedUpdated = new Date(fullUpdate.updated_at).toLocaleString()

                expect(patchResponse.status).to.eql(204)
                expect(getResponse.status).to.eql(200)
                expect(getResponse.body).to.eql(expectedFiber)      
                expect(created).to.eql(expectedCreated)
                expect(updated).to.eql(expectedUpdated)
            })
    
            it('responds with 400 and an error message when no required fields are supplied', () => {
                return supertest(app)
                    .patch(`/api/fibers/${fiberId}`)
                    .set('Authorization', makeAuthHeader(admin))
                    .send({})
                    .expect(400)
                    .expect({ error: { message: "Request body must contain 'fiber_or_material_type_id', 'brand_id', 'producer_country', 'producer_id', 'production_notes', and/or 'approved_by_admin'" } })
            })

            it('responds with 204 when updating only a subset of fields', async () => {
                const subsetUpdate = { production_notes: fullUpdate.production_notes }

                const patchResponse = await supertest(app)
                    .patch(`/api/fibers/${fiberId}`)
                    .set('Authorization', makeAuthHeader(admin))
                    .send(subsetUpdate)

                const getResponse = await supertest(app)
                    .get(`/api/fibers/${fiberId}`)

                const expectedFiber = {
                    ...fiberGet[0],
                    ...subsetUpdate
                }

                const created = new Date(getResponse.body.created_at).toLocaleString()
                const updated = new Date(getResponse.body.updated_at).toLocaleString()
                const expectedCreated = new Date(fiberInsert.created_at).toLocaleString()
                const expectedUpdated = new Date(fiberInsert.updated_at).toLocaleString()

                expect(patchResponse.status).to.eql(204)
                expect(getResponse.status).to.eql(200)
                expect(getResponse.body).to.eql(expectedFiber)      
                expect(created).to.eql(expectedCreated)
                expect(updated).to.eql(expectedUpdated)
            })
        })

        context('given the fiber with id fiber_id does not exist.', () => {
            const nonexistantId = fiberId + 1

            it('responds with 404 and an error message', () => {
                return supertest(app)
                    .patch(`/api/fibers/${nonexistantId}`)
                    .set('Authorization', makeAuthHeader(admin))
                    .send(fullUpdate)
                    .expect(404)
                    .expect({ error: { message: `Fiber does not exist.`} })
            })
        })
    })

    describe('DELETE /api/fibers/:fiber_id', () => {
        beforeEach(() => db.into('users').insert(hashAdminArray))
        const idToDelete = fiberInsert.id
        
        context('given the fiber with id fiber_id exists', () => {
            beforeEach(() =>  db.into('fiber_and_material_types').insert(ftInsert))
            beforeEach(() =>  db.into('brands').insert(brandInsert))
            beforeEach(() =>  db.into('factories').insert(factoryInsert))
            beforeEach(() =>  db.into('fibers_and_materials').insert(fiberInsert))

            it('removes the fiber and responds 204', async () => {
                const expectedFibers = fiberGet.filter(fiber => fiber.id !== idToDelete)

                const deleteResponse = await supertest(app)
                    .delete(`/api/fibers/${idToDelete}`)
                    .set('Authorization', makeAuthHeader(admin))
                    
                const getResponse = await supertest(app)
                    .get(`/api/fibers/${idToDelete}`)

                expect(deleteResponse.status).to.eql(204)
                expect(getResponse.status).to.eql(404)
            })
        })

        context('given the fiber with id fiber_id does not exist.', () => {
            beforeEach(() =>  db.into('fiber_and_material_types').insert(ftInsert))
            beforeEach(() =>  db.into('brands').insert(brandInsert))
            beforeEach(() =>  db.into('factories').insert(factoryInsert))
            beforeEach(() =>  db.into('fibers_and_materials').insert(fiberInsert))
            beforeEach(() => db.into('users').insert(hashUserArray))

            it('responds with 404 and an error message', () => {
                const nonexistantId = idToDelete + 1

                return supertest(app)
                    .delete(`/api/fabrics/${nonexistantId}`)
                    .set('Authorization', makeAuthHeader(admin))
                    .expect(404)
                    .expect({ error: { message: `Fabric does not exist.`} } )
            })
        })
    })
})