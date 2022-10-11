const knex = require('knex')
const jwt = require('jsonwebtoken')
const app = require('../src/app')

const { makeBrandArray, makeMalBrand } = require('./brands.fixtures')
const { makeCertificationArray, makeMalCertification } = require('./certifications.fixtures')
const {
    makeFabricsToCertifications, makeFabricsToFactories, makeFabricsToFibers,
    makeFabricsTomalFibers, makeFabricsTomalCertifications, makeFabricsTomalFactories, makeFabricTypeArray,
    makeFibersToFactories, makeNotionTypesArray, makeMalNotionType, makeMalFabric, makeMalFibersToFactories
} = require('./fabrics.fixtures')
const { makeFactoryArray, makeMalFactory } = require('./factories.fixtures')
const { makeFiberArray, makeFiberTypeArray, makeMalFiber, makeMalFiberType } = require('./fibers.fixtures')
const { hashedAdminArray, hashedUserArray, makeAdminArray, makeUserArray } = require('./users.fixtures')

describe('Fabrics Endpoints', () => {
    const adminArray = makeAdminArray()
    const fabricTypes = makeFabricTypeArray()
    const fiberTypes = makeFiberTypeArray()
    const notionTypes = makeNotionTypesArray()
    const brands = makeBrandArray()
    const { fabricArray, expectedFabricArray } = makeFabricArray()
    const { fibersPost, fibersGet} = makeFiberArray()
    const factories = makeFactoryArray()
    const hashAdminArray = hashedAdminArray()
    const hashUserArray = hashedUserArray()
    const certifications = makeCertificationArray()
    const fabricsToFibers = makeFabricsToFibers()
    const fibersToFactories = makeFibersToFactories()
    const fabricsToFactories = makeFabricsToFactories()
    const { malBrand } = makeMalBrand()
    const { malFabric, expectedFabric } = makeMalFabric()
    const { malFiber, expectedFiber } = makeMalFiber()
    const { malFiberType } = makeMalFiberType()
    const { malNotionType, expectedNotionType } = makeMalNotionType()
    const { malFactory, expectedFactory } = makeMalFactory()
    const { malCertification, expectedCertification } = makeMalCertification()
    const malFibersToFactories = makeMalFibersToFactories()
    const fabricsTomalFibers = makeFabricsTomalFibers()
    const fabricsToCertifications = makeFabricsToCertifications()
    const fabricsTomalCertifications = makeFabricsTomalCertifications()
    const fabricsTomalFactories = makeFabricsTomalFactories()
    const userArray = makeUserArray()

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
    
    before('clean the table', () => db.raw(
        `TRUNCATE table fabric_types, brands, fabrics, factories, fiber_and_material_types, fibers_to_factories, fabrics_to_fibers_and_materials, 
        notion_types, certifications, fabrics_to_certifications, users RESTART IDENTITY CASCADE`
    ))

    afterEach('cleanup', () => db.raw(
        `TRUNCATE table 
        fabrics_to_certifications, 
        fabrics_to_fibers_and_materials, 
        fabrics, 
        fabric_types, 
        brands, 
        factories, 
        fiber_and_material_types,
        fibers_to_factories, 
        notion_types, 
        certifications, 
        users 
        RESTART IDENTITY CASCADE`
    ))

    describe('GET /api/fabrics', () => {
        context('when there are fabrics in the database', () => {
            beforeEach(() =>  db.into('brands').insert(brands))
            beforeEach(() =>  db.into('fabrics').insert(fabricArray))
            
            it('returns all the fabrics', () => {
                return supertest(app)
                    .get('/api/fabrics')
                    .expect(200)
                    .expect(res => {
                        expect(res.body.brand_id).to.eql(fabricArray.brand_id)
                        expect(res.body.fabric_type).to.eql(fabricTypes.english_name)
                        expect(res.body.fabric_mill_id).to.eql(fabricArray.fabric_mill_id)
                        expect(res.body.fabric_mill_country).to.eql(fabricArray.fabric_mill_country)
                        expect(res.body.fabric_mill_notes).to.eql(fabricArray.fabric_mill_notes)
                        expect(res.body.dye_print_finish_id).to.eql(fabricArray.dye_print_finish_id)
                        expect(res.body.dye_print_finish_country).to.eql(fabricArray.dye_print_finish_country)
                        expect(res.body.dye_print_finish_notes).to.eql(fabricArray.dye_print_finish_notes)
                        expect(res.body.approved_by_admin).to.eql(fabricArray.approved_by_admin)
                    })
            })
        })

        context('when there are no fabrics in the database', () => {
            it('responds with 200 and an empty list', () => {
            
            return supertest(app)
                .get('/api/fabrics')
                .expect(200, [])
            })
        })

        context('given a malicious fabric', () => {
            beforeEach(() =>  db.into('fabric_types').insert(fabricTypes))
            beforeEach(() =>  db.into('brands').insert(brands))
            beforeEach(() =>  db.into('fabrics').insert( malFabric ))

            it('removes the attack content', () => {
                return supertest(app)
                    .get('/api/fabrics')
                    .expect(200)
                    .expect(res => {
                        expect(res.body[0].fabric_mill_notes).to.eql(expectedFabric.fabric_mill_notes)
                        expect(res.body[0].dye_print_finish_notes).to.eql(expectedFabric.dye_print_finish_notes)
                    })
            })
        })
    })

    describe('GET /api/fabrics/notion-types', () => {
        context('when there are notion types in the database', () => {
            beforeEach(() =>  db.into('notion_types').insert(notionTypes))

            it('returns all the notion types', () => {
                return supertest(app)
                    .get('/api/fabrics/notion-types')
                    .expect(200, notionTypes)
            })
        })

        context('when there are no notion types in the database', () => {
            it('returns 200 and an empty list', () => {
                return supertest(app)
                    .get('/api/fabrics/notion-types')
                    .expect(200, [])
            })
        })

        context('given a malicious notion type', () => {
            beforeEach(() =>  db.into('notion_types').insert(malNotionType))

            it('removes the attack content', () => {
                return supertest(app)
                    .get('/api/fabrics/notion-types')
                    .expect(200)
                    .expect(res => {
                        expect(res.body[0].english_name).to.eql(expectedNotionType.english_name)
                    })
                    
            })
        })
    })

    describe('GET /api/fabrics/:fabric_id', () => {
        context('when the fabric with id fabric_id exists', () => {
            beforeEach(() =>  db.into('fabric_types').insert(fabricTypes))
            beforeEach(() =>  db.into('brands').insert(brands))
            beforeEach(() =>  db.into('fabrics').insert(fabricArray))

            const fabricId = fabricArray[0].id

            it('returns the fabric with id fabric_id', () => {
                return supertest(app)
                    .get(`/api/fabrics/${fabricId}`)
                    .expect(200, expectedFabricArray[fabricId - 1])
            })
        })

        context('when the fabric with id fabric_id does not exist', () => {
            const fabricId = 1

            it('responds with 404 and an error message', () => {
                return supertest(app)
                    .get(`/api/fabrics/${fabricId}`)
                    .expect(404, { error: { message: 'Fabric does not exist.' } })
            })
        })

        context('when the fabric with id fabric_id is a malicious fabric', () => {
            beforeEach(() =>  db.into('fabric_types').insert(fabricTypes))
            beforeEach(() =>  db.into('brands').insert(brands))
            beforeEach(() =>  db.into('fabrics').insert(malFabric))

            const fabricId = malFabric.id

            it('removes the attack content from the fabric with id fabric_id', () => {
                return supertest(app)
                    .get(`/api/fabrics/${fabricId}`)
                    .expect(200)
                    .expect(res => {
                        expect(res.body.fabric_mill_notes).to.eql(expectedFabric.fabric_mill_notes)
                        expect(res.body.dye_print_finish_notes).to.eql(expectedFabric.dye_print_finish_notes)
                    })
            })
        })
    })

    describe('GET /api/fabrics/:fabric_id/certifications', () => {
        context('when there are certifications in the database', () => {
            beforeEach(() =>  db.into('certifications').insert(certifications))
            beforeEach(() =>  db.into('fabric_types').insert(fabricTypes))
            beforeEach(() =>  db.into('brands').insert(brands))
            beforeEach(() =>  db.into('fabrics').insert(fabricArray))
            beforeEach(() =>  db.into('fabrics_to_certifications').insert(fabricsToCertifications))

            const fabricId = 1

            it('returns all the certifications for the fabric with fabric_id', () => {
                return supertest(app)
                    .get(`/api/fabrics/${fabricId}/certifications`)
                    .expect(200)
                    .expect(res => {
                        expect(res.body[0].id).to.eql(certifications[0].id)
                        expect(res.body[0].english_name).to.eql(certifications[0].english_name)
                        expect(res.body[0].website).to.eql(certifications[0].website)
                        expect(res.body[0].approved_by_admin).to.eql(certifications[0].approved_by_admin)
                        expect(res.body[0].date_published).to.eql(certifications[0].date_published)
                    })
            })
        })

        context('when there are no certifications in the database', () => {
            beforeEach(() =>  db.into('fabric_types').insert(fabricTypes))
            beforeEach(() =>  db.into('brands').insert(brands))
            beforeEach(() =>  db.into('fabrics').insert(fabricArray))

            const fabricId = 1

            it('responds with 200 and an empty array', () => {

            return supertest(app)
                    .get(`/api/fabrics/${fabricId}/certifications`)
                    .expect(200, [])
            })        
        })

        context('given a malicious certification', () => {
            beforeEach(() =>  db.into('certifications').insert(malCertification))
            beforeEach(() =>  db.into('fabric_types').insert(fabricTypes))
            beforeEach(() =>  db.into('brands').insert(brands))
            beforeEach(() =>  db.into('fabrics').insert(fabricArray))
            beforeEach(() =>  db.into('fabrics_to_certifications').insert(fabricsTomalCertifications))

            const fabricId = 1

            it('returns all the certifications for the fabric with fabric_id', () => {
                return supertest(app)
                    .get(`/api/fabrics/${fabricId}/certifications`)
                    .expect(200)
                    .expect(res => {
                        expect(res.body[0].id).to.eql(expectedCertification.id)
                        expect(res.body[0].english_name).to.eql(expectedCertification.english_name)
                        expect(res.body[0].website).to.eql(expectedCertification.website)
                        expect(res.body[0].approved_by_admin).to.eql(expectedCertification.approved_by_admin)
                    })
            })
        })
    })

    describe('GET /api/fabrics/:fabric_id/factories', () => {        
        context('when there are factories in the database', () => {
            beforeEach(() =>  db.into('factories').insert(factories))
            beforeEach(() =>  db.into('fabric_types').insert(fabricTypes))
            beforeEach(() =>  db.into('brands').insert(brands))
            beforeEach(() =>  db.into('fabrics').insert(fabricArray))
            beforeEach(() =>  db.into('fabrics_to_factories').insert(fabricsToFactories))

            const fabricId = 1

            it('returns all the factories for the fabric with fabric_id', () => {
                return supertest(app)
                    .get(`/api/fabrics/${fabricId}/factories`)
                    .expect(200)
                    .expect(res => {
                        expect(res.body[0].id).to.eql(factories[0].id)
                        expect(res.body[0].english_name).to.eql(factories[0].english_name)
                        expect(res.body[0].country).to.eql(factories[0].country)
                        expect(res.body[0].website).to.eql(factories[0].website)
                        expect(res.body[0].notes).to.eql(factories[0].notes)
                        expect(res.body[0].approved_by_admin).to.eql(factories[0].approved_by_admin)
                    })
            })
        })

        context('when there are no factories in the database', () => {
            beforeEach(() =>  db.into('fabric_types').insert(fabricTypes))
            beforeEach(() =>  db.into('brands').insert(brands))
            beforeEach(() =>  db.into('fabrics').insert(fabricArray))

            const fabricId = 1

            it('responds with 200 and an empty array', () => {

                return supertest(app)
                        .get(`/api/fabrics/${fabricId}/factories`)
                        .expect(200, [])
            })
        })

        context('given a malicious factory', () => {
            beforeEach(() =>  db.into('fabric_types').insert(fabricTypes))
            beforeEach(() =>  db.into('brands').insert(brands))
            beforeEach(() =>  db.into('fabrics').insert(fabricArray))
            beforeEach(() =>  db.into('factories').insert(malFactory))
            beforeEach(() =>  db.into('fabrics_to_factories').insert(fabricsTomalFactories))

            const fabricId = 1

            it('removes the attack content', () => {
                return supertest(app)
                    .get(`/api/fabrics/${fabricId}/factories`)
                    .expect(200)
                    .expect(res => {
                        expect(res.body[0].id).to.eql(expectedFactory.id)
                        expect(res.body[0].english_name).to.eql(expectedFactory.english_name)
                        expect(res.body[0].country).to.eql(expectedFactory.country)
                        expect(res.body[0].website).to.eql(expectedFactory.website)
                        expect(res.body[0].notes).to.eql(expectedFactory.notes)
                        expect(res.body[0].approved_by_admin).to.eql(expectedFactory.approved_by_admin)
                    })
                })
        })
    })

    describe('GET /api/fabrics/:fabric_id/fibers', () => {
        context('when there are fibers in the database', () => {
            const fabricId = 1

            beforeEach(() =>  db.into('brands').insert(brands))
            beforeEach(() =>  db.into('factories').insert(factories)) 
            beforeEach(() =>  db.into('fabrics').insert(fabricArray))
            beforeEach(() =>  db.into('fiber_and_material_types').insert(fiberTypes))
            beforeEach(() =>  db.into('fibers_and_materials').insert(fibersPost))
            beforeEach(() =>  db.into('fabrics_to_fibers_and_materials').insert(fabricsToFibers))
            beforeEach(() =>  db.into('fibers_to_factories').insert(fibersToFactories))

            it('returns all the fibers for the fabric with fabric_id', () => {
                return supertest(app)
                    .get(`/api/fabrics/${fabricId}/fibers`)
                    .expect(200)
                    .expect(res => {
                        expect(res.body[0].id).to.eql(fibersGet[0].id)
                        expect(res.body[0].brand_id).to.eql(fibersGet[0].brand_id),
                        expect(res.body[0].fiber_or_material_id).to.eql(fibersGet[0].fiber_or_material_id)
                        expect(res.body[0].fiber_type).to.eql(fibersGet[0].fiber_type)
                        expect(res.body[0].class).to.eql(fibersGet[0].class)
                        expect(res.body[0].producer_country).to.eql(fibersGet[0].producer_country)
                        expect(res.body[0].producer_id).to.eql(fibersGet[0].producer_id)
                        expect(res.body[0].producer).to.eql(fibersGet[0].producer)
                        expect(res.body[0].producer_country).to.eql(fibersGet[0].producer_country)
                        expect(res.body[0].producer_website).to.eql(fibersGet[0].producer_website)
                        expect(res.body[0].production_notes).to.eql(fibersGet[0].production_notes)
                        expect(res.body[0].approved_by_admin).to.eql(fibersGet[0].approved_by_admin)
                    })
            })
        })

        context('when there are no fibers in the database', () => {
            beforeEach(() =>  db.into('fabric_types').insert(fabricTypes))
            beforeEach(() =>  db.into('brands').insert(brands))
            beforeEach(() =>  db.into('factories').insert(factories))
            beforeEach(() =>  db.into('fabrics').insert(fabricArray))

            const fabricId = 1

            it('returns 200 and an empty list', () => {
                return supertest(app)
                    .get(`/api/fabrics/${fabricId}/fibers`)
                    .expect(200, [])
            })
        })

        context('given a malicious fiber', () => {
            beforeEach(() =>  db.into('brands').insert(brands))
            beforeEach(() =>  db.into('brands').insert(malBrand))
            beforeEach(() =>  db.into('factories').insert(malFactory)) 
            beforeEach(() =>  db.into('fabrics').insert(fabricArray))
            beforeEach(() =>  db.into('fiber_and_material_types').insert(malFiberType))
            beforeEach(() =>  db.into('fibers_and_materials').insert(malFiber))
            beforeEach(() =>  db.into('fabrics_to_fibers_and_materials').insert(fabricsTomalFibers))
            beforeEach(() =>  db.into('fibers_to_factories').insert(malFibersToFactories))
            
            const fabricId = 1

            it('removes the attack content from the fiber(s) for the fabric with id fabric_id', () => {
                return supertest(app)
                    .get(`/api/fabrics/${fabricId}/fibers`)
                    .expect(200)
                    .expect(res => {
                        expect(res.body[0].producer_website).to.eql(expectedFiber.producer_website)
                        expect(res.body[0].production_notes).to.eql(expectedFiber.production_notes)
                    })
            })
        })
    })

    describe('Protected endpoints', () => {
        const newFabric = {
            brand_id: 1,
            fabric_mill_country: 1,
            fabric_mill_id: 1,
            fabric_mill_notes: 'over 200 employees',
            dye_print_finish_country: 1,
            dye_print_finish_id: 1,
            dye_print_finish_notes: '1000 employees',
            approved_by_admin: true
        }

        const protectedEndpoints = [
            {
                name: 'POST /api/fabrics',
                path: '/api/fabrics'
            },
            {
                name: 'POST /api/fabrics/notion-types',
                path: '/api/fabrics/notion-types'
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
                beforeEach(() =>  db.into('brands').insert(brands))
                beforeEach(() =>  db.into('certifications').insert(certifications))
                beforeEach(() =>  db.into('fabric_types').insert(fabricTypes))
                beforeEach(() =>  db.into('notion_types').insert(notionTypes))
                beforeEach(() =>  db.into('fabrics').insert(fabricArray))

                it(`responds with 401 'Missing bearer token' when no basic token`, () => (
                    supertest(app)
                        .post(endpoint.path)
                        .send(newFabric)
                        .expect(401, { error: `Missing bearer token`})
                ))
    
                it(`responds 401 'Unauthorized request' when no credentials in token`, () => {
                    const userNoCreds = { email: '', password: '' }
                    return supertest(app)
                        .post(endpoint.path)
                        .set('Authorization', makeAuthHeader(userNoCreds))
                        .send(newFabric)
                        .expect(401, { error: `Unauthorized request` })
                })
    
                it(`responds 401 'Unatuhorized request' when invalid user`, () => {
                    const invalidUserCreds =  { email: 'not-a-user', password: 'incorrect-password' }
                    
                    return supertest(app)
                        .post(endpoint.path)
                        .set('Authorization', makeAuthHeader(invalidUserCreds))
                        .send(newFabric)
                        .expect(401, { error: 'Unauthorized request' })
                })
    
                it(`responds 401 'Unauthorized request' when the password is wrong`, () => {
                    const incorrectPassword = { email: userArray[0].email, password: 'wrong' }
    
                    return supertest(app)
                        .post(endpoint.path)
                        .set('Authorization', makeAuthHeader(incorrectPassword))
                        .send(newFabric)
                        .expect(401, { error: 'Unauthorized request' })
                })
            })
        })

        describe('PATCH /api/fabrics/:fabric_id', () => {
            beforeEach(() =>  db.into('fabric_types').insert(fabricTypes))
            beforeEach(() => db.into('brands').insert(brands))
            beforeEach(() => db.into('fabrics').insert(fabricArray))

            it(`responds with 401 'Missing bearer tokenn' when no basic token`, () => (
                supertest(app)
                    .patch('/api/fabrics/1')
                    .send({ fabric_mill_country: newFabric.fabric_mill_country})
                    .expect(401, { error: `Missing bearer token`})
            ))

            it(`responds 401 'Unauthorized request' when no credentials in token`, () => {
                const userNoCreds = { email: '', password: '' }

                return supertest(app)
                    .patch('/api/fabrics/1')
                    .set('Authorization', makeAuthHeader(userNoCreds))
                    .send({ fabric_mill_country: newFabric.fabric_mill_country })
                    .expect(401, { error: `Unauthorized request` })
            })

            it(`responds 401 'Unatuhorized request' when invalid user`, () => {
                const invalidUserCreds =  { email: 'not-a-user', password: 'incorrect-password' }
                
                return supertest(app)
                    .patch(`/api/fabrics/1`)
                    .set('Authorization', makeAuthHeader(invalidUserCreds))
                    .send({ fabric_mill_country: newFabric.fabric_mill_country })
                    .expect(401, { error: 'Unauthorized request' })
            })

            it(`responds 401 'Unauthorized request' when the password is wrong`, () => {
                const incorrectPassword = { email: userArray[0].email, password: 'wrong' }

                return supertest(app)
                    .patch('/api/fabrics/1')
                    .set('Authorization', makeAuthHeader(incorrectPassword))
                    .send({ fabric_mill_country: newFabric.fabric_mill_country })
                    .expect(401, { error: 'Unauthorized request' })
            })
        })

        describe('DELETE /api/fabrics/:fabric_id', () => {
            beforeEach(() =>  db.into('fabric_types').insert(fabricTypes))
            beforeEach(() => db.into('brands').insert(brands))
            beforeEach(() => db.into('fabrics').insert(fabricArray))
                        
            it(`responds with 401 'Missing bearer token' when no basic token`, () => (
                supertest(app)
                    .delete('/api/fabrics/1')
                    .expect(401, { error: `Missing bearer token`})
            ))

            it(`responds 401 'Unauthorized request' when no credentials in token`, () => {
                const userNoCreds = { email: '', password: '' }
                return supertest(app)
                    .delete(`/api/fabrics/1`)
                    .set('Authorization', makeAuthHeader(userNoCreds))
                    .expect(401, { error: `Unauthorized request` })
            })

            it(`responds 401 'Unatuhorized request' when invalid user`, () => {
                const invalidUserCreds =  { email: 'not-a-user', password: 'incorrect-password' }
                
                return supertest(app)
                    .delete(`/api/fabrics/1`)
                    .set('Authorization', makeAuthHeader(invalidUserCreds))
                    .expect(401, { error: 'Unauthorized request' })
            })

            it(`responds 401 'Unauthorized request' when the password is wrong`, () => {
                const incorrectPassword = { email: userArray[0].email, password: 'wrong' }

                return supertest(app)
                    .delete('/api/fabrics/1')
                    .set('Authorization', makeAuthHeader(incorrectPassword))
                    .expect(401, { error: 'Unauthorized request' })
            })
        })
    })

    describe('POST /api/fabrics', () => {
        beforeEach(() =>  db.into('brands').insert(brands))
        beforeEach(() =>  db.into('fabric_types').insert(fabricTypes))
        beforeEach(() =>  db.into('users').insert(hashUserArray))

        it('creates a fabric, responding with 201 and the new fabric', () => {
            const newFabric = {
                brand_id: 1,
                fabric_mill_country: 1,
                fabric_mill_id: 1,
                fabric_mill_notes: 'over 200 employees',
                dye_print_finish_country: 1,
                dye_print_finish_id: 1,
                dye_print_finish_notes: '1000 employees',
                approved_by_admin: true
            }
    
            return supertest(app)
                .post('/api/fabrics')
                .set('Authorization', makeAuthHeader(userArray[0]))
                .send(newFabric)
                .expect(201)
                .expect(res => {
                    expect(res.body.brand_id).to.eql(newFabric.brand_id)
                    expect(res.body.fabric_mill_country).to.eql(newFabric.fabric_mill_country)
                    expect(res.body.fabric_mill_id).to.eql(newFabric.fabric_mill_id)
                    expect(res.body.fabric_mill_notes).to.eql(newFabric.fabric_mill_notes)
                    expect(res.body.dye_print_finish_country).to.eql(newFabric.dye_print_finish_country)
                    expect(res.body.dye_print_finish_id).to.eql(newFabric.dye_print_finish_id)
                    expect(res.body.dye_print_finish_notes).to.eql(newFabric.dye_print_finish_notes)
                    expect(res.body.approved_by_admin).to.eql(newFabric.approved_by_admin)
                    const expected = new Date().toLocaleString()
                    const actual = new Date(res.body.date_published).toLocaleString()
                    expect(actual).to.eql(expected)
                })
                .then(async res => {
                    const expectedFabric = {
                        ...res.body,
                        certification_ids: [],
                        fibers: []
                    }

                    await supertest(app)
                        .get(`/api/fabrics/${res.body.id}`)
                        .expect(200)
                        .expect(expectedFabric)
                        .catch(error => {
                            console.log(error)
                        })
                })
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
                brand_id: 1,
                fabric_mill_id: 1,
                fabric_mill_country: 1,
                fabric_mill_notes: 'over 200 employees',
                dye_print_finish_id: 1,
                dye_print_finish_country: 1,
                dye_print_finish_notes: '1000 employees',
                approved_by_admin: true
            }

            it(`responds with 400 and an error message when the '${field}' is missing`, () => {
                delete newFabric[field]

                return supertest(app)
                    .post('/api/fabrics')
                    .set('Authorization', makeAuthHeader(userArray[0]))
                    .send(newFabric)
                    .expect(400, {
                        error: { message: `Missing '${field}' in request body`}
                    })
            })
        })

        it('removes XSS attack content from the response', () => {
            return supertest(app)
                .post('/api/fabrics')
                .set('Authorization', makeAuthHeader(userArray[0]))
                .send(malFabric)
                .expect(201)
                .expect(res => {
                    expect(res.body.fabric_mill_notes).to.eql(expectedFabric.fabric_mill_notes)
                    expect(res.body.dye_print_finish_notes).to.eql(expectedFabric.dye_print_finish_notes)
                })
        })
    })

    describe('POST /api/fabrics/notion-types', () => {
        beforeEach(() =>  db.into('users').insert(hashUserArray))
        
        const newNotionType = {
            english_name: 'button',
            approved_by_admin: true
        }

        it('creates a notion-type, responding with 201 and the new fabric', () => {
            return supertest(app)
                .post('/api/fabrics/notion-types')
                .set('Authorization', makeAuthHeader(userArray[0]))
                .send(newNotionType)
                .expect(201)
                .expect(res => {
                    expect(res.body.english_name).to.eql(newNotionType.english_name)
                    expect(res.body.approved_by_admin).to.eql(newNotionType.approved_by_admin)
                    const expected = new Date().toLocaleString()
                    const actual = new Date(res.body.date_published).toLocaleString()
                    expect(actual).to.eql(expected)
                })
                .then(async res => {
                    await supertest(app)
                        .get(`/api/fabrics/notion-types`)
                        .expect(200)
                        .expect([res.body])
                        .catch(error => {
                            console.log(error)
                        })
                })
        })

        const requiredFields = [
            'english_name'        ]

        requiredFields.forEach(field => {
            const newNotionType = {
                english_name: 'button',
                approved_by_admin: true
            }

            delete newNotionType[field]

            it(`responds with 400 and an error message when the '${field}' is missing`, () => {
                return supertest(app)
                    .post('/api/fabrics/notion-types')
                    .set('Authorization', makeAuthHeader(userArray[0]))
                    .send(newNotionType)
                    .expect(400, {
                        error: { message: `Missing '${field}' in request body`}
                    })
            })
        })

        it('removes XSS attack content from the response', () => {
            return supertest(app)
                .post('/api/fabrics/notion-types')
                .set('Authorization', makeAuthHeader(userArray[0]))
                .send(malNotionType)
                .expect(201)
                .expect(res => {
                    expect(res.body.english_name).to.eql(expectedNotionType.english_name)
                })
        })
    })

    describe('POST /api/fabrics/:fabric_id/fibers', () => {
        beforeEach(() =>  db.into('fabric_types').insert(fabricTypes))
        beforeEach(() =>  db.into('fiber_and_material_types').insert(fiberTypes))
        beforeEach(() =>  db.into('brands').insert(brands))
        beforeEach(() =>  db.into('factories').insert(factories)) 
        beforeEach(() =>  db.into('fabrics').insert(fabricArray))
        beforeEach(() =>  db.into('fibers_and_materials').insert(fibersPost))
        beforeEach(() => db.into('users').insert(hashUserArray))

        const fabricFiberPair =  {
            fabric_id: 1,
            fiber_or_material_id: 1,
            percent_of_fabric: 100
        }

        it('creates a fiber, responding with 201 and the new fabric', () => {
            const fabricId = 1

            return supertest(app)
                .post(`/api/fabrics/${fabricId}/fibers`)
                .set('Authorization', makeAuthHeader(userArray[0]))
                .send(fabricFiberPair)
                .expect(201, fabricFiberPair)
        })

        const requiredFields = [
            'fiber_or_material_id'
        ]

        requiredFields.forEach(field => {
            it(`responds with 400 and an error message when the '${field}' is missing`, () => {
                const fabricFiberPair =  {
                    fiber_or_material_id: 1
                }
                
                delete fabricFiberPair[field]

                const fabricId = 1

                return supertest(app)
                    .post(`/api/fabrics/${fabricId}/fibers`)
                    .set('Authorization', makeAuthHeader(userArray[0]))
                    .send(fabricFiberPair)
                    .expect(400, {
                        error: { message: `Missing '${field}' in request body`}
                    })
            })
        })
    })

    describe('POST /api/fabrics/:fabric_id/certifications', () => {
        beforeEach(() =>  db.into('fabric_types').insert(fabricTypes))
        beforeEach(() =>  db.into('brands').insert(brands))
        beforeEach(() =>  db.into('factories').insert(factories)) 
        beforeEach(() =>  db.into('fabrics').insert(fabricArray))
        beforeEach(() =>  db.into('certifications').insert(certifications))
        beforeEach(() =>  db.into('users').insert(hashUserArray))
        
        const fabricId = 1

        it('creates a certification, responding with 201 and the new fabric', () => {
            const newFabricCertificationPair = {
                fabric_id: 1,
                certification_id: 1
            }

            return supertest(app)
                .post(`/api/fabrics/${fabricId}/certifications`)
                .set('Authorization', makeAuthHeader(userArray[0]))
                .send(newFabricCertificationPair)
                .expect(201, newFabricCertificationPair)
        })

        const requiredFields = [
            'certification_id'
        ]

        requiredFields.forEach(field => {
            it(`responds with 400 and an error message when the '${field}' is missing`, () => {
                const newFabricCertificationPair = {
                    certification_id: 1
                }

                delete newFabricCertificationPair[field]

                return supertest(app)
                    .post(`/api/fabrics/${fabricId}/certifications`)
                    .set('Authorization', makeAuthHeader(userArray[0]))
                    .send(newFabricCertificationPair)
                    .expect(400, {
                        error: { message: `Missing '${field}' in request body`}
                    })
            })
        })
    })

    describe('POST /api/fabrics/:fabric_id/factories', () => {
        beforeEach(() =>  db.into('fabric_types').insert(fabricTypes))
        beforeEach(() =>  db.into('brands').insert(brands))
        beforeEach(() =>  db.into('factories').insert(factories)) 
        beforeEach(() =>  db.into('fabrics').insert(fabricArray))
        beforeEach(() =>  db.into('users').insert(hashUserArray))

        const newFabricFactoryPair = {
            fabric_id: 1,
            factory_id: 1
        }

        const fabricId = 1

        it('creates a factory, responding with 201 and the new fabric', () => {
            return supertest(app)
                .post(`/api/fabrics/${fabricId}/factories`)
                .set('Authorization', makeAuthHeader(userArray[0]))
                .send(newFabricFactoryPair)
                .expect(201, newFabricFactoryPair)
        })

        const requiredFields = [
            'factory_id'
        ]

        requiredFields.forEach(field => {
            const newFabricFactoryPair = {
                factory_id: 1
            }

            delete newFabricFactoryPair[field]
            
            it(`responds with 400 and an error message when the '${field}' is missing`, () => {
                return supertest(app)
                    .post(`/api/fabrics/${fabricId}/factories`)
                    .set('Authorization', makeAuthHeader(userArray[0]))
                    .send(newFabricFactoryPair)
                    .expect(400, {
                        error: { message: `Missing '${field}' in request body`}
                    })
            })
        })
    })

    describe('PATCH /api/fabrics/:fabric_id', () => {
        beforeEach(() => db.into('users').insert(hashAdminArray))

        const idToUpdate = 1
        
        context('when the fabric with id fabric_id exists', () => {
            beforeEach(() =>  db.into('brands').insert(brands))
            beforeEach(() =>  db.into('fabrics').insert(fabricArray))

            it('updates the fabric and responds 204', () => {
                const updateFabric = {
                    brand_id: 1,
                    fabric_mill_country: 1,
                    fabric_mill_notes: 'This is a fabric mill in Peru',
                    dye_print_finish_country: 1,
                    dye_print_finish_notes: 'This is a dye plant in Peru',
                    approved_by_admin: true
                }

                const expectedFabric = {
                    ...fabricArray[idToUpdate - 1],
                    ...updateFabric,
                    certification_ids: [],
                    fibers: []
                }
    
                return supertest(app)
                    .patch(`/api/fabrics/${idToUpdate}`)
                    .set('Authorization', makeAuthHeader(adminArray[0]))
                    .send(updateFabric)
                    .expect(204)
                    .then(async res => {
                        await supertest(app)
                            .get(`/api/fabrics/${idToUpdate}`)
                            .expect(200)
                            .expect(expectedFabric)
                            .catch(error => {
                                console.log(error)
                            })
                    })
            })

            it('responds with 400 when no required fields are supplied', () => {
                    return supertest(app)
                        .patch(`/api/fabrics/${idToUpdate}`)
                        .set('Authorization', makeAuthHeader(adminArray[0]))
                        .send({irrelevantField: 'bar'})
                        .expect(400, {
                            error: { message: `Request body must include 'brand_id', 'fabric_mill_country', 'fabric_mill_id', 'fabric_mill_notes', 'dye_print_finish_country', 'dye_print_finish_id', 'dye_print_finish_notes', or 'approved_by_admin'`}
                        })
            })

            it('responds with 204 when updating only a subset of fields', () => {
                    const updateFabric = {
                        fabric_mill_notes: 'New note.'
                    }

                    const expectedFabric = {
                        ...fabricArray[idToUpdate - 1],
                        ...updateFabric,
                        certification_ids: [],
                        fibers: []
                    }
        
                    return supertest(app)
                        .patch(`/api/fabrics/${idToUpdate}`)
                        .set('Authorization', makeAuthHeader(adminArray[0]))
                        .send(updateFabric)
                        .expect(204)
                        .then(async res => {
                            await supertest(app)
                                .get(`/api/fabrics/${idToUpdate}`)
                                .expect(200)
                                .expect(expectedFabric)
                                .catch(error => {
                                    console.log(error)
                                })
                        })
            })
        })

        context('when the fabric with id fabric_id does not exist', () => {
            const updateFabric = {
                brand_id: 1,
                fabric_mill_country: 'PE',
                fabric_mill_notes: 'This is a fabric mill in Peru',
                dye_print_finish_country: 'US',
                dye_print_finish_notes: 'This is a dye plant in Peru',
                approved_by_admin: true
            }

            it('responds with 404', () => {
                return supertest(app)
                    .patch(`/api/fabrics/${idToUpdate}`)
                    .set('Authorization', makeAuthHeader(adminArray[0]))
                    .send(updateFabric)
                    .expect(404, {
                        error: { message: `Fabric does not exist.`} } )
            })
        })
    })

    describe('DELETE /api/fabrics/:fabric_id', () => {
        beforeEach(() => db.into('users').insert(hashAdminArray))

        context('when the fabric with id fabric_id exists', () => {
            beforeEach(() =>  db.into('fabric_types').insert(fabricTypes))
            beforeEach(() =>  db.into('brands').insert(brands))
            beforeEach(() =>  db.into('fabrics').insert(fabricArray))

            it('removes the fabric and responds 204', () => {
                const idToRemove = 1
                const expectedFabrics = fabricArray.filter(fabric => fabric.id !== idToRemove)

                return supertest(app)
                    .delete(`/api/fabrics/${idToRemove}`)
                    .set('Authorization', makeAuthHeader(adminArray[0]))
                    .expect(204)
                    .then(() => {
                        supertest(app)
                            .get('/api/fabrics')
                            .expect(expectedFabrics)
                            .catch(error => {
                                console.log(error)
                            })
                    })
            })
        })

        context('when the fabric with id fabric_id does not exist', () => {
            beforeEach(() =>  db.into('fabric_types').insert(fabricTypes))
            beforeEach(() =>  db.into('brands').insert(brands))
            beforeEach(() =>  db.into('fabrics').insert(fabricArray))

            it('responds with 404', () => {
                const idToRemove = 222

                return supertest(app)
                    .delete(`/api/fabrics/${idToRemove}`)
                    .set('Authorization', makeAuthHeader(adminArray[0]))
                    .expect(404, {
                        error: { message: `Fabric does not exist.`} } )
            })
        })
    })
})