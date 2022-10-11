const knex = require('knex')
const jwt = require('jsonwebtoken')
const app = require('../src/app')

const { makeFactoryArray, makeMalFactory } = require('./factories.fixtures')
const { hashedAdminArray, hashedUserArray, makeAdminArray, makeUserArray } = require('./users.fixtures')

describe('Factories Endpoints', function() {
    const adminArray = makeAdminArray()
    const admin = adminArray[0]
    const factories = makeFactoryArray()
    const hashAdminArray = hashedAdminArray()
    const hashUserArray = hashedUserArray()
    const { malFactory, expectedFactory } = makeMalFactory()
    const userArray = makeUserArray()
    const user = userArray[0]

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
        context('when there are factories in the database', () => {
            beforeEach(() =>  db.into('factories').insert(factories))
            
            it('returns all the factories', () => {
                return supertest(app)
                    .get('/api/factories')
                    .expect(200, factories)
            })
        })

        context('when there are no factories in the database', () => {
            it('responds with 200 and an empty list', () => {
            
            return supertest(app)
                .get('/api/factories')
                .expect(200, [])
            })
        })

        context('given a malicious factory', () => {
            beforeEach(() =>  db.into('factories').insert( malFactory ))

            it('removes the attack content', () => {
                return supertest(app)
                    .get('/api/factories')
                    .expect(200, [ expectedFactory ])
            })
        })
    })

    describe('GET /api/factories/:factory_id', () => {
        context('when the factory with id factory_id exists', () => {
            beforeEach(() =>  db.into('factories').insert(factories))

            const factoryId = 1

            it('returns the factory with id factory_id', () => {
                return supertest(app)
                    .get(`/api/factories/${factoryId}`)
                    .expect(200, factories[factoryId - 1])
            })
        })

        context('when the factory with id factory_id does not exist', () => {
            const factoryId = 1

            it('responds with 404 and an error message', () => {
                return supertest(app)
                    .get(`/api/factories/${factoryId}`)
                    .expect(404, { error: { message: 'Factory does not exist' } })
            })
        })

        context('when the factory with id factory_id is a malicious factory', () => {
            beforeEach(() =>  db.into('factories').insert(malFactory))

            const factoryId = 666

            it('removes the attack content from the factory with id factory_id', () => {
                return supertest(app)
                    .get(`/api/factories/${factoryId}`)
                    .expect(200)
                    .expect(res => {
                        expect(res.body.english_name).to.eql(expectedFactory.english_name)
                        expect(res.body.website).to.eql(expectedFactory.website)
                        expect(res.body.notes).to.eql(expectedFactory.notes)
                    })
             
            })
        })
    })

    describe('Protected endpoints', () => {
        before('create users', () => db.into('users').insert(hashUserArray))
        before('create users', () => db.into('users').insert(hashAdminArray))

        const newFactory = {
            english_name: 'Blue Factory',
            country: 1,
            website: 'www.blue.com',
            notes: 'it is blue'
        }

        describe('POST /api/factories/', () => {
            it(`responds with 401 'Missing bearer tokenn' when no basic token`, () => (
                supertest(app)
                    .post('/api/factories')
                    .send(newFactory)
                    .expect(401, { error: `Missing bearer token`})
            ))

            it(`responds 401 'Unauthorized request' when no credentials in token`, () => {
                const userNoCreds = { email: '', password: '' }
                return supertest(app)
                    .post(`/api/factories`)
                    .set('Authorization', makeAuthHeader(userNoCreds))
                    .send(newFactory)
                    .expect(401, { error: `Unauthorized request` })
            })

            it(`responds 401 'Unatuhorized request' when invalid user`, () => {
                const invalidUserCreds =  { email: 'not-a-user', password: 'incorrect-password' }
                
                return supertest(app)
                    .post(`/api/factories`)
                    .set('Authorization', makeAuthHeader(invalidUserCreds))
                    .send(newFactory)
                    .expect(401, { error: 'Unauthorized request' })
            })

            it(`responds 401 'Unauthorized request' when the password is wrong`, () => {
                const incorrectPassword = { email: user.email, password: 'wrong' }

                return supertest(app)
                    .post('/api/factories')
                    .set('Authorization', makeAuthHeader(incorrectPassword))
                    .send(newFactory)
                    .expect(401, { error: 'Unauthorized request' })
            })
        })

        describe('PATCH /api/factories/:brand_id', () => {
            beforeEach(() => db.into('factories').insert(factories))       

            it(`responds with 401 'Missing bearer token' when no basic token`, () => (
                supertest(app)
                    .patch('/api/factories/1')
                    .send({ english_name: newFactory.english_name})
                    .expect(401, { error: `Missing bearer token`})
            ))

            it(`responds 401 'Unauthorized request' when no credentials in token`, () => {
                const userNoCreds = { email: '', password: '' }

                return supertest(app)
                    .patch('/api/factories/1')
                    .set('Authorization', makeAuthHeader(userNoCreds))
                    .send({ english_name: newFactory.english_name })
                    .expect(401, { error: `Unauthorized request` })
            })

            it(`responds 401 'Unatuhorized request' when invalid user`, () => {
                const invalidUserCreds =  { email: 'not-a-user', password: 'incorrect-password' }
                
                return supertest(app)
                    .patch(`/api/factories/1`)
                    .set('Authorization', makeAuthHeader(invalidUserCreds))
                    .send({ english_name: newFactory.english_name })
                    .expect(401, { error: 'Unauthorized request' })
            })

            it(`responds 401 'Unauthorized request' when the password is wrong`, () => {
                const incorrectPassword = { email: user.email, password: 'wrong' }

                return supertest(app)
                    .patch('/api/factories/1')
                    .set('Authorization', makeAuthHeader(incorrectPassword))
                    .send({ english_name: newFactory.english_name })
                    .expect(401, { error: 'Unauthorized request' })
            })
        })

        describe('DELETE /api/factories/:brand_id', () => {
            beforeEach(() => db.into('factories').insert(factories))       
            
            it(`responds with 401 'Missing bearer token' when no basic token`, () => (
                supertest(app)
                    .delete('/api/factories/1')
                    .expect(401, { error: `Missing bearer token`})
            ))

            it(`responds 401 'Unauthorized request' when no credentials in token`, () => {
                const userNoCreds = { email: '', password: '' }
                return supertest(app)
                    .delete(`/api/factories/1`)
                    .set('Authorization', makeAuthHeader(userNoCreds))
                    .expect(401, { error: `Unauthorized request` })
            })

            it(`responds 401 'Unatuhorized request' when invalid user`, () => {
                const invalidUserCreds =  { email: 'not-a-user', password: 'incorrect-password' }
                
                return supertest(app)
                    .delete(`/api/factories/1`)
                    .set('Authorization', makeAuthHeader(invalidUserCreds))
                    .expect(401, { error: 'Unauthorized request' })
            })

            it(`responds 401 'Unauthorized request' when the password is wrong`, () => {
                const incorrectPassword = { email: user.email, password: 'wrong' }

                return supertest(app)
                    .delete('/api/factories/1')
                    .set('Authorization', makeAuthHeader(incorrectPassword))
                    .expect(401, { error: 'Unauthorized request' })
            })
        })
    })

    describe('POST /api/factories', () => {
        beforeEach(() => db.into('users').insert(hashUserArray))

        it('creates a factory, responding with 201 and the new factory', () => {
            const newFactory = {
                english_name: 'The Orange Concept',
                country: 1,
                website: 'www.orange.com',
                notes: 'family-owned',
                approved_by_admin: true
            }

            return supertest(app)
                .post('/api/factories')
                .send(newFactory)
                .set('Authorization', makeAuthHeader(user))
                .expect(201)
                .expect(res => {
                    expect(res.body.english_name).to.eql(newFactory.english_name)
                    expect(res.body.country).to.eql(newFactory.country)
                    expect(res.body.website).to.eql(newFactory.website)
                    expect(res.body.notes).to.eql(newFactory.notes)
                    expect(res.body.approved_by_admin).to.eql(newFactory.approved_by_admin)
                })
        })

        const requiredFields = [
            'english_name',
            'country'
        ]

        requiredFields.forEach(field => {
            const newFactory = {
                english_name: 'The Orange Concept',
                country: 1,
                website: 'www.orange.com',
                notes: 'family-owned',
                approved_by_admin: true
            }

            delete newFactory[field]
            
            it(`responds with 400 and an error message when the '${field}' is missing`, () => {
                return supertest(app)
                    .post(`/api/factories`)
                    .set('Authorization', makeAuthHeader(user))
                    .send(newFactory)
                    .expect(400, {
                        error: { message: `Missing '${field}' in request body`}
                    })
            })
        })

        it(`Removes XSS attack content from response`, () => {
            const { malFactory, expectedFactory } = makeMalFactory()

            return supertest(app)
                .post(`/api/factories`)
                .send(malFactory)
                .set('Authorization', makeAuthHeader(user))
                .expect(201)
                .expect(res => {
                    expect(res.body.english_name).to.eql(expectedFactory.english_name)
                    expect(res.body.country).to.eql(expectedFactory.country)
                    expect(res.body.website).to.eql(expectedFactory.website)
                    expect(res.body.notes).to.eql(expectedFactory.notes)
                    expect(res.body.approved_by_admin).to.eql(expectedFactory.approved_by_admin)

                })
        })
    })

    describe('PATCH /api/factories/:factory_id', () => {
        beforeEach(() => db.into('users').insert(hashAdminArray))

        context('when the factory with id factory_id exists', () => {
            beforeEach(() =>  db.into('factories').insert(factories))

            it('updates the factory and responds 204', () => {
                const idToUpdate = 1
                const updateFactory = {
                    english_name: 'The Orange Concept',
                    country: 1,
                    website: 'www.orange.com',
                    notes: 'family-owned',
                    approved_by_admin: true
                }
    
                const expectedFactory = {
                    ...factories[idToUpdate - 1],
                    ...updateFactory
                }
    
                return supertest(app)
                    .patch(`/api/factories/${idToUpdate}`)
                    .send(updateFactory)
                    .set('Authorization', makeAuthHeader(admin))
                    .expect(204)
                    .then(res => {
                        supertest(app)
                            .get(`/api/factories/${idToUpdate}`)
                            .expect(expectedFactory)
                            .catch(error => {
                                console.log(error)
                            })
                    })

            })

            it('responds with 400 when no required fields are supplied', () => {
                const idToUpdate = 1
                return supertest(app)
                    .patch(`/api/factories/${idToUpdate}`)
                    .send({irrelevantField: 'bar'})
                    .set('Authorization', makeAuthHeader(admin))
                    .expect(400, {
                        error: { message: `Request body must contain 'english_name', 'country', 'website', 'notes', and/or 'approved_by_admin'`}
                    })
            })

            it('responds with 204 when updating only a subset of fields', () => {
                const idToUpdate = 1
                const updateFactory = {
                    english_name: 'The Orange Concept',
                }
    
                const expectedFactory = {
                    ...factories[idToUpdate - 1],
                    ...updateFactory
                }
    
                return supertest(app)
                    .patch(`/api/factories/${idToUpdate}`)
                    .send(updateFactory)
                    .set('Authorization', makeAuthHeader(admin))
                    .expect(204)
                    .then(res => {
                        supertest(app)
                            .get(`/api/factories/${idToUpdate}`)
                            .expect(expectedFactory)
                            .catch(error => {
                                console.log(error)
                            })
                    })
            })
        })

        context('when the factory with id factory_id does not exist', () => {
            const idToUpdate = 1
            const updateFactory = {
                english_name: 'The Orange Concept',
                    country: 1,
                    website: 'www.orange.com',
                    notes: 'family-owned',
                    approved_by_admin: true
            }

            it('responds with 404', () => {
                return supertest(app)
                    .patch(`/api/factories/${idToUpdate}`)
                    .send(updateFactory)
                    .set('Authorization', makeAuthHeader(admin))
                    .expect(404, {
                        error: { message: `Factory does not exist`} } )
            })
        })
    })

    describe('DELETE /api/factories/:factory_id', () => {
        before('create users', () => db.into('users').insert(hashAdminArray))

        context('when the factory with id factory_id exists', () => {
            beforeEach(() =>  db.into('factories').insert(factories))

            it('removes the factory and responds 204', () => {
                const idToRemove = 1
                const expectedFactories = factories.filter(factory => factory.id !== idToRemove)

                return supertest(app)
                    .delete(`/api/factories/${idToRemove}`)
                    .set('Authorization', makeAuthHeader(admin))
                    .expect(204)
                    .then(res => {
                        supertest(app)
                            .get('/api/factories')
                            .expect(200)
                            .expect(expectedFactories)
                            .catch(error => {
                                console.log(error)
                            })
                    })    
            })
        })

        context('when the fabric with id fabric_id does not exist', () => {
            beforeEach(() =>  db.into('factories').insert(factories))

            it('responds with 404', () => {
                const idToRemove = 222

                return supertest(app)
                    .delete(`/api/factories/${idToRemove}`)
                    .set('Authorization', makeAuthHeader(admin))
                    .expect(404, {
                        error: { message: `Factory does not exist`} } )
            })
        })
    })
})
