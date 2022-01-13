const knex = require('knex')
const app = require('../src/app')
const supertest = require('supertest')
const { expect } = require('chai')

const { makeBrandArray, makeMalBrand } = require('./brands.fixtures')
const { makeFactoryArray, makeMalFactory } = require('./factories.fixtures')
const { makeCertificationArray, makeMalCertification } = require('./certifications.fixtures')
const { 
    makeFiberArray, makeFiberToCertArray, makeFiberToMalCertArray, makeFiberTypeArray, 
    makeMalFiberType, makeMalFiber 
} = require('./fibers.fixtures')
const { makeAdmin, makeMalUser, makeUsers } = require('./users.fixtures')

describe('Fibers Endpoints', () => {
    const adminArray = makeAdmin()
    const brands = makeBrandArray()
    const certifications = makeCertificationArray()
    const factories = makeFactoryArray()
    const { malFactory } = makeMalFactory()
    const { fibersPost, fibersGet } = makeFiberArray()
    const fibersToCerts = makeFiberToCertArray()
    const fiberToMalCert = makeFiberToMalCertArray()
    const fiberTypes = makeFiberTypeArray()
    const { malBrand } = makeMalBrand()
    const { malCertification, expectedCertification } = makeMalCertification()
    const { malFiber, expectedFiber } = makeMalFiber()
    const { malFiberType, expectedFiberType } = makeMalFiberType()
    const users = makeUsers()

    let db

    const makeAuthHeader = user => {
        const token = Buffer.from(`${user.email}:${user.password}`).toString('base64')
        return `Basic ${token}`
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

    const user = users[0]

    describe('GET /api/fibers', () => {
        context('when there are fibers in the database', () => {
            beforeEach(() =>  db.into('fiber_and_material_types').insert(fiberTypes))
            beforeEach(() =>  db.into('brands').insert(brands))
            beforeEach(() =>  db.into('factories').insert(factories))
            beforeEach(() =>  db.into('fibers_and_materials').insert(fibersPost))
            
            it('returns all the fibers', () => {
                return supertest(app)
                    .get('/api/fibers')
                    .expect(200)
                    .expect(res => {
                        expect(res.body[0]).to.eql(fibersGet[0])
                    })
            })
        })

        context('when there are no fibers in the database', () => {
            it('responds with 200 and an empty list', () => {
            
            return supertest(app)
                .get('/api/fibers')
                .expect(200, [])
            })
        })

        context('given a malicious fiber', () => {
            beforeEach(() =>  db.into('brands').insert(malBrand))
            beforeEach(() =>  db.into('fiber_and_material_types').insert(malFiberType))
            beforeEach(() =>  db.into('factories').insert(malFactory))
            beforeEach(() =>  db.into('fibers_and_materials').insert(malFiber))

            it('removes the attack content', () => {
                return supertest(app)
                    .get('/api/fibers')
                    .expect(200)
                    .expect(res => {
                        expect(res.body[0].fiber_type).to.eql(expectedFiber.fiber_type)
                    })
            })
        })
    })

    describe('GET /api/fibers/:fiber_id', () => {
        context('when the fiber with id fiber_id exists', () => {
            beforeEach(() =>  db.into('fiber_and_material_types').insert(fiberTypes))
            beforeEach(() =>  db.into('brands').insert(brands))
            beforeEach(() =>  db.into('factories').insert(factories))
            beforeEach(() =>  db.into('fibers_and_materials').insert(fibersPost))

            const fiberId = 1

            it('returns the fiber with id fiber_id', () => {
                return supertest(app)
                    .get(`/api/fibers/${fiberId}`)
                    .expect(200, fibersGet[fiberId - 1])
            })
        })

        context('when the fiber with id fiber_id does not exist.', () => {
            const fiberId = 1

            it('responds with 404 and an error message', () => {
                return supertest(app)
                    .get(`/api/fibers/${fiberId}`)
                    .expect(404, { error: { message: 'Fiber does not exist' } })
            })
        })

        context('when the fiber with id fiber_id is a malicious fiber', () => {
            beforeEach(() =>  db.into('fiber_and_material_types').insert(malFiberType))
            beforeEach(() =>  db.into('factories').insert(malFactory))
            beforeEach(() =>  db.into('brands').insert(malBrand))
            beforeEach(() =>  db.into('fibers_and_materials').insert(malFiber))

            const fiberId = 666

            it('removes the attack content from the fiber with id fiber_id', () => {
                return supertest(app)
                    .get(`/api/fibers/${fiberId}`)
                    .expect(200)
                    .expect(res => {
                        expect(res.body.fiber_type).to.eql(expectedFiber.fiber_type)
                        expect(res.body.production_notes).to.eql(expectedFiber.production_notes)
                        expect(res.body.producer).to.eql(expectedFiber.producer)
                        expect(res.body.producer_website).to.eql(expectedFiber.producer_website)
                        expect(res.body.production_notes).to.eql(expectedFiber.production_notes)
                    })
            })
        })
    })

    describe('GET /api/fibers/fiber-types', () => {
        context('when there are fiber types in the database', () => {
            beforeEach(() =>  db.into('fiber_and_material_types').insert(fiberTypes))

            it('returns all the fiber types', () => {
                return supertest(app)
                    .get('/api/fibers/fiber-types')
                    .expect(200, fiberTypes)
            })
        })

        context('when there are no fiber types in the database', () => {
            it('returns 200 and an empty list', () => {
                return supertest(app)
                    .get('/api/fibers/fiber-types')
                    .expect(200, [])
            })
        })

        context('given a malicious fiber type', () => {
            beforeEach(() =>  db.into('fiber_and_material_types').insert(malFiberType))

            it('removes the attack content', () => {
                return supertest(app)
                    .get('/api/fibers/fiber-types')
                    .expect(200)
                    .expect(res => {
                        expect(res.body[0].english_name).to.eql(expectedFiberType.english_name)
                    })
            })
        })
    })

    describe('GET /api/fibers/:fiber_id/certifications', () => {
        context('when the fiber has certifications', () => {
            beforeEach(() =>  db.into('fiber_and_material_types').insert(fiberTypes))
            beforeEach(() =>  db.into('brands').insert(brands))
            beforeEach(() =>  db.into('factories').insert(factories))
            beforeEach(() =>  db.into('fibers_and_materials').insert(fibersPost))
            beforeEach(() =>  db.into('certifications').insert(certifications))
            beforeEach(() =>  db.into('fibers_to_certifications').insert(fibersToCerts))

            it('returns all the certifications', () => {
                const fiberId = 1

                return supertest(app)
                    .get(`/api/fibers/${fiberId}/certifications`)
                    .expect(200)
                    .expect(res => {
                        expect(res.body.certification_id).to.eql(certifications.id)
                        expect(res.body.fiber_id).to.eql(fibersPost.id)
                        expect(res.body.approved_by_admin).to.eql(certifications.approved_by_admin)
                        expect(res.body.date_published).to.eql(certifications.date_published)
                        expect(res.body.english_name).to.eql(certifications.english_name)
                        expect(res.body.website).to.eql(certifications.website)

                    })
            })
        })

        context('when the fiber does not have certifications', () => {
            beforeEach(() =>  db.into('fiber_and_material_types').insert(fiberTypes))
            beforeEach(() =>  db.into('brands').insert(brands))
            beforeEach(() =>  db.into('factories').insert(factories))
            beforeEach(() =>  db.into('fibers_and_materials').insert(fibersPost))

            it('returns all the certifications', () => {
                const fiberId = 1

                return supertest(app)
                    .get(`/api/fibers/${fiberId}/certifications`)
                    .expect(200, [])
            })
        })

        context('given a malicious certification', () => {
            beforeEach(() =>  db.into('fiber_and_material_types').insert(fiberTypes))
            beforeEach(() =>  db.into('brands').insert(brands))
            beforeEach(() =>  db.into('factories').insert(factories))
            beforeEach(() =>  db.into('fibers_and_materials').insert(fibersPost))
            beforeEach(() =>  db.into('certifications').insert(malCertification))
            beforeEach(() =>  db.into('fibers_to_certifications').insert(fiberToMalCert))

            it('removes the attack content from the fiber with id fiber_id', () => {
                const fiberId = 1

                return supertest(app)
                    .get(`/api/fibers/${fiberId}/certifications`, () => {
                        return supertest(app)
                            .get(`/api/fibers/${fiberId}/certifications`)
                            .expect(200, expectedCertification)
                    })
            })
        })
    })

    describe('Protected endpoints', () => {
        const protectedEndpoints = [
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
                path: '/api/fibers/1/certifications'
            }
        ]

        protectedEndpoints.forEach(endpoint => {
            describe(endpoint.name, () => {
                beforeEach(() =>  db.into('fiber_and_material_types').insert(fiberTypes))
                beforeEach(() =>  db.into('brands').insert(brands))
                beforeEach(() =>  db.into('factories').insert(factories))
                beforeEach(() =>  db.into('fibers_and_materials').insert(fibersPost))

                it(`responds with 401 'Missing basic token' when no basic token`, () => (
                    supertest(app)
                        .post(endpoint.path)
                        .send({})
                        .expect(401, { error: `Missing basic token`})
                ))
    
                it(`responds 401 'Unauthorized request' when no credentials in token`, () => {
                    const userNoCreds = { email: '', password: '' }
                    return supertest(app)
                        .post(endpoint.path)
                        .set('Authorization', makeAuthHeader(userNoCreds))
                        .send({})
                        .expect(401, { error: `Unauthorized request` })
                })
    
                it(`responds 401 'Unatuhorized request' when invalid user`, () => {
                    const invalidUserCreds =  { email: 'not-a-user', password: 'incorrect-password' }
                    
                    return supertest(app)
                        .post(endpoint.path)
                        .set('Authorization', makeAuthHeader(invalidUserCreds))
                        .send({})
                        .expect(401, { error: 'Unauthorized request' })
                })
    
                it(`responds 401 'Unauthorized request' when the password is wrong`, () => {
                    const incorrectPassword = { email: user.email, password: 'wrong' }
    
                    return supertest(app)
                        .post(endpoint.path)
                        .set('Authorization', makeAuthHeader(incorrectPassword))
                        .send({})
                        .expect(401, { error: 'Unauthorized request' })
                })
            })
        })

        describe('PATCH /api/fibers/:fiber_id', () => {
            beforeEach(() =>  db.into('fiber_and_material_types').insert(fiberTypes))
            beforeEach(() =>  db.into('brands').insert(brands))
            beforeEach(() =>  db.into('factories').insert(factories))
            beforeEach(() =>  db.into('fibers_and_materials').insert(fibersPost))

            it(`responds with 401 'Missing basic token' when no basic token`, () => (
                supertest(app)
                    .patch('/api/fibers/1')
                    .send({ fiber_or_material_type_id: fibersPost.fiber_or_material_type_id })
                    .expect(401, { error: `Missing basic token`})
            ))

            it(`responds 401 'Unauthorized request' when no credentials in token`, () => {
                const userNoCreds = { email: '', password: '' }
                return supertest(app)
                    .patch(`/api/fibers/1`)
                    .set('Authorization', makeAuthHeader(userNoCreds))
                    .send({ fiber_or_material_type_id: fibersPost.fiber_or_material_type_id })
                    .expect(401, { error: `Unauthorized request` })
            })

            it(`responds 401 'Unatuhorized request' when invalid user`, () => {
                const invalidUserCreds =  { email: 'not-a-user', password: 'incorrect-password' }
                
                return supertest(app)
                    .patch(`/api/fibers/1`)
                    .set('Authorization', makeAuthHeader(invalidUserCreds))
                    .send({ fiber_or_material_type_id: fibersPost.fiber_or_material_type_id })
                    .expect(401, { error: 'Unauthorized request' })
            })

            it(`responds 401 'Unauthorized request' when the password is wrong`, () => {
                const incorrectPassword = { email: user.email, password: 'wrong' }

                return supertest(app)
                    .patch('/api/fibers/1')
                    .set('Authorization', makeAuthHeader(incorrectPassword))
                    .send({ fiber_or_material_type_id: fibersPost.fiber_or_material_type_id })
                    .expect(401, { error: 'Unauthorized request' })
            })
        })

        describe('DELETE /api/fibers/:fiber_id', () => {
            beforeEach(() =>  db.into('fiber_and_material_types').insert(fiberTypes))
            beforeEach(() =>  db.into('brands').insert(brands))
            beforeEach(() =>  db.into('factories').insert(factories))
            beforeEach(() =>  db.into('fibers_and_materials').insert(fibersPost))

            it(`responds with 401 'Missing basic token' when no basic token`, () => (
                supertest(app)
                    .delete('/api/fibers/1')
                    .expect(401, { error: `Missing basic token`})
            ))

            it(`responds 401 'Unauthorized request' when no credentials in token`, () => {
                const userNoCreds = { email: '', password: '' }
                return supertest(app)
                    .delete(`/api/fibers/1`)
                    .set('Authorization', makeAuthHeader(userNoCreds))
                    .expect(401, { error: `Unauthorized request` })
            })

            it(`responds 401 'Unatuhorized request' when invalid user`, () => {
                const invalidUserCreds =  { email: 'not-a-user', password: 'incorrect-password' }
                
                return supertest(app)
                    .delete(`/api/fibers/1`)
                    .set('Authorization', makeAuthHeader(invalidUserCreds))
                    .expect(401, { error: 'Unauthorized request' })
            })

            it(`responds 401 'Unauthorized request' when the password is wrong`, () => {
                const incorrectPassword = { email: user.email, password: 'wrong' }

                return supertest(app)
                    .delete('/api/fibers/1')
                    .set('Authorization', makeAuthHeader(incorrectPassword))
                    .expect(401, { error: 'Unauthorized request' })
            })
        })
    })    

    describe('POST /api/fibers', () => {
        beforeEach(() =>  db.into('fiber_and_material_types').insert(fiberTypes))
        beforeEach(() =>  db.into('fiber_and_material_types').insert(malFiberType))
        beforeEach(() =>  db.into('brands').insert(brands))
        beforeEach(() =>  db.into('brands').insert(malBrand))
        beforeEach(() =>  db.into('factories').insert(factories))
        beforeEach(() =>  db.into('factories').insert(malFactory))
        beforeEach(() => db.into('users').insert(users))

        it('creates a fiber, responding with 201 and the new fiber', () => {
            const newFiber = {
                fiber_or_material_type_id: 1,
                brand_id: 1,
                producer_country: 1,
                producer_id: 1,
                production_notes: 'Notes'
            }

            return supertest(app)
                .post('/api/fibers')
                .set('Authorization', makeAuthHeader(user))
                .send(newFiber)
                .expect(201)
                .expect(res => {
                    expect(res.body.fiber_or_material_type_id).to.eql(newFiber.fiber_or_material_type_id)
                    expect(res.body.brand_id).to.eql(newFiber.brand_id)
                    expect(res.body.producer_country).to.eql(newFiber.producer_country)
                    expect(res.body.producer_id).to.eql(newFiber.producer_id)
                    expect(res.body.production_notes).to.eql(newFiber.production_notes)
                    expect(res.body.approved_by_admin).to.eql(false)
                    const expected = new Date().toLocaleString()
                    const actual = new Date(res.body.date_published).toLocaleString()
                    expect(actual).to.eql(expected)
                })
                .then(async res => {
                    const expectedFiber = {
                        ...res.body,
                        fiber_type: 'Cotton',
                        class: 'naturally occuring cellulosic fiber',
                        producer: 'The Orange Concept',
                        producer_website: 'www.orange.com'
                    }

                    await supertest(app)
                        .get(`/api/fibers/${res.body.id}`)
                        .expect(expectedFiber)
                        .catch(error => {
                            console.log(error)
                        })
                })
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
                    .expect(400, {
                        error: { message: `Missing '${field}' in request body`}
                    })
            })
        })

        it('removes XSS attack content from the response', () => {
            return supertest(app)
                .post('/api/fibers')
                .set('Authorization', makeAuthHeader(user))
                .send(malFiber)
                .expect(201)
                .expect(res => {
                    expect(res.body.production_notes).to.eql(expectedFiber.production_notes)
                })
        })
    })

    describe('POST /api/fibers/fiber-types', () => {
        beforeEach(() => db.into('users').insert(user))

        it('creates a fiber type, responding with 201 and the new fiber type', () => {
            const newFiberType = {
                english_name: 'Cotton',
                fiber_type_class: 'naturally occuring cellulosic fiber'
            }
            
            return supertest(app)
                .post('/api/fibers/fiber-types')
                .send(newFiberType)
                .set('Authorization', makeAuthHeader(user))
                .expect(201)
                .expect(res => {
                    expect(res.body.english_name).to.eql(newFiberType.english_name)
                    expect(res.body.fiber_type_class).to.eql(newFiberType.fiber_type_class)
                    expect(res.body.approved_by_admin).to.eql(false)
                    const expected = new Date().toLocaleString()
                    const actual = new Date(res.body.date_published).toLocaleString()
                    expect(actual).to.eql(expected)
                })
                .then(async res => {
                    const expectedFiberArray = [{...res.body}]

                    await supertest(app)
                        .get(`/api/fibers/fiber-types`)
                        .expect(200)
                        .expect(expectedFiberArray)
                        .catch(error => {
                            console.log(error)
                        })
                })
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
                    .expect(400, { 
                        error: { message: `Missing '${field}' in request body`}
                    })
            })
        })

        it('removes XSS attack content from the response', () => {
            const malFiberType = {
                english_name: '<a>Bad fiber type</a>'
            }

            return supertest(app)
                .post('/api/fibers/fiber-types')
                .set('Authorization', makeAuthHeader(user))
                .send(malFiberType)
                .expect(201)
                .expect(res => {
                    expect(res.body.english_name).to.eql('&lt;a&gt;Bad fiber type&lt;/a&gt;')
                })
        })
    })

    describe('POST /api/fibers/:fiber_id/certifications', () => {
        beforeEach(() =>  db.into('fiber_and_material_types').insert(fiberTypes))
        beforeEach(() =>  db.into('brands').insert(brands))
        beforeEach(() =>  db.into('factories').insert(factories))
        beforeEach(() =>  db.into('fibers_and_materials').insert(fibersPost))
        beforeEach(() =>  db.into('certifications').insert(certifications))
        beforeEach(() =>  db.into('users').insert(users))

        it('pairs a fiber and certification, responding with 201 and the fiber-certification pair', () => {
            const fiberId = 1

            const fiberCertPair = {
                fiber_or_material_id: fiberId,
                certification_id: 1
            }
            
            return supertest(app)
                .post(`/api/fibers/${fiberId}/certifications`)
                .set('Authorization', makeAuthHeader(user))
                .send(fiberCertPair)
                .expect(201, fiberCertPair)
        })

        it(`returns 400 and an error message when the 'certification_id' is missing`, () => {
            const fiberId = 1

            const fiberCertPair = {
                fiber_or_material_id: fiberId,
                certification_id: 1
            }

            delete fiberCertPair['certification_id']

            return supertest(app)
                .post(`/api/fibers/${fiberId}/certifications`)
                .set('Authorization', makeAuthHeader(user))
                .send(fiberCertPair)
                .expect(400, {
                    error: { message: `Missing 'certification_id' in request body`}
                })
        })
    })

    describe('PATCH /api/fibers/:fiber_id', () => {
        const adminUser = adminArray[0]

        context('when the fiber with id fiber_id exists', () => {
            beforeEach(() =>  db.into('fiber_and_material_types').insert(fiberTypes))
            beforeEach(() =>  db.into('brands').insert(brands))
            beforeEach(() =>  db.into('factories').insert(factories))
            beforeEach(() =>  db.into('fibers_and_materials').insert(fibersPost))
            beforeEach(() => db.into('users').insert(adminArray))

            it('updates the fiber and responds 204', () => {
                const idToUpdate = 1

                const updateFiber = {
                    fiber_or_material_type_id: 1,
                    brand_id: 1,
                    producer_country: 1,
                    producer_id: 1,
                    production_notes: 'New notes',
                    approved_by_admin: false
                }
    
                const expectedFiber = {
                    ...fibersGet[idToUpdate - 1],
                    fiber_or_material_type_id: updateFiber.fiber_or_material_type_id,
                    brand_id: updateFiber.brand_id,
                    producer_country: updateFiber.producer_country,
                    producer_id: updateFiber.producer_id,
                    production_notes: updateFiber.production_notes,
                    approved_by_admin: updateFiber.approved_by_admin
                }
    
                return supertest(app)
                    .patch(`/api/fibers/${idToUpdate}`)
                    .set('Authorization', makeAuthHeader(adminUser))
                    .send(updateFiber)
                    .expect(204)
                    .then(res => {
                        supertest(app)
                            .get(`/api/fibers/${idToUpdate}`)
                            .expect(expectedFiber)
                            .catch(error => {
                                console.log(error)
                            })
                    })
            })

            it('responds with 400 when no required fields are supplied', () => {
                    const idToUpdate = 1
                    return supertest(app)
                        .patch(`/api/fibers/${idToUpdate}`)
                        .set('Authorization', makeAuthHeader(adminUser))
                        .send({irrelevantField: 'bar'})
                        .expect(400, {
                            error: { message: `Request body must contain 'fiber_or_material_type_id', 'brand_id', 'producer_country', 'producer_id', 'production_notes', and/or 'approved_by_admin'`}
                        })
            })

            it('responds with 204 when updating only a subset of fields', () => {
                    const idToUpdate = 1
                    const updateFiber = {
                        fiber_or_material_type_id: 2
                    }
        
                    const expectedFiber = {
                        ...fibersGet[idToUpdate - 1],
                        fiber_or_material_type_id: 2,
                        fiber_type: 'Wool',
                        class: 'protein fiber',
                    }
        
                    return supertest(app)
                        .patch(`/api/fibers/${idToUpdate}`)
                        .set('Authorization', makeAuthHeader(adminUser))
                        .send(updateFiber)
                        .expect(204)
                        .then(res => {
                            supertest(app)
                                .get(`/api/fibers/${idToUpdate}`)
                                .expect(expectedFiber)
                                .catch(error => {
                                    console.log(error)
                                })
                        })
            })
        })

        context('when the fabric with id fabric_id does not exist', () => {
            const idToUpdate = 1
            const updateFabric = {
                fabric_type_id: 1,
                brand_id: 1,
                fabric_mill_country: 1,
                fabric_mill_notes: 'This is a fabric mill in Peru',
                dye_print_finish_country: 1,
                dye_print_finish_notes: 'This is a dye plant in Peru',
                approved_by_admin: true
            }

            it('responds with 404', () => {
                return supertest(app)
                    .patch(`/api/fabrics/${idToUpdate}`)
                    .set('Authorization', makeAuthHeader(adminUser))
                    .send(updateFabric)
                    .expect(404, {
                        error: { message: `Fabric does not exist.`} } )
            })
        })
    })

    describe('DELETE /api/fibers/:fiber_id', () => {
        beforeEach(() => db.into('users').insert(adminArray))

        const adminUser = adminArray[0]
        
        context('when the fiber with id fiber_id exists', () => {
            beforeEach(() =>  db.into('fiber_and_material_types').insert(fiberTypes))
            beforeEach(() =>  db.into('brands').insert(brands))
            beforeEach(() =>  db.into('factories').insert(factories))
            beforeEach(() =>  db.into('fibers_and_materials').insert(fibersPost))

            it('removes the fiber and responds 204', () => {
                const idToRemove = 1
                const expectedFibers = fibersGet.filter(fiber => fiber.id !== idToRemove)

                return supertest(app)
                    .delete(`/api/fibers/${idToRemove}`)
                    .set('Authorization', makeAuthHeader(adminUser))
                    .expect(204)
                    .then(res => {
                        supertest(app)
                            .get('/api/fibers')
                            .expect(expectedFibers)
                            .catch(error => {
                                console.log(error)
                            })
                    })    
            })
        })

        context('when the fiber with id fiber_id does not exist', () => {
            beforeEach(() =>  db.into('fiber_and_material_types').insert(fiberTypes))
            beforeEach(() =>  db.into('brands').insert(brands))
            beforeEach(() =>  db.into('factories').insert(factories))
            beforeEach(() =>  db.into('fibers_and_materials').insert(fibersPost))
            beforeEach(() => db.into('users').insert(users))

            it('responds with 404', () => {
                const idToRemove = 222

                return supertest(app)
                    .delete(`/api/fabrics/${idToRemove}`)
                    .set('Authorization', makeAuthHeader(adminUser))
                    .expect(404, {
                        error: { message: `Fabric does not exist.`} } )
            })
        })
    })
})