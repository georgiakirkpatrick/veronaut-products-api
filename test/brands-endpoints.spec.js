describe('Brands Endpoints', () => {
    const app = require('../src/app')
    const { expect } = require('chai')
    const knex = require('knex')
    const jwt = require('jsonwebtoken')
    const supertest = require('supertest')
    const { makeBrand, makeMalBrand } = require('./brands.fixtures')
    const { makeFactory, makeMalFactory } = require('./factories.fixtures')
    const { makeFiberType, makeFiber, makeMalFiber, makeMalFiberType } = require('./fibers.fixtures')
    const { makeMalNotion, makeMalNotionType, makeNotion, makeNotionType } = require('./notions.fixtures')
    const { hashedAdminArray, hashedUserArray, makeAdminArray, makeUserArray } = require('./users.fixtures')
    const { brandPost, brandInsert, brandGet } = makeBrand()
    const { ntInsert} = makeNotionType()
    const { fiberGet, fiberInsert } = makeFiber()
    const { malBrandPost, malBrandInsert, malBrandGet } = makeMalBrand()
    const { malFactory } = makeMalFactory()
    const { malFiberInsert, malFiberGet } = makeMalFiber()
    const { malFtInsert } = makeMalFiberType()
    const { malNotionInsert, malNotionGet } = makeMalNotion()
    const { malNtInsert } = makeMalNotionType()
    const { notionInsert, notionGet } = makeNotion()
    const admin = makeAdminArray()[0]
    const { factoryGet, factoryInsert, factoryPost } = makeFactory()
    const { ftInsert } = makeFiberType()
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
    
    const insertFiberArray = () => {
        Promise.all([
            beforeEach(() =>  db.into('brands').insert(brandInsert)),
            beforeEach(() =>  db.into('factories').insert(factoryInsert)),
            beforeEach(() =>  db.into('fiber_and_material_types').insert(ftInsert))
        ])
        .then(() => db.into('fibers_and_materials').insert(fiber))
    }

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DATABASE_URL,
        })
        app.set('db', db)
    })
    
    after('disconnect from db', () => db.destroy())

    before('clean the table', () => db.raw(
        `TRUNCATE table fibers_and_materials, fiber_and_material_types, notions, notion_types, brands, users, factories RESTART IDENTITY CASCADE`
    ))

    afterEach('cleanup', () => db.raw(
        `TRUNCATE table fibers_and_materials, fiber_and_material_types, notions, notion_types, brands, users, factories RESTART IDENTITY CASCADE`
    ))

    describe('GET /api/brands', () => {
        context('given there are brands in the database', () => {
            beforeEach('insert brands', () => db.into('brands').insert(brandInsert))

            it('GET /api/brands responds with 200 and all of the brands', () => {
                return supertest(app)
                    .get('/api/brands')
                    .expect(200, brandGet)
            })
        })

        context('given no brands', () => {
            it('responds with 200 and an empty list', () => {
                return supertest(app)
                    .get('/api/brands')
                    .expect(200)
                        .expect([])
            })
        })
    

        context('given a malicious brand', () => {
            beforeEach(() => db.into('brands').insert(malBrandInsert))

            it('removes the attack content', async () => {
               const getResponse = await supertest(app)
                    .get('/api/brands')
                
                expect(getResponse.status).to.eql(200)
                expect(getResponse.body[0]).to.eql(malBrandGet[0])
            })
        })
    })
    
    describe('GET /api/brands/:brand_id', () => {
        const brandId = brandInsert.id

        context('given brand with id brand_id exists', () => {
            beforeEach(() => db.into('brands').insert(brandInsert))

            it('GET /api/brands responds with 200 and the specified brand', () => {
                return supertest(app)
                    .get(`/api/brands/${brandId}`)
                    .expect(200, brandGet[0])
            })
        })

        context('given no brand with id brand_id exists', () => {
            it('responds with 404', () => {
                return supertest(app)
                    .get(`/api/brands/${brandId}`)
                    .expect(404)
                    .expect(res => {
                        expect(res.error.text).to.eql('{"error":{"message":"Brand does not exist."}}')
                    })
            })
        })

        context('given a malicious brand', () => {
            before(() => db.into('brands').insert(malBrandInsert))

            const brandId = malBrandInsert.id
    
            it('removes the attack content', () => {
                return supertest(app)
                    .get(`/api/brands/${brandId}`)
                    .expect(200)
                    .expect(res => {
                        expect(res.body).to.eql(malBrandGet[0])
                    })
            })
        })
    })

    describe('GET /api/brands/:brand_id/fibers', () => {
        const expectedFiber = fiber => {
            eFiber = {
                ...fiber,
                fiber_type_class: fiber.class
            }
            
            delete eFiber.class

            return eFiber
        }

        context('given there are fibers for the brand with id brand_id', () => {
            beforeEach(insertFiberArray)

            it('responds with 200 and all of the fibers for the brand', () => {
                const brandId = brandInsert.id

                return supertest(app)
                    .get(`/api/brands/${brandId}/fibers`)
                    .expect(200)
                    .expect(res => {
                        for ( let i = 0; i < res.body.length; i++ ) {
                            expect(res.body[i]).to.eql(expectedFiber(fiberGet[0]))
                        }
                    })
            })
        })

        context('given there are no fibers for the brand with id brand_id', () => {
            beforeEach('insert brands', () => ( db.into('brands').insert(brandInsert)))
    
            it('responds with 200 and an empty list', () => {
                const brandId = 1

                return supertest(app)
                    .get(`/api/brands/${brandId}/fibers`)
                    .expect(200)
                        .expect([])
            })
        })

        context('given a malicious fiber', () => {
            beforeEach(() => db.into('brands').insert(malBrandInsert))
            beforeEach(() => db.into('factories').insert(malFactInsert))
            beforeEach(() => db.into('fiber_and_material_types').insert(malFtInsert))
            beforeEach(() => db.into('fibers_and_materials').insert(malFiberInsert))
            
            const brandId = malBrandInsert.id
    
            it('removes the attack content', () => {
                return supertest(app)
                    .get(`/api/brands/${brandId}/fibers`)
                    .expect(200)
                    .expect(res => {
                        expect(res.body[0]).to.eql(expectedFiber(malFiberGet))
                    })
            })
        })
    })

    describe('GET /api/brands/:brand_id/notions', () => {
        context('given there are notions for the brand with id brand_id', () => {
            beforeEach(insertFiberArray)
            beforeEach(() => db.into('notion_types').insert(ntInsert))
            beforeEach(() => db.into('notions').insert(notionInsert))

            it('GET /api/brands/:brand_id/notions responds with 200 and all of the notions for the brand', () => {
                const brandId = 1

                return supertest(app)
                    .get(`/api/brands/${brandId}/notions`)
                    .expect(200)
                    .expect(res => {
                        expect(res.body).to.eql(notionGet)
                    })
            })
        })

        context('given there are no notions for the brand with id brand_id', () => {
            beforeEach('insert brands', () => ( db.into('brands').insert(brandInsert)))
            const brandId = 1

            it('responds with 200 and an empty array', () => {
                return supertest(app)
                    .get(`/api/brands/${brandId}/notions`)
                    .expect(200)
                        .expect([])
            })
        })

        context('given a malicious notion', () => {
            const brandId = 666

            beforeEach(() => db.into('factories').insert(malFactInsert))
            beforeEach(() => db.into('brands').insert(malBrandInsert))
            beforeEach(() => db.into('notion_types').insert(malNtInsert))
            beforeEach(() => db.into('fiber_and_material_types').insert(malFtInsert))
            beforeEach(() => db.into('notions').insert(malNotionInsert))

            it('removes the attack content', () => {
                return supertest(app)
                    .get(`/api/brands/${brandId}/notions`)
                    .expect(200)
                    .expect(res => {
                        expect(res.body).to.eql(malNotionGet)
                    })
            })
        })
    })

    describe('Protected endpoints', () => {
        const invalidSecret = 'bad-secret'
        const invalidUser =  { email: 'not-a-user', password: 'password' }
        const notAnAdmin = { email: user.email, password: user.password }
        const userNoCreds = { email: '', password: '' }
        const validUser = user

        beforeEach(() => db.into('users').insert(hashUserArray)) 

        describe('POST /api/brands/', () => {
            it(`responds with 401 and 'Missing bearer token' when no bearer token is provided`, () => (
                supertest(app)
                    .post('/api/brands')
                    .expect(401, { error: 'Missing bearer token'})
            ))

            it(`responds with 401 and 'Unauthorized request' when no credentials are in the token`, () => {
                return supertest(app)
                    .post('/api/brands')
                    .set('Authorization', makeAuthHeader(userNoCreds))
                    .expect(401, { error: 'Unauthorized request' })
            })

            it(`responds with 401 and 'Unauthorized request' when the JWT secret is invalid`, () => {                
                return supertest(app)
                    .post('/api/brands')
                    .set('Authorization', makeAuthHeader(validUser, invalidSecret))
                    .expect(401, { error: 'Unauthorized request' })
            })

            it(`responds with 401 and 'Unauthorized request' when the user is invalid`, () => {                    
                return supertest(app)
                    .post('/api/brands')
                    .set('Authorization', makeAuthHeader(invalidUser))
                    .expect(401, { error: 'Unauthorized request' })
            })
        })

        describe('PATCH /api/brands/:brand_id', () => {
            beforeEach(() => db.into('brands').insert(brandInsert))

            it(`responds with 401 and 'Missing bearer token' when no bearer token is provided`, () => {
                supertest(app)
                    .patch('/api/brands/1')
                    .expect(401, { error: 'Missing bearer token'})
            })
                
            it(`responds with 401 and 'Unauthorized request' when no credentials are in the token`, () => {
                return supertest(app)
                    .patch('/api/brands/1')
                    .set('Authorization', makeAuthHeader(userNoCreds))
                    .expect(401, { error: 'Unauthorized request' })
            })

            it(`responds with 401 and 'Unauthorized request' when the JWT secret is invalid`, () => {
                return supertest(app)
                    .patch('/api/brands/1')
                    .set('Authorization', makeAuthHeader(validUser, invalidSecret))
                    .expect(401, { error: 'Unauthorized request' })
            })

            it(`responds with 401 and 'Unauthorized request' when the user is invalid`, () => {                
                return supertest(app)
                    .patch('/api/brands/1')
                    .set('Authorization', makeAuthHeader(invalidUser))
                    .expect(401, { error: 'Unauthorized request' })
            })

            it(`responds with 401 and 'Unauthorized request' when the user is not an admin`, () => {
                return supertest(app)
                    .patch('/api/brands/1')
                    .set('Authorization', makeAuthHeader(notAnAdmin))
                    .expect(401, { error: 'Unauthorized request' })
            })
        })

        describe('DELETE /api/brands/:brand_id', () => {
            beforeEach(() => db.into('brands').insert(brandInsert))       
            
            it(`responds with 401 and 'Missing bearer token' when no bearer token is provided`, () => {
                supertest(app)
                    .delete('/api/brands/1')
                    .expect(401, { error: 'Missing bearer token'})
            })

            it(`responds with 401 and 'Unauthorized request' when no credentials are in the token`, () => {
                return supertest(app)
                    .delete('/api/brands/1')
                    .set('Authorization', makeAuthHeader(userNoCreds))
                    .expect(401, { error: 'Unauthorized request' })
            })

            it(`responds with 401 and 'Unauthorized request' when the JWT secret is invalid`, () => {
                return supertest(app)
                    .delete('/api/brands/1')
                    .set('Authorization', makeAuthHeader(validUser, invalidSecret))
                    .expect(401, { error: 'Unauthorized request' })
            })

            it(`responds with 401 and 'Unauthorized request' when the user is invalid`, () => {                
                return supertest(app)
                    .delete('/api/brands/1')
                    .set('Authorization', makeAuthHeader(invalidUser))
                    .expect(401, { error: 'Unauthorized request' })
            })

            it(`responds with 401 and 'Unauthorized request' when the user is not an admin`, () => {
                return supertest(app)
                    .delete('/api/brands/1')
                    .set('Authorization', makeAuthHeader(notAnAdmin))
                    .expect(401, { error: 'Unauthorized request' })
            })
        })
    })

    describe('POST /api/brands', () => {
        beforeEach(() => db.into('users').insert(hashUserArray))

        it('creates a brand, responding with 201 and the new brand', async () => {
            const postResponse = await supertest(app)
                .post(`/api/brands`)
                .set('Authorization', makeAuthHeader(user))
                .send(brandPost)

            const getResponse = await supertest(app)
                .get(`/api/brands/${postResponse.body.id}`)

            const expected = new Date().toLocaleString()
            const created = new Date(postResponse.body.created_at).toLocaleString()
            const updated = new Date(postResponse.body.updated_at).toLocaleString()

            const expectedPostBody = {
                id: postResponse.body.id,
                ...brandPost,
                approved_by_admin: false,
                created_at: postResponse.body.created_at,
                updated_at: postResponse.body.updated_at
            }

            const expectedGetBody = {
                ...expectedPostBody
            }

            expect(postResponse.status).to.eql(201)
            expect(postResponse.headers.location).to.eql(`/api/brands/${postResponse.body.id}`)
            expect(postResponse.body.approved_by_admin).to.eql(false)
            expect(postResponse.body).to.eql(expectedPostBody)
            expect(created).to.eql(expected)
            expect(updated).to.eql(expected)
            expect(getResponse.status).to.eql(200)
            expect(getResponse.body).to.eql(expectedGetBody)
        })
            
        const requiredFields = [
            'english_name',
            'website',
            'home_currency',
            'size_system'
        ]

        requiredFields.forEach(field => {
            const newBrand = {
                ...brandPost
            }
            it(`responds with 400 and an error message when the '${field}' is missing`, () => {
                delete newBrand[field]

                return supertest(app)
                    .post('/api/brands')
                    .set('Authorization', makeAuthHeader(user))
                    .send(newBrand)
                    .expect(400, {
                        error: { message: `Missing '${field}' in request body`}
                    })
            })
        })

        context('given a malicious brand', () => {
            it('removes the attack content from the response', async () => {
                const postResponse = await supertest(app)
                    .post('/api/brands')
                    .set('Authorization', makeAuthHeader(user))
                    .send(malBrandPost)
                    
                const getResponse = await supertest(app)
                    .get(`/api/brands/${postResponse.body.id}`)

                const expected = new Date().toLocaleString()
                const created = new Date(postResponse.body.created_at).toLocaleString()
                const updated = new Date(postResponse.body.updated_at).toLocaleString()
    
                const expectedPostBody = {
                    ...malBrandGet[0],
                    id: postResponse.body.id,
                    approved_by_admin: false,
                    created_at: postResponse.body.created_at,
                    updated_at: postResponse.body.updated_at
                }
    
                const expectedGet = {
                    ...expectedPostBody
                }

                expect(postResponse.status).to.eql(201)
                expect(postResponse.headers.location).to.eql(`/api/brands/${postResponse.body.id}`)
                expect(postResponse.body.approved_by_admin).to.eql(false)
                expect(postResponse.body).to.eql(expectedPostBody)
                expect(created).to.eql(expected)
                expect(updated).to.eql(expected)
                expect(getResponse.status).to.eql(200)
                expect(getResponse.body).to.eql(expectedGet)
            })       
        })
    })

    describe('PATCH /api/brands/:brand_id', () => {
        beforeEach(() => db.into('users').insert(hashAdminArray)) 

        context('given there are brands in the database', () => {
            beforeEach(() => db.into('brands').insert(brandInsert))

            it('responds with 204 and updates the brand', async () => {
                const idToUpdate = brandInsert.id

                const updateBrand = {
                    english_name: 'Updated Brand Name',
                    website: 'www.updatedbrand.com',
                    home_currency: 1,
                    size_system: 1,
                    approved_by_admin: false
                }

                const patchResponse = await supertest(app)
                    .patch(`/api/brands/${idToUpdate}`)
                    .set('Authorization', makeAuthHeader(admin))
                    .send(updateBrand)

                const getResponse = await supertest(app)
                    .get(`/api/brands/${idToUpdate}`)

                const expectedBrand = {
                    ...brandGet[idToUpdate - 1],
                    ...updateBrand
                }

                const created = new Date(getResponse.body.created_at).toLocaleString()
                const updated = new Date(getResponse.body.updated_at).toLocaleString()
                const expectedCreated = new Date(brandInsert.created_at).toLocaleString()
                const expectedUpdated = new Date(brandInsert.updated_at).toLocaleString()

                expect(patchResponse.status).to.eql(204)
                expect(getResponse.status).to.eql(200)
                expect(getResponse.body).to.eql(expectedBrand)      
                expect(created).to.eql(expectedCreated)
                expect(updated).to.eql(expectedUpdated)
            })

            it('responds with 400 when no required fields are supplied', async () => {
                const idToUpdate = brandInsert.id
                
                const patchResponse = await supertest(app)
                    .patch(`/api/brands/${idToUpdate}`)
                    .set('Authorization', makeAuthHeader(admin))
                    .send({})

                expect(patchResponse.status).to.eql(400)    
                expect(patchResponse.error.text).to.eql(`{"error":{"message":"Request body must include 'english_name', 'website', 'home_currency', 'size_system', and/or 'approved_by_admin'"}}`)
            })

            it('responds with 204 when updating only a subset of fields', async () => {
                const idToUpdate = brandInsert.id

                const updateBrand = {
                    english_name: 'Updated Brand Name'
                }

                const patchResponse = await supertest(app)
                    .patch(`/api/brands/${idToUpdate}`)
                    .set('Authorization', makeAuthHeader(admin))
                    .send(updateBrand)

                const getResponse = await supertest(app)
                    .get(`/api/brands/${idToUpdate}`)

                const expectedBrand = {
                    ...brandGet[idToUpdate - 1],
                    ...updateBrand
                }

                const created = new Date(getResponse.body.created_at).toLocaleString()
                const updated = new Date(getResponse.body.updated_at).toLocaleString()
                const expectedCreated = new Date(brandInsert.created_at).toLocaleString()
                const expectedUpdated = new Date(brandInsert.updated_at).toLocaleString()

                expect(patchResponse.status).to.eql(204)
                expect(getResponse.status).to.eql(200)
                expect(getResponse.body).to.eql(expectedBrand)      
                expect(created).to.eql(expectedCreated)
                expect(updated).to.eql(expectedUpdated)
            })
        })

        context('given nonexistant brand id', () => {
            it('responds with 404', () => {
                const brandId = 654
                return supertest(app)
                    .patch(`/api/brands/${brandId}`)
                    .set('Authorization', makeAuthHeader(admin))
                    .expect(404, { error: { message: 'Brand does not exist.' } })
            })
        })
    })
    
    describe('DELETE /api/brands/:brand_id', () => {
        beforeEach(() => db.into('users').insert(hashAdminArray)) 

        context('given there are products in the database', () => {
            beforeEach(() => db.into('brands').insert(brandInsert))

            it('responds with 204 and removes the brand', async () => {
                const idToRemove = brandInsert.id
                const expectedBrands = brandGet.filter(brand => brand.id !== idToRemove)

                const deleteResponse = await supertest(app)
                    .delete(`/api/brands/${idToRemove}`)
                    .set('Authorization', makeAuthHeader(admin))

                const getResponse = await supertest(app)
                    .get(`/api/brands/${idToRemove}`)

                expect(deleteResponse.status).to.eql(204)
                expect(getResponse.status).to.eql(404)
            
            })
        })

        context('given no brands', () => {
            it('responds with 404', () => {
                const nonexistantId = 123
                return supertest(app)
                    .delete(`/api/brands/${nonexistantId}`)
                    .set('Authorization', makeAuthHeader(admin))
                    .expect(404, { error: { message: 'Brand does not exist.' } })
            })
        })
    })
})