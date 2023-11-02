describe('Fabrics Endpoints', () => {
    const app = require('../src/app')
    const { expect } = require('chai')
    const knex = require('knex')
    const jwt = require('jsonwebtoken')
    const supertest = require('supertest')
    const { makeBrand, makeMalBrand } = require('./brands.fixtures')
    const { makeCertArray, makeMalCert } = require('./certifications.fixtures')
    const { makeFabric, makeFabToFib, makeFabToCert, makeFibToFact, makeFabToFact, makeMalFabric,
        makeMalFibToFact, makeMalFabToMalFib, makeFabToMalCert, makeMalFabToMalFact } = require('./fabrics.fixtures')
    const { makeFactory, makeMalFactory } = require('./factories.fixtures')
    const { makeFiber, makeFiberType, makeMalFiber, makeMalFiberType } = require('./fibers.fixtures')
    const { hashedAdminArray, hashedUserArray, makeAdminArray, makeUserArray } = require('./users.fixtures')
    const { brandInsert } = makeBrand()
    const { fabricPost, fabricInsert, fabricGetAll, fabricGetOne, fullFabUpdate } = makeFabric()
    const { fiberInsert, fiberGet } = makeFiber()
    const { certArrayInsert, certArrayGet} = makeCertArray()
    const { malBrandInsert } = makeMalBrand()
    const { malFabPost, malFabInsert, malFabGetAll, malFabGetOne } = makeMalFabric()
    const { malFiberInsert, malFiberGet } = makeMalFiber()
    const { malFtInsert } = makeMalFiberType()
    const { malFactInsert, malFactGet } = makeMalFactory()
    const { malCertGet, malCertInsert } = makeMalCert()
    const { factoryInsert, factoryGet } = makeFactory()
    const admin = makeAdminArray()[0]
    const hashUserArray = hashedUserArray()
    const incompleteInfo = {}
    const user = makeUserArray()[0]
    let db

    const makeAuthHeader = (user, secret = process.env.JWT_SECRET) => {
        const token = jwt.sign({ user_id: user.id }, secret, {
            subject: user.email,
            algorithm: 'HS256',
        })
        return `Bearer ${token}`
    }

    const insertFabric = () => (
        db.into('brands').insert(brandInsert)
        .then(() => db.into('fabrics').insert(fabricInsert))
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
        `TRUNCATE table fabric_types, brands, fabrics, factories, fiber_and_material_types, fibers_to_factories,
        fabrics_to_fibers_and_materials, certifications, fabrics_to_certifications, users 
        RESTART IDENTITY CASCADE`
    ))

    afterEach('cleanup', () => db.raw(
        `TRUNCATE table fabrics_to_certifications, fabrics_to_fibers_and_materials, fabrics, fabric_types, 
        brands, factories, fiber_and_material_types, fibers_to_factories, certifications, users 
        RESTART IDENTITY CASCADE`
    ))

    describe('GET /api/fabrics', () => {
        context('given there are fabrics in the database', () => {
            beforeEach(insertFabric)
            
            it('returns all the fabrics', () => {
                return supertest(app)
                    .get('/api/fabrics')
                    .expect(200)
                    .expect(fabricGetAll)
            })
        })

        context('when there are no fabrics in the database', () => {
            it('responds with 200 and an empty list', () => {
            
            return supertest(app)
                .get('/api/fabrics')
                .expect(200)
                .expect([])
            })
        })

        context('given a malicious fabric', () => {
            beforeEach(() =>  db.into('brands').insert(malBrandInsert))
            beforeEach(() =>  db.into('fabrics').insert( malFabInsert ))

            it('removes the attack content', () => {
                return supertest(app)
                    .get('/api/fabrics')
                    .expect(200)
                    .expect(malFabGetAll)
            })
        })
    })

    describe('GET /api/fabrics/:fabric_id', () => {
        beforeEach(insertFabric)

        context('given the fabric with id fabric_id exists', () => {
            const fabricId = fabricInsert.id

            it('returns the fabric with id fabric_id', () => {
                return supertest(app)
                    .get(`/api/fabrics/${fabricId}`)
                    .expect(200)
                    .expect(fabricGetOne)
            })
        })

        context('when the fabric with id fabric_id does not exist', () => {
            const fabricId = fabricInsert.id + 1

            it('responds with 404 and an error message', () => {
                return supertest(app)
                    .get(`/api/fabrics/${fabricId}`)
                    .expect(404)
                    .expect({ error: { message: 'Fabric does not exist.' } })
            })
        })

        context('when the fabric with id fabric_id is a malicious fabric', () => {
            beforeEach(() =>  db.into('brands').insert(malBrandInsert))
            beforeEach(() =>  db.into('fabrics').insert(malFabInsert))
            const fabricId = malFabInsert.id

            it('removes the attack content from the fabric with id fabric_id', () => {
                return supertest(app)
                    .get(`/api/fabrics/${fabricId}`)
                    .expect(200)
                    .expect(malFabGetOne)
            })
        })
    })

    describe('GET /api/fabrics/:fabric_id/certifications', () => {
        beforeEach(insertFabric)
        const fabricId = fabricInsert.id

        context('given there are certifications in the database', () => {
            beforeEach(() =>  db.into('certifications').insert(certArrayInsert))
            beforeEach(() =>  db.into('fabrics_to_certifications').insert(makeFabToCert()))

            it('returns all the certifications for the fabric with fabric_id', () => {
                return supertest(app)
                    .get(`/api/fabrics/${fabricId}/certifications`)
                    .expect(200)
                    .expect(certArrayGet)
            })
        })

        context('when there are no certifications in the database', () => {
            it('responds with 200 and an empty array', () => {
                return supertest(app)
                    .get(`/api/fabrics/${fabricId}/certifications`)
                    .expect(200)
                    .expect([])
            })        
        })

        context('given a malicious certification', () => {
            beforeEach(() => db.into('brands').insert(malBrandInsert))
            beforeEach(() => db.into('fabrics').insert(malFabInsert))
            beforeEach(() =>  db.into('certifications').insert(malCertInsert))
            beforeEach(() =>  db.into('fabrics_to_certifications').insert(makeFabToMalCert()))
            const malFabId = malFabInsert.id

            it('returns all the certifications for the fabric with fabric_id', () => {
                return supertest(app)
                    .get(`/api/fabrics/${malFabId}/certifications`)
                    .expect(200)
                    .expect([malCertGet])
            })
        })
    })

    describe('GET /api/fabrics/:fabric_id/factories', () => {
        beforeEach(insertFabric)
        const fabricId = factoryInsert.id

        context('given there are factories in the database', () => {
            beforeEach(() =>  db.into('factories').insert(factoryInsert))
            beforeEach(() =>  db.into('fabrics_to_factories').insert(makeFabToFact()))

            it('returns all the factories for the fabric with fabric_id', () => {
                return supertest(app)
                    .get(`/api/fabrics/${fabricId}/factories`)
                    .expect(200)
                    .expect(factoryGet)
            })
        })

        context('when there are no factories in the database', () => {
            it('responds with 200 and an empty array', () => {
                return supertest(app)
                        .get(`/api/fabrics/${fabricId}/factories`)
                        .expect(200)
                        .expect([])
            })
        })

        context('given a malicious factory', () => {
            beforeEach(() => db.into('brands').insert(malBrandInsert))
            beforeEach(() =>  db.into('factories').insert(malFactInsert))
            beforeEach(() => db.into('fabrics').insert(malFabInsert))
            beforeEach(() =>  db.into('fabrics_to_factories').insert(makeMalFabToMalFact()))
            const malFabId = malFabInsert.id

            it('removes the attack content', () => {
                return supertest(app)
                    .get(`/api/fabrics/${malFabId}/factories`)
                    .expect(200)
                    .expect(malFactGet)
            })
        })
    })

    describe('GET /api/fabrics/:fabric_id/fibers', () => {
        beforeEach(insertFabric)
        const fabricId = fabricInsert.id
        
        context('given there are fibers in the database', () => {
            beforeEach(() =>  db.into('fiber_and_material_types').insert(makeFiberType().ftInsert))
            beforeEach(() => db.into('factories').insert(factoryInsert))
            beforeEach(() =>  db.into('fibers_and_materials').insert(fiberInsert))
            beforeEach(() =>  db.into('fabrics_to_fibers_and_materials').insert(makeFabToFib()))
            beforeEach(() =>  db.into('fibers_to_factories').insert(makeFibToFact()))
            const expectedFibArray = [
                {
                    ...fiberGet[0],
                    percent_of_fabric: makeFabToFib()[0].percent_of_fabric
                }
            ]

            it('returns all the fibers for the fabric with fabric_id', () => {
                return supertest(app)
                    .get(`/api/fabrics/${fabricId}/fibers`)
                    .expect(200)
                    .expect(expectedFibArray)
            })
        })

        context('when there are no fibers in the database', () => {
            beforeEach(() =>  db.into('factories').insert(factoryInsert))

            it('returns 200 and an empty list', () => {
                return supertest(app)
                    .get(`/api/fabrics/${fabricId}/fibers`)
                    .expect(200)
                    .expect([])
            })
        })

        context('given a malicious fiber', () => {
            beforeEach(() =>  db.into('brands').insert(malBrandInsert))
            beforeEach(() =>  db.into('factories').insert(malFactInsert)) 
            beforeEach(() =>  db.into('fabrics').insert(malFabInsert))
            beforeEach(() =>  db.into('fiber_and_material_types').insert(malFtInsert))
            beforeEach(() =>  db.into('fibers_and_materials').insert(malFiberInsert))
            beforeEach(() =>  db.into('fabrics_to_fibers_and_materials').insert(makeMalFabToMalFib()))
            beforeEach(() =>  db.into('fibers_to_factories').insert(makeMalFibToFact()))
            const fabricId = malFabInsert.id
            const expectedFibArray = [
                {
                    ...malFiberGet[0],
                    percent_of_fabric: makeMalFabToMalFib().percent_of_fabric
                }
            ]

            it('removes the attack content', () => {
                return supertest(app)
                    .get(`/api/fabrics/${fabricId}/fibers`)
                    .expect(200)
                    .expect(expectedFibArray)
            })
        })
    })

    describe('Protected endpoints', () => {
        const protectedEndpoints = [
            {
                name: 'POST /api/fabrics',
                path: '/api/fabrics'
            },
            {
                name: 'POST /api/fabrics/:fabric_id/certifications',
                path: '/api/fabrics/1/certifications'
            },
            {
                name: 'POST /api/fabrics/:fabric_id/factories',
                path: '/api/fabrics/1/factories'
            },
            {
                name: 'POST /api/fabrics/:fabric_id/fibers',
                path: '/api/fabrics/1/fibers'
            }
        ]

        protectedEndpoints.forEach(endpoint => {
            describe(endpoint.name, () => {
                beforeEach(insertFabric)
                beforeEach(() =>  db.into('users').insert(hashUserArray))
                const invalidSecret = 'bad-secret'
                const invalidUser =  { email: 'not-a-user', password: 'password' }
                const userNoCreds = { email: '', password: '' }
                const validUser = user

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
                        .expect(401)
                        .expect({ error: 'Unauthorized request' })
                })
            })
        })

        describe('PATCH /api/fabrics/:fabric_id', () => {
            beforeEach(insertFabric)
            const idToUpdate = fabricInsert.id
            const invalidSecret = 'bad-secret'
            const invalidUser =  { email: 'not-a-user', password: 'password' }
            const notAnAdmin = { email: user.email, password: user.password }
            const userNoCreds = { email: '', password: '' }
            const validUser = user

            it(`responds with 401 'Missing bearer token' when no bearer token is provided`, () => {
                return supertest(app)
                    .patch(`/api/fabrics/${idToUpdate}`)
                    .send({})
                    .expect(401)
                    .expect({ error: 'Missing bearer token' })
            })

            it(`responds with 401 and 'Unauthorized request' when no credentials are in the token`, () => {
                

                return supertest(app)
                    .patch(`/api/fabrics/${idToUpdate}`)
                    .set('Authorization', makeAuthHeader(userNoCreds))
                    .send({})
                    .expect(401)
                    .expect({ error: 'Unauthorized request' })
            })

            it(`responds with 401 and 'Unauthorized request' when the JWT secret is invalid`, () => {                
                return supertest(app)
                    .patch(`/api/fabrics/${idToUpdate}`)
                    .set('Authorization', makeAuthHeader(validUser, invalidSecret))
                    .send({})
                    .expect(401)
                    .expect({ error: 'Unauthorized request' })
            })

            it(`responds with 401 and 'Unauthorized request' when the user is invalid`, () => {                    
                return supertest(app)
                    .patch(`/api/fabrics/${idToUpdate}`)
                    .set('Authorization', makeAuthHeader(invalidUser))
                    .send({})
                    .expect(401)
                    .expect({ error: 'Unauthorized request' })
            })

            it(`responds with 401 and 'Unauthorized request' when the user is not an admin`, () => {
                return supertest(app)
                    .patch(`/api/fabrics/${idToUpdate}`)
                    .set('Authorization', makeAuthHeader(notAnAdmin))
                    .send({})
                    .expect(401)
                    .expect({ error: 'Unauthorized request' })
            })
        })

        describe('DELETE /api/fabrics/:fabric_id', () => {
            beforeEach(insertFabric)
            const idToUpdate = fabricInsert.id
            const invalidSecret = 'bad-secret'
            const invalidUser =  { email: 'not-a-user', password: 'password' }
            const notAnAdmin = { email: user.email, password: user.password }
            const userNoCreds = { email: '', password: '' }
            const validUser = user
            
            it(`responds with 401 'Missing bearer token' when no bearer token is provided`, () => {
                return supertest(app)
                    .delete(`/api/fabrics/${idToUpdate}`)
                    .expect(401)
                    .expect({ error: 'Missing bearer token' })
            })

            it(`responds with 401 and 'Unauthorized request' when no credentials are in the token`, () => {
                
                return supertest(app)
                    .delete(`/api/fabrics/${idToUpdate}`)
                    .set('Authorization', makeAuthHeader(userNoCreds))
                    .expect(401)
                    .expect({ error: 'Unauthorized request' })
            })

            it(`responds with 401 and 'Unauthorized request' when the JWT secret is invalid`, () => {
                return supertest(app)
                    .delete(`/api/fabrics/${idToUpdate}`)
                    .set('Authorization', makeAuthHeader(validUser, invalidSecret))
                    .expect(401)
                    .expect({ error: 'Unauthorized request' })
            })

            it(`responds with 401 and 'Unauthorized request' when the user is invalid`, () => {                    
                return supertest(app)
                    .delete(`/api/fabrics/${idToUpdate}`)
                    .set('Authorization', makeAuthHeader(invalidUser))
                    .expect(401)
                    .expect({ error: 'Unauthorized request' })
            })

            it(`responds with 401 and 'Unauthorized request' when the user is not an admin`,  () => {
                return supertest(app)
                    .delete(`/api/fabrics/${idToUpdate}`)
                    .set('Authorization', makeAuthHeader(notAnAdmin))
                    .send({})
                    .expect(401)
                    .expect({ error: 'Unauthorized request' })
            })
        })
    })

    describe('POST /api/fabrics', () => {
        beforeEach(() =>  db.into('brands').insert(brandInsert))
        beforeEach(() =>  db.into('users').insert(hashUserArray))

        it('creates a fabric, responding with 201 and the new fabric', async () => {
            const postResponse = await supertest(app)
                .post('/api/fabrics')
                .set('Authorization', makeAuthHeader(user))
                .send(fabricPost)

            const getResponse = await supertest(app)
                .get(`/api/fabrics/${postResponse.body.id}`)

            const expected = new Date().toLocaleString()
            const postCreated = new Date(postResponse.body.created_at).toLocaleString()
            const postUpdated = new Date(postResponse.body.updated_at).toLocaleString()
    
            const expectedPostBody = {
                id: postResponse.body.id,
                ...fabricPost,
                approved_by_admin: false,
                created_at: postResponse.body.created_at,
                updated_at: postResponse.body.updated_at
            }

            const expectedGetBody = {
                ...fabricGetOne,
                approved_by_admin: false,
                created_at: postResponse.body.created_at,
                updated_at: postResponse.body.updated_at
            }

            expect(postResponse.status).to.eql(201)
            expect(postResponse.headers.location).to.eql(`/api/fabrics/${postResponse.body.id}`)
            expect(postResponse.body.approved_by_admin).to.eql(false)
            expect(postResponse.body).to.eql(expectedPostBody)
            expect(postCreated).to.eql(expected)
            expect(postUpdated).to.eql(expected)
            expect(getResponse.status).to.eql(200)
            expect(getResponse.body).to.eql(expectedGetBody)
        })

        const requiredFields = [
            'brand_id',
            'fabric_mill_country',
            'fabric_mill_id',
            'dye_print_finish_country',
            'dye_print_finish_id'
        ]

        requiredFields.forEach(field => {
            const newFabric = {
                ...fabricPost
            }

            it(`responds with 400 and an error message when the '${field}' is missing`, () => {
                delete newFabric[field]

                return supertest(app)
                    .post('/api/fabrics')
                    .set('Authorization', makeAuthHeader(user))
                    .send(newFabric)
                    .expect(400)
                    .expect({ error: { message: `Missing '${field}' in request body`} })
            })
        })

        context('given a malicious fabric', () => {
            beforeEach(() =>  db.into('brands').insert(malBrandInsert))
            it('removes the attack content from the response', async () => {
                const postResponse = await supertest(app)
                    .post('/api/fabrics')
                    .set('Authorization', makeAuthHeader(user))
                    .send(malFabPost)

                const getResponse = await supertest(app)
                    .get(`/api/fabrics/${postResponse.body.id}`)

                const expected = new Date().toLocaleString()
                const postCreated = new Date(postResponse.body.created_at).toLocaleString()
                const postUpdated = new Date(postResponse.body.updated_at).toLocaleString()
        
                const expectedPostBody = {
                    ...malFabGetAll[0],
                    id: postResponse.body.id,
                    approved_by_admin: false,
                    created_at: postResponse.body.created_at,
                    updated_at: postResponse.body.updated_at
                }

                const expectedGetBody = {
                    ...malFabGetOne,
                    id: postResponse.body.id,
                    approved_by_admin: false,
                    created_at: postResponse.body.created_at,
                    updated_at: postResponse.body.updated_at
                }

                expect(postResponse.status).to.eql(201)
                expect(postResponse.headers.location).to.eql(`/api/fabrics/${postResponse.body.id}`)
                expect(postResponse.body.approved_by_admin).to.eql(false)
                expect(postResponse.body).to.eql(expectedPostBody)
                expect(postCreated).to.eql(expected)
                expect(postUpdated).to.eql(expected)
                expect(getResponse.status).to.eql(200)
                expect(getResponse.body).to.eql(expectedGetBody)
        })
        })
    })

    describe('POST /api/fabrics/:fabric_id/certifications', () => {
        beforeEach(insertFabric)
        beforeEach(() =>  db.into('factories').insert(factoryInsert)) 
        beforeEach(() =>  db.into('certifications').insert(certArrayInsert))
        beforeEach(() =>  db.into('users').insert(hashUserArray))
        
        const fabricId = fabricInsert.id
        const certId = certArrayInsert[0].id
        const certGet = makeCertArray().certArrayGet[0]

        it('creates a fabric-certification pair, responding with 201 and the new fabric-certification pair', async () => {
            const newFabCertPair = {
                certification_id: certId
            }

            const postResponse = await supertest(app)
                .post(`/api/fabrics/${fabricId}/certifications`)
                .set('Authorization', makeAuthHeader(user))
                .send(newFabCertPair)

            const getResponse = await supertest(app)
                .get(`/api/fabrics/${fabricId}/certifications`)

            const expected = new Date().toLocaleString()
            const postCreated = new Date(postResponse.body.created_at).toLocaleString()
            const postUpdated = new Date(postResponse.body.updated_at).toLocaleString()
    
            const expectedPostBody = {
                fabric_id: fabricId,
                certification_id: certId,
                approved_by_admin: false,
                created_at: postResponse.body.created_at,
                updated_at: postResponse.body.updated_at
            }

            const expectedGetBody = [ certGet ]

            expect(postResponse.status).to.eql(201)
            expect(postResponse.headers.location).to.eql(`/api/fabrics/${fabricId}/certifications`)
            expect(postResponse.body.approved_by_admin).to.eql(false)
            expect(postResponse.body).to.eql(expectedPostBody)
            expect(postCreated).to.eql(expected)
            expect(postUpdated).to.eql(expected)
            expect(getResponse.status).to.eql(200)
            expect(getResponse.body).to.eql(expectedGetBody)
        })

        it(`responds with 400 and an error message when 'certification_id' is missing`, () => {
            return supertest(app)
                .post(`/api/fabrics/${fabricId}/certifications`)
                .set('Authorization', makeAuthHeader(user))
                .send(incompleteInfo)
                .expect(400)
                .expect({ error: { message: `Missing 'certification_id' in request body`} })
        })
    })

    describe('POST /api/fabrics/:fabric_id/factories', () => {
        beforeEach(insertFabric)
        beforeEach(() =>  db.into('factories').insert(factoryInsert)) 
        beforeEach(() =>  db.into('users').insert(hashUserArray))
        const fabricId = fabricInsert.id
        const factoryId = factoryInsert.id

        it('creates a fabric-factory pair, responding with 201 and the new fabric-factory pair', async () => {
            const newFabFactPair = {
                factory_id: factoryId
            }

            const postResponse = await supertest(app)
                .post(`/api/fabrics/${fabricId}/factories`)
                .set('Authorization', makeAuthHeader(user))
                .send(newFabFactPair)

            const getResponse = await supertest(app)
                .get(`/api/fabrics/${fabricId}/factories`)

            const expected = new Date().toLocaleString()
            const postCreated = new Date(postResponse.body.created_at).toLocaleString()
            const postUpdated = new Date(postResponse.body.updated_at).toLocaleString()
    
            const expectedPostBody = {
                fabric_id: fabricId,
                factory_id: factoryId,
                approved_by_admin: false,
                created_at: postResponse.body.created_at,
                updated_at: postResponse.body.updated_at
            }

            const expectedGetBody = factoryGet

            expect(postResponse.status).to.eql(201)
            expect(postResponse.headers.location).to.eql(`/api/fabrics/${fabricId}/factories`)
            expect(postResponse.body.approved_by_admin).to.eql(false)
            expect(postResponse.body).to.eql(expectedPostBody)
            expect(postCreated).to.eql(expected)
            expect(postUpdated).to.eql(expected)
            expect(getResponse.status).to.eql(200)
            expect(getResponse.body).to.eql(expectedGetBody)
        })

        it(`responds with 400 and an error message when the 'factory_id' is missing`, () => {
            return supertest(app)
                .post(`/api/fabrics/${fabricId}/factories`)
                .set('Authorization', makeAuthHeader(user))
                .send(incompleteInfo)
                .expect(400)
                .expect({ error: { message: `Missing 'factory_id' in request body`} })
        })
    })

    describe('POST /api/fabrics/:fabric_id/fibers', () => {
        beforeEach(insertFabric)
        beforeEach(() =>  db.into('factories').insert(factoryInsert)) 
        beforeEach(() =>  db.into('fiber_and_material_types').insert(makeFiberType().ftInsert))
        beforeEach(() =>  db.into('fibers_and_materials').insert(fiberInsert))
        beforeEach(() => db.into('users').insert(hashUserArray))
        const fabricId = fabricInsert.id
        const fiberId = fiberInsert.id

        it('creates a fabric-fiber pair, responding with 201 and the new fabric-fiber pair', async () => {
            const fabFibPair =  {
                fabric_id: fabricId,
                fiber_or_material_id: 1,
                percent_of_fabric: 100
            }

            const postResponse = await supertest(app)
                .post(`/api/fabrics/${fabricId}/fibers`)
                .set('Authorization', makeAuthHeader(user))
                .send(fabFibPair)

            const getResponse = await supertest(app)
                .get(`/api/fabrics/${fabricId}/fibers`)

            const expected = new Date().toLocaleString()
            const postCreated = new Date(postResponse.body.created_at).toLocaleString()
            const postUpdated = new Date(postResponse.body.updated_at).toLocaleString()
    
            const expectedPostBody = {
                fabric_id: fabricId,
                fiber_or_material_id: fiberId,
                percent_of_fabric: fabFibPair.percent_of_fabric,
                approved_by_admin: false,
                created_at: postResponse.body.created_at,
                updated_at: postResponse.body.updated_at
            }

            const expectedGetBody = [
                {
                    ...fibersGet[0],
                    percent_of_fabric: fabFibPair.percent_of_fabric
                }    
            ]

            expect(postResponse.status).to.eql(201)
            expect(postResponse.headers.location).to.eql(`/api/fabrics/${fabricId}/fibers`)
            expect(postResponse.body.approved_by_admin).to.eql(false)
            expect(postResponse.body).to.eql(expectedPostBody)
            expect(postCreated).to.eql(expected)
            expect(postUpdated).to.eql(expected)
            expect(getResponse.status).to.eql(200)
            expect(getResponse.body).to.eql(expectedGetBody)
        })

        it(`responds with 400 and an error message when the 'fiber_or_material_id' is missing`, () => {
            return supertest(app)
                .post(`/api/fabrics/${fabricId}/fibers`)
                .set('Authorization', makeAuthHeader(user))
                .send(incompleteInfo)
                .expect(400)
                .expect({ error: { message: `Missing 'fiber_or_material_id' in request body`} })
        })
    })

    describe('PATCH /api/fabrics/:fabric_id', () => {
        const updateBrandInsert = {
            ...brandInsert,
            id: 2
        }

        beforeEach(insertFabric)
        beforeEach(() => db.into('brands').insert(updateBrandInsert))
        beforeEach(() => db.into('factories').insert(factoryInsert))
        beforeEach(() => db.into('users').insert(hashedAdminArray()))
        const idToUpdate = fabricInsert.id

        context('when the fabric with id fabric_id exists', () => {
            it('updates the fabric and responds 204', async () => {
                const patchResponse = await supertest(app)
                    .patch(`/api/fabrics/${idToUpdate}`)
                    .set('Authorization', makeAuthHeader(admin))
                    .send(fullFabUpdate)

                const getResponse = await supertest(app)
                    .get(`/api/fabrics/${idToUpdate}`)
                
                const expectedFabric = {
                    ...fabricGetOne,
                    ...fullFabUpdate
                }

                const created = new Date(getResponse.body.created_at).toLocaleString()
                const updated = new Date(getResponse.body.updated_at).toLocaleString()
                const expectedCreated = new Date(fabricGetOne.created_at).toLocaleString()
                const expectedUpdated = new Date(fullFabUpdate.updated_at).toLocaleString()

                expect(patchResponse.status).to.eql(204)
                expect(getResponse.status).to.eql(200)
                expect(getResponse.body).to.eql(expectedFabric)      
                expect(created).to.eql(expectedCreated)
                expect(updated).to.eql(expectedUpdated)
            })

            it('responds with 400 when no required fields are supplied', () => {
                return supertest(app)
                    .patch(`/api/fabrics/${idToUpdate}`)
                    .set('Authorization', makeAuthHeader(admin))
                    .send({irrelevantField: 'bar'})
                    .expect(400)
                    .expect({error: { message: `Request body must include 'brand_id', 'fabric_mill_country', 'fabric_mill_id', 'fabric_mill_notes', 'dye_print_finish_country', 'dye_print_finish_id', 'dye_print_finish_notes', 'approved_by_admin', or 'updated_at'`}
})
            })

            it('responds with 204 when updating only a subset of fields', async () => {
                const subsetUpdate = {
                    brand_id: fullFabUpdate.brand_id
                }

                const patchResponse = await supertest(app)
                    .patch(`/api/fabrics/${idToUpdate}`)
                    .set('Authorization', makeAuthHeader(admin))
                    .send(subsetUpdate)

                const getResponse = await supertest(app)
                    .get(`/api/fabrics/${idToUpdate}`)

                const expectedFabric = {
                    ...fabricGetOne,
                    ...subsetUpdate
                }

                const created = new Date(getResponse.body.created_at).toLocaleString()
                const updated = new Date(getResponse.body.updated_at).toLocaleString()
                const expectedCreated = new Date(fabricGetOne.created_at).toLocaleString()
                const expectedUpdated = new Date(fabricGetOne.updated_at).toLocaleString()

                expect(patchResponse.status).to.eql(204)
                expect(getResponse.status).to.eql(200)
                expect(getResponse.body).to.eql(expectedFabric)      
                expect(created).to.eql(expectedCreated)
                expect(updated).to.eql(expectedUpdated)
            })
        })

        context('when the fabric with id fabric_id does not exist.', () => {
            const nonexistant = idToUpdate + 1

            it('responds with 404 and an error message', () => {
                return supertest(app)
                    .patch(`/api/fabrics/${nonexistant}`)
                    .set('Authorization', makeAuthHeader(admin))
                    .send(fullFabUpdate)
                    .expect(404)
                    .expect({ error: { message: 'Fabric does not exist.'} })
            })
        })
    })

    describe('DELETE /api/fabrics/:fabric_id', () => {
        beforeEach(insertFabric)
        beforeEach(() => db.into('users').insert(hashedAdminArray()))
        const idToDelete = fabricInsert.id

        context('when the fabric with id fabric_id exists', () => {
            it('removes the fabric and responds 204', async () => {
                const deleteResponse = await supertest(app)
                    .delete(`/api/fabrics/${idToDelete}`)
                    .set('Authorization', makeAuthHeader(admin))
                    
                const getResponse = await supertest(app)
                    .get(`/api/fabrics/${idToDelete}`)

                expect(deleteResponse.status).to.eql(204)
                expect(getResponse.status).to.eql(404)
            })
        })

        context('when the fabric with id fabric_id does not exist.', () => {
            it('responds with 404 and an error message', () => {
                const nonexistantId = idToDelete + 1

                return supertest(app)
                    .delete(`/api/fabrics/${nonexistantId}`)
                    .set('Authorization', makeAuthHeader(admin))
                    .expect(404)
                    .expect({ error: { message: 'Fabric does not exist.'} })
            })
        })
    })
})