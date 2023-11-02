describe('Factories Endpoints', function() {
    const app = require('../src/app')
    const { expect } = require('chai')
    const knex = require('knex')
    const jwt = require('jsonwebtoken')
    const supertest = require('supertest')
    const { makeFactory, makeMalFactory } = require('./factories.fixtures')
    const { factoryPost, factoryInsert, factoryGet, factFullUpdate } = makeFactory()
    const { hashedAdminArray, hashedUserArray, makeAdminArray, makeUserArray } = require('./users.fixtures')
    const { malFactGet, malFactInsert, malFactPost } = makeMalFactory()
    const admin = makeAdminArray()[0]
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
    before('clean the table', () => db.raw('TRUNCATE table factories, users RESTART IDENTITY CASCADE'))
    afterEach('cleanup', () => db.raw('TRUNCATE table factories, users RESTART IDENTITY CASCADE'))

    describe('GET /api/factories', () => {
        context('given there are factories in the database', () => {
            beforeEach(() =>  db.into('factories').insert(factoryInsert))
            
            it('responds with 200 and all the factories', () => {
                return supertest(app)
                    .get('/api/factories')
                    .expect(200)
                    .expect(factoryGet)
            })
        })

        context('when there are no factories in the database', () => {
            it('responds with 200 and an empty list', () => {
            
            return supertest(app)
                .get('/api/factories')
                .expect(200)
                .expect([])
            })
        })

        context('given a malicious factory', () => {
            beforeEach(() =>  db.into('factories').insert(malFactInsert))

            it('removes the attack content', () => {
                return supertest(app)
                    .get('/api/factories')
                    .expect(200)
                    .expect(malFactGet)
            })
        })
    })

    describe('GET /api/factories/:factory_id', () => {
        beforeEach(() =>  db.into('factories').insert(factoryInsert))
        const factoryId = factoryInsert.id

        context('when the factory with id factory_id exists', () => {
            it('responds with 200 and returns the factory with id factory_id', () => {
                return supertest(app)
                    .get(`/api/factories/${factoryId}`)
                    .expect(200)
                    .expect(factoryGet[0])
            })
        })

        context('when the factory with id factory_id does not exist.', () => {
            const nonexistantId = factoryId + 1

            it('responds with 404 and an error message', () => {
                return supertest(app)
                    .get(`/api/factories/${nonexistantId}`)
                    .expect(404)
                    .expect({ error: { message: 'Factory does not exist.' } })
            })
        })

        context('given a malicious factory', () => {
            beforeEach(() =>  db.into('factories').insert(malFactInsert))
            const malFactId = malFactInsert.id

            it('removes the attack content', () => {
                return supertest(app)
                    .get(`/api/factories/${malFactId}`)
                    .expect(200)
                    .expect(malFactGet[0])
             
            })
        })
    })

    describe('Protected endpoints', () => {
        before(() => db.into('users').insert(hashUserArray))
        const factoryId = factoryInsert.id
        const invalidSecret = 'bad-secret'
        const invalidUser =  { email: 'not-a-user', password: 'password' }
        const notAnAdmin = { email: user.email, password: user.password }
        const userNoCreds = { email: '', password: '' }
        const validUser = user

        describe('POST /api/factories/', () => {
            it(`responds with 401 and 'Missing bearer token' when no bearer token is provided`, () => {
                return supertest(app)
                    .post('/api/factories')
                    .send({})
                    .expect(401)
                    .expect({ error: 'Missing bearer token'})
            })

            it(`responds with 401 and 'Unauthorized request' when no credentials are in the token`, () => {
                return supertest(app)
                    .post('/api/factories')
                    .set('Authorization', makeAuthHeader(userNoCreds))
                    .send({})
                    .expect(401)
                    .expect({ error: 'Unauthorized request' })
            })

            it(`responds with 401 and 'Unauthorized request' when the JWT secret is invalid`, () => {                
                return supertest(app)
                    .post('/api/factories')
                    .set('Authorization', makeAuthHeader(validUser, invalidSecret))
                    .send({})
                    .expect(401)
                    .expect({ error: 'Unauthorized request' })
            })

            it(`responds with 401 and 'Unauthorized request' when the user is invalid`, () => {                    
                return supertest(app)
                    .post('/api/factories')
                    .set('Authorization', makeAuthHeader(invalidUser))
                    .send({})
                    .expect(401)
                    .expect({ error: 'Unauthorized request' })
            })
        })

        describe('PATCH /api/factories/:factory_id', () => {
            before(() => db.into('users').insert(hashAdminArray))
            beforeEach(() => db.into('factories').insert(factoryInsert))

            it(`responds with 401 and 'Missing bearer token' when no bearer token is provided`, () => {
                return supertest(app)
                    .patch(`/api/factories/${factoryId}`)
                    .send({})
                    .expect(401)
                    .expect({ error: 'Missing bearer token'})
            })

            it(`responds with 401 and 'Unauthorized request' when no credentials are in the token`, () => {
                return supertest(app)
                    .patch(`/api/factories/${factoryId}`)
                    .set('Authorization', makeAuthHeader(userNoCreds))
                    .send({})
                    .expect(401)
                    .expect({ error: 'Unauthorized request' })
            })

            it(`responds with 401 and 'Unauthorized request' when the JWT secret is invalid`, () => {                
                return supertest(app)
                    .patch(`/api/factories/${factoryId}`)
                    .set('Authorization', makeAuthHeader(validUser, invalidSecret))
                    .send({})
                    .expect(401)
                    .expect({ error: 'Unauthorized request' })
            })

            it(`responds with 401 and 'Unauthorized request' when the user is invalid`, () => {                    
                return supertest(app)
                    .patch(`/api/factories/${factoryId}`)
                    .set('Authorization', makeAuthHeader(invalidUser))
                    .send({})
                    .expect(401)
                    .expect({ error: 'Unauthorized request' })
            })

            it(`responds with 401 and 'Unauthorized request' when the user is not an admin`, () => {
                before(() => db.into('users').insert(hashUserArray))

                return supertest(app)
                    .patch(`/api/factories/${factoryId}`)
                    .set('Authorization', makeAuthHeader(notAnAdmin))
                    .send({})
                    .expect(401)
                    .expect({ error: 'Unauthorized request' })
            })
        })

        describe('DELETE /api/factories/:brand_id', () => {
            before(() => db.into('users').insert(hashAdminArray))
            beforeEach(() => db.into('factories').insert(factoryInsert))       
            
            it(`responds with 401 and 'Missing bearer token' when no bearer token is provided`, () => {
                return supertest(app)
                    .delete(`/api/factories/${factoryId}`)
                    .expect(401)
                    .expect({ error: 'Missing bearer token'})
            })

            it(`responds with 401 and 'Unauthorized request' when no credentials are in the token`, () => {
                return supertest(app)
                    .delete(`/api/factories/${factoryId}`)
                    .set('Authorization', makeAuthHeader(userNoCreds))
                    .expect(401)
                    .expect({ error: 'Unauthorized request' })
            })

            it(`responds with 401 and 'Unauthorized request' when the JWT secret is invalid`, () => {                
                return supertest(app)
                    .delete(`/api/factories/${factoryId}`)
                    .set('Authorization', makeAuthHeader(validUser, invalidSecret))
                    .expect(401)
                    .expect({ error: 'Unauthorized request' })
            })

            it(`responds with 401 and 'Unauthorized request' when the user is invalid`, () => {                    
                return supertest(app)
                    .delete(`/api/factories/${factoryId}`)
                    .set('Authorization', makeAuthHeader(invalidUser))
                    .expect(401)
                    .expect({ error: 'Unauthorized request' })
            })

            it(`responds with 401 and 'Unauthorized request' when the user is not an admin`, () => {
                before(() => db.into('users').insert(hashUserArray))

                return supertest(app)
                    .delete(`/api/factories/${factoryId}`)
                    .set('Authorization', makeAuthHeader(notAnAdmin))
                    .expect(401)
                    .expect({ error: 'Unauthorized request' })
            })
        })
    })

    describe('POST /api/factories', () => {
        beforeEach(() => db.into('users').insert(hashUserArray))

        it('creates a factory, responding with 201 and the new factory', async () => {
            const postResponse = await supertest(app)
                .post('/api/factories')
                .set('Authorization', makeAuthHeader(user))
                .send(factoryPost)

            const getResponse = await supertest(app)
                .get(`/api/factories/${postResponse.body.id}`)

            const expected = new Date().toLocaleString()
            const postCreated = new Date(postResponse.body.created_at).toLocaleString()
            const postUpdated = new Date(postResponse.body.updated_at).toLocaleString()

            const expectedPostBody = {
                id: postResponse.body.id,
                ...factoryPost,
                approved_by_admin: false,
                created_at: postResponse.body.created_at,
                updated_at: postResponse.body.updated_at
            }

            const expectedGetBody = {
                ...expectedPostBody
            }

            expect(postResponse.status).to.eql(201)
            expect(postResponse.headers.location).to.eql(`/api/factories/${postResponse.body.id}`)
            expect(postResponse.body.approved_by_admin).to.eql(false)
            expect(postResponse.body).to.eql(expectedPostBody)
            expect(postCreated).to.eql(expected)
            expect(postUpdated).to.eql(expected)
            expect(getResponse.status).to.eql(200)
            expect(getResponse.body).to.eql(expectedGetBody)
        })
                
        it('creates a factory with "approved_by_admin" set to "false" when only the required fields are sent', async () => {
            return supertest(app)
                .post('/api/factories')
                .send(factoryPost)
                .set('Authorization', makeAuthHeader(user))
                .expect(201)
                .expect(res => {
                    expect(res.body.approved_by_admin).to.eql(false)
                })
        })

        const requiredFields = [
            'english_name',
            'country'
        ]

        requiredFields.forEach(field => {
            const newFactory = {
                ...factoryPost
            }

            delete newFactory[field]
            
            it(`responds with 400 and an error message when the '${field}' is missing`, () => {
                
                return supertest(app)
                    .post('/api/factories')
                    .set('Authorization', makeAuthHeader(user))
                    .send(newFactory)
                    .expect(400)
                    .expect({ error: { message: `Missing '${field}' in request body`} })
            })
        })

        context('given a malicious factory', () => {
            it('removes the attack content from the response', async () => {
                const postResponse = await supertest(app)
                    .post('/api/factories')
                    .set('Authorization', makeAuthHeader(user))
                    .send(malFactPost)

                const getResponse = await supertest(app)
                    .get(`/api/factories/${postResponse.body.id}`)

                const expected = new Date().toLocaleString()
                const postCreated = new Date(postResponse.body.created_at).toLocaleString()
                const postUpdated = new Date(postResponse.body.updated_at).toLocaleString()

                const expectedPostBody = {
                    ...malFactGet[0],
                    id: postResponse.body.id,
                    approved_by_admin: postResponse.body.approved_by_admin,
                    created_at: postResponse.body.created_at,
                    updated_at: postResponse.body.updated_at
                }

                const expectedGetBody = {
                    ...expectedPostBody
                }

                expect(postResponse.status).to.eql(201)
                expect(postResponse.headers.location).to.eql(`/api/factories/${postResponse.body.id}`)
                expect(postResponse.body.approved_by_admin).to.eql(false)
                expect(postResponse.body).to.eql(expectedPostBody)
                expect(postCreated).to.eql(expected)
                expect(postUpdated).to.eql(expected)
                expect(getResponse.status).to.eql(200)
                expect(getResponse.body).to.eql(expectedGetBody)
            })
        })
    })

    describe('PATCH /api/factories/:factory_id', () => {
        beforeEach(() => db.into('users').insert(hashAdminArray))
        const factoryId = factoryInsert.id

        context('when the factory with id factory_id exists', () => {
            beforeEach(() =>  db.into('factories').insert(factoryInsert))

            it('updates the factory and responds 204', async () => {    
                const patchResponse = await supertest(app)
                    .patch(`/api/factories/${factoryId}`)
                    .set('Authorization', makeAuthHeader(admin))
                    .send(factFullUpdate)

                const getResponse = await supertest(app)
                    .get(`/api/factories/${factoryId}`)
                
                const expectedFactory = {
                    ...factoryInsert,
                    ...factFullUpdate,
                }

                const created = new Date(getResponse.body.created_at).toLocaleString()
                const updated = new Date(getResponse.body.updated_at).toLocaleString()
                const expectedCreated = new Date(factoryInsert.created_at).toLocaleString()
                const expectedUpdated = new Date(factFullUpdate.updated_at).toLocaleString()

                expect(patchResponse.status).to.eql(204)
                expect(getResponse.status).to.eql(200)
                expect(getResponse.body).to.eql(expectedFactory)      
                expect(created).to.eql(expectedCreated)
                expect(updated).to.eql(expectedUpdated)
            })

            it('responds with 400 when no required fields are supplied', () => {
                return supertest(app)
                    .patch(`/api/factories/${factoryId}`)
                    .send({irrelevantField: 'bar'})
                    .set('Authorization', makeAuthHeader(admin))
                    .expect(400)
                    .expect({
                        error: { message: `Request body must contain 'english_name', 'country', 'website', 'notes', and/or 'approved_by_admin'`}
                    })
            })

            it('responds with 204 when updating only a subset of fields', async () => {
                const subsetUpdate = {
                    english_name: factFullUpdate.english_name,
                }

                const patchResponse = await supertest(app)
                    .patch(`/api/factories/${factoryId}`)
                    .set('Authorization', makeAuthHeader(admin))
                    .send(subsetUpdate)

                const getResponse = await supertest(app)
                    .get(`/api/factories/${factoryId}`)
                
                const expectedFactory = {
                    ...factoryInsert,
                    ...subsetUpdate,
                }

                const created = new Date(getResponse.body.created_at).toLocaleString()
                const updated = new Date(getResponse.body.updated_at).toLocaleString()
                const expectedCreated = new Date(factoryInsert.created_at).toLocaleString()
                const expectedUpdated = new Date(factoryInsert.updated_at).toLocaleString()

                expect(patchResponse.status).to.eql(204)
                expect(getResponse.status).to.eql(200)
                expect(getResponse.body).to.eql(expectedFactory)      
                expect(created).to.eql(expectedCreated)
                expect(updated).to.eql(expectedUpdated)
            })
        })

        context('when the factory with id factory_id does not exist.', () => {
            const nonexistantId = factoryInsert.id + 1

            it('responds with 404 and an error message', () => {
                return supertest(app)
                    .patch(`/api/factories/${nonexistantId}`)
                    .send(factFullUpdate)
                    .set('Authorization', makeAuthHeader(admin))
                    .expect(404)
                    .expect({ error: { message: 'Factory does not exist.'} } ) })
        })
    })

    describe('DELETE /api/factories/:factory_id', () => {
        before('create users', () => db.into('users').insert(hashAdminArray))

        context('given the factory with id factory_id exists', () => {
            beforeEach(() =>  db.into('factories').insert(factoryInsert))

            it('removes the factory and responds 204', async () => {
                const factoryId = factoryInsert.id

                const deleteResponse = await supertest(app)
                    .delete(`/api/factories/${factoryId}`)
                    .set('Authorization', makeAuthHeader(admin))
                
                const getResponse = await supertest(app)
                    .get(`/api/factories/${factoryId}`)

                expect(deleteResponse.status).to.eql(204)
                expect(getResponse.status).to.eql(404)
            })
        })

        context('when the fabric with id fabric_id does not exist.', () => {
            beforeEach(() =>  db.into('factories').insert(factoryInsert))

            it('responds with 404 and an error message', () => {
                const nonexistantId = factoryInsert.id + 1

                return supertest(app)
                    .delete(`/api/factories/${nonexistantId}`)
                    .set('Authorization', makeAuthHeader(admin))
                    .expect(404)
                    .expect({ error: { message: 'Factory does not exist.'} } )
            })
        })
    })
})
