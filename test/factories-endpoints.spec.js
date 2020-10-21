const knex = require('knex')
const app = require('../src/app')
const { makeFactoriesArray, makeMaliciousFactory } = require('./factories.fixtures')
const supertest = require('supertest')
const { expect } = require('chai')

const factories = makeFactoriesArray()
const { maliciousFactory, expectedFactory } = makeMaliciousFactory()

describe('Factories Endpoints', function() {
    let db

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DATABASE_URL,
        })
        app.set('db', db)
    })

    after('disconnect from db', () => db.destroy())

    before('clean the table', () => db.raw('TRUNCATE table factories RESTART IDENTITY CASCADE'))
    
    afterEach('cleanup', () => db.raw('TRUNCATE table factories RESTART IDENTITY CASCADE'))

    describe('GET /api/factories', () => {
        context('when there are factories in the database', () => {
            beforeEach(() => { return db.into('factories').insert(factories) })
            
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
            beforeEach(() => { return db.into('factories').insert( maliciousFactory ) })

            it('removes the attack content', () => {
                return supertest(app)
                    .get('/api/factories')
                    .expect(200, [ expectedFactory ])
            })
        })
    })

    describe('GET /api/factories/:factory_id', () => {
        context('when the factory with id factory_id exists', () => {
            beforeEach(() => { return db.into('factories').insert(factories) })

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
            beforeEach(() => { return db.into('factories').insert(maliciousFactory) })

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

    describe('POST /api/factories', () => {
        it('creates a factory, responding with 201 and the new factory', () => {
            const newFactory = {
                english_name: 'The Orange Concept',
                country: 'PE',
                website: 'www.orange.com',
                notes: 'family-owned',
                approved_by_admin: true
            }

            return supertest(app)
                .post('/api/factories')
                .send(newFactory)
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
            'country',
            'website',
            'notes',
            'approved_by_admin'
        ]

        requiredFields.forEach(field => {
            const newFactory = {
                english_name: 'The Orange Concept',
                country: 'PE',
                website: 'www.orange.com',
                notes: 'family-owned',
                approved_by_admin: true
            }

            delete newFactory[field]
            
            it(`responds with 400 and an error message when the '${field}' is missing`, () => {
                return supertest(app)
                    .post(`/api/factories`)
                    .send(newFactory)
                    .expect(400, {
                        error: { message: `Missing '${field}' in request body`}
                    })
            })
        })

        it(`Removes XSS attack content from response`, () => {
            const { maliciousFactory, expectedFactory } = makeMaliciousFactory()

            return supertest(app)
                .post(`/api/factories`)
                .send(maliciousFactory)
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
        context('when the factory with id factory_id exists', () => {
            beforeEach(() => { return db.into('factories').insert(factories) })

            it('updates the factory and responds 204', () => {
                const idToUpdate = 1
                const updateFactory = {
                    english_name: 'The Orange Concept',
                    country: 'PE',
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
                    .expect(204)
                    .then(res => {
                        supertest(app)
                            .get(`/api/factories/${idToUpdate}`)
                            .expect(expectedFactory)
                    })
            })

            it('responds with 400 when no required fields are supplied', () => {
                    const idToUpdate = 1
                    return supertest(app)
                        .patch(`/api/factories/${idToUpdate}`)
                        .send({irrelevantField: 'bar'})
                        .expect(400, {
                            error: { message: `Request body must contain 'english_name', 'country', 'website', 'notes', 'approved_by_admin'`}
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
                        .expect(204)
                        .then(res => {
                            supertest(app)
                                .get(`/api/factories/${idToUpdate}`)
                                .expect(expectedFactory)
                        })
            })
        })

        context('when the factory with id factory_id does not exist', () => {
            const idToUpdate = 1
            const updateFactory = {
                english_name: 'The Orange Concept',
                    country: 'PE',
                    website: 'www.orange.com',
                    notes: 'family-owned',
                    approved_by_admin: true
            }

            it('responds with 404', () => {
                return supertest(app)
                    .patch(`/api/factories/${idToUpdate}`)
                    .send(updateFactory)
                    .expect(404, {
                        error: { message: `Factory does not exist`} } )
            })
        })
    })

    describe('DELETE /api/factories/:factory_id', () => {
        context('when the factory with id factory_id exists', () => {
            beforeEach(() => { return db.into('factories').insert(factories) })

            it('removes the factory and responds 204', () => {
                const idToRemove = 1
                const expectedFactories = factories.filter(factory => factory.id !== idToRemove)

                return supertest(app)
                    .delete(`/api/factories/${idToRemove}`)
                    .expect(204)
                    .then(res => {
                        supertest(app)
                            .get('/api/factories')
                            .expect(res => {
                                expect(res.body.english_name).to.eql(expectedFactories.english_name === undefined)
                                expect(res.body.website).to.eql(expectedFactories.english_name === website)
                                expect(res.body.country).to.eql(expectedFactories.english_name === country)
                                expect(res.body.notes).to.eql(expectedFactories.english_name === notes)
                                expect(res.body.approved_by_admin).to.eql(expectedFactories.approved_by_admin === undefined)
                            })
                    })    
            })
        })

        context('when the fabric with id fabric_id does not exist', () => {
            beforeEach(() => { return db.into('factories').insert(factories) })

            it('responds with 404', () => {
                const idToRemove = 222

                return supertest(app)
                    .delete(`/api/factories/${idToRemove}`)
                    .expect(404, {
                        error: { message: `Factory does not exist`} } )
            })
        })
    })
})
