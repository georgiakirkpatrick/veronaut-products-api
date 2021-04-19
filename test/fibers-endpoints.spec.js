const knex = require('knex')
const app = require('../src/app')
const { 
    makeBrandsArray, makeFiberArrayPost
} = require('./fibers.fixtures')
const supertest = require('supertest')
const { expect } = require('chai')
const { makeFactoriesArray } = require('./factories.fixtures')

const brands = makeBrandsArray()
const factories = makeFactoriesArray
const fibers = makeFiberArrayPost()
const fiberType = makeFiberTypeArray()

describe('Fibers Endpoints', function() {
    let db

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DATABASE_URL,
        })
        app.set('db', db)
    })

    after('disconnect from db', () => db.destroy())

    before('clean the table', () => db.raw('TRUNCATE table fiber_or_material_type_id, brand_id, producer_id, fibers_and_materials RESTART IDENTITY CASCADE'))
    
    afterEach('cleanup', () => db.raw('TRUNCATE table fiber_or_material_type_id, brand_id, producer_id, fibers_and_materials RESTART IDENTITY CASCADE'))

    describe('GET /api/fibers', () => {
        context('when there are fibers in the database', () => {
            beforeEach(() => { return db.into('fiber_or_material_type_id').insert(fiberType) })
            beforeEach(() => { return db.into('brands').insert(brands) })
            beforeEach(() => { return db.into('factories').insert(factories) })
            beforeEach(() => { return db.into('fibers_and_materials').insert(fibers) })
            
            it('returns all the fabrics', () => {
                return supertest(app)
                    .get('/api/fibers')
                    .expect(200)
                    .expect(res => {
                        expect(res.body).to.eql(fibers)
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
            beforeEach(() => { return db.into('fabric_types').insert(fabricTypes) })
            beforeEach(() => { return db.into('brands').insert(brands) })
            beforeEach(() => { return db.into('fabrics').insert( maliciousFabric ) })

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

    describe('GET /api/fabrics/fabric-types', () => {
        context('when there are fabric types in the database', () => {
            beforeEach(() => { return db.into('fabric_types').insert(fabricTypes) })

            it('returns all the fabric types', () => {
                return supertest(app)
                    .get('/api/fabrics/fabric-types')
                    .expect(200, fabricTypes)
            })
        })

        context('when there are no fabric types in the database', () => {
            it('responds with 200 and an empty list', () => {
                return supertest(app)
                    .get('/api/fabrics/fabric-types')
                    .expect(200, [])
            })
        })

        context('given a malicious fabric types', () => {
            beforeEach(() => { return db.into('fabric_types').insert(maliciousFabricType) })

            it('removes the attack content', () => {

                return supertest(app)
                    .get('/api/fabrics/fabric-types')
                    .expect(200)
                    .expect(res => {
                        expect(res.body[0].english_name).to.eql(expectedFabricType.english_name)
                    })
            })
        })
    })

    describe('GET /api/fabrics/fiber-types', () => {
        context('when there are fiber types in the database', () => {
            beforeEach(() => { return db.into('fiber_and_material_types').insert(fiberTypes) })

            it('returns all the fiber types', () => {
                return supertest(app)
                    .get('/api/fabrics/fiber-types')
                    .expect(200, fiberTypes)
            })
        })

        context('when there are no fiber types in the database', () => {
            it('returns 200 and an empty list', () => {
                return supertest(app)
                    .get('/api/fabrics/fiber-types')
                    .expect(200, [])
            })
        })

        context('given a malicious fiber type', () => {
            beforeEach(() => { return db.into('fiber_and_material_types').insert(maliciousFiberType) })

            it('removes the attack content', () => {
                return supertest(app)
                    .get('/api/fabrics/fiber-types')
                    .expect(200)
                    .expect(res => {
                        expect(res.body[0].english_name).to.eql(expectedFiberType.english_name)
                    })
            })
        })
    })

    describe('GET /api/fabrics/notion-types', () => {
        context('when there are notion types in the database', () => {
            beforeEach(() => { return db.into('notion_types').insert(notionTypes) })

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
            beforeEach(() => { return db.into('notion_types').insert(maliciousNotionType) })

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
            beforeEach(() => { return db.into('fabric_types').insert(fabricTypes) })
            beforeEach(() => { return db.into('brands').insert(brands) })
            beforeEach(() => { return db.into('fabrics').insert(fabrics) })

            const fabricId = 1

            it('returns the fabric with id fabric_id', () => {
                return supertest(app)
                    .get(`/api/fabrics/${fabricId}`)
                    .expect(200, fabricsWithTypes[fabricId - 1])
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
            beforeEach(() => { return db.into('fabric_types').insert(fabricTypes) })
            beforeEach(() => { return db.into('brands').insert(brands) })
            beforeEach(() => { return db.into('fabrics').insert(maliciousFabric) })

            const fabricId = 666

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

    describe('GET /api/fabrics/:fabric_id/fibers', () => {
        context('when there are fibers in the database', () => {
            beforeEach(() => { return db.into('fabric_types').insert(fabricTypes) })
            beforeEach(() => { return db.into('fiber_and_material_types').insert(fiberTypes) })
            beforeEach(() => { return db.into('brands').insert(brands) })
            beforeEach(() => { return db.into('factories').insert(factories) })
            beforeEach(() => { return db.into('fabrics').insert(fabrics) })
            beforeEach(() => { return db.into('fibers_and_materials').insert(fibers) })
            beforeEach(() => { return db.into('fabrics_to_fibers_and_materials').insert(fabricsToFibers) })
            beforeEach(() => { return db.into('fibers_to_factories').insert(fibersToFactories) })
            
            const fabricId = 1

            it('returns all the fibers for the fabric with fabric_id', () => {
                return supertest(app)
                    .get(`/api/fabrics/${fabricId}/fibers`)
                    .expect(200)
                    .expect(res => {
                        expect(res.body[0].id).to.eql(fibers[0].id)
                        expect(res.body[0].brand_id).to.eql(fibers[0].brand_id),
                        expect(res.body[0].fiber_type_id).to.eql(fibers[0].fiber_or_material_type_id),
                        expect(res.body[0].fiber_type).to.eql(fiberTypes[0].english_name),
                        expect(res.body[0].class).to.eql(fiberTypes[0].fiber_type_class),
                        expect(res.body[0].producer_country).to.eql(fibers[0].producer_country),
                        expect(res.body[0].producer_id).to.eql(fibers[0].producer_id)
                        expect(res.body[0].factory).to.eql(factories[0].english_name)
                        expect(res.body[0].factory_country).to.eql(factories[0].country)
                        expect(res.body[0].factory_website).to.eql(factories[0].website)
                        expect(res.body[0].production_notes).to.eql(fibers[0].production_notes)
                        expect(res.body[0].approved_by_admin).to.eql(fibers[0].approved_by_admin)
                    })
            })
        })

        context('when there are no fibers in the database', () => {
            beforeEach(() => { return db.into('fabric_types').insert(fabricTypes) })
            beforeEach(() => { return db.into('brands').insert(brands) })
            beforeEach(() => { return db.into('factories').insert(factories) })
            beforeEach(() => { return db.into('fabrics').insert(fabrics) })

            const fabricId = 1

            it('returns 200 and an empty list', () => {
                return supertest(app)
                    .get(`/api/fabrics/${fabricId}/fibers`)
                    .expect(200, [])
            })
        })

        context('given a malicious fibers', () => {
            beforeEach(() => { return db.into('fabric_types').insert(fabricTypes) })
            beforeEach(() => { return db.into('fiber_and_material_types').insert(fiberTypes) })
            beforeEach(() => { return db.into('brands').insert(brands) })
            beforeEach(() => { return db.into('factories').insert(factories) }) 
            beforeEach(() => { return db.into('fabrics').insert(fabrics) })
            beforeEach(() => { return db.into('fibers_and_materials').insert(maliciousFiber) })
            beforeEach(() => { return db.into('fabrics_to_fibers_and_materials').insert(fabricsToMaliciousFibers) })
            beforeEach(() => { return db.into('fibers_to_factories').insert(maliciousFibersToFactories) })
            
            const fabricId = 1

            it('removes the attack content from the fiber(s) for the fabric with id fabric_id', () => {
                return supertest(app)
                    .get(`/api/fabrics/${fabricId}/fibers`)
                    .expect(200)
                    .expect(res => {
                        expect(res.body[0].fiber_type).to.eql(expectedFiber.production_notes)
                    })
            })
        })
    })

    describe('GET /api/fabrics/:fabric_id/certifications', () => {
        context('when there are certifications in the database', () => {
            beforeEach(() => { return db.into('certifications').insert(certifications) })
            beforeEach(() => { return db.into('fabric_types').insert(fabricTypes) })
            beforeEach(() => { return db.into('brands').insert(brands) })
            beforeEach(() => { return db.into('fabrics').insert(fabrics) })
            beforeEach(() => { return db.into('fabrics_to_certifications').insert(fabricsToCertifications) })

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
                    })
            })
        })

        context('when there are no certifications in the database', () => {
            beforeEach(() => { return db.into('fabric_types').insert(fabricTypes) })
            beforeEach(() => { return db.into('brands').insert(brands) })
            beforeEach(() => { return db.into('fabrics').insert(fabrics) })

            const fabricId = 1

            it('responds with 200 and an empty array', () => {

            return supertest(app)
                    .get(`/api/fabrics/${fabricId}/certifications`)
                    .expect(200, [])
            })        
        })

        context('given a malicious certifications', () => {
            beforeEach(() => { return db.into('certifications').insert(maliciousCertification) })
            beforeEach(() => { return db.into('fabric_types').insert(fabricTypes) })
            beforeEach(() => { return db.into('brands').insert(brands) })
            beforeEach(() => { return db.into('fabrics').insert(fabrics) })
            beforeEach(() => { return db.into('fabrics_to_certifications').insert(fabricsToMaliciousCertifications) })

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
            beforeEach(() => { return db.into('factories').insert(factories) })
            beforeEach(() => { return db.into('fabric_types').insert(fabricTypes) })
            beforeEach(() => { return db.into('brands').insert(brands) })
            beforeEach(() => { return db.into('fabrics').insert(fabrics) })
            beforeEach(() => { return db.into('fabrics_to_factories').insert(fabricsToFactories) })
            
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
            beforeEach(() => { return db.into('fabric_types').insert(fabricTypes) })
            beforeEach(() => { return db.into('brands').insert(brands) })
            beforeEach(() => { return db.into('fabrics').insert(fabrics) })

            const fabricId = 1

            it('responds with 200 and an empty array', () => {

                return supertest(app)
                        .get(`/api/fabrics/${fabricId}/factories`)
                        .expect(200, [])
            })
        })

        context('given a malicious factories', () => {
            beforeEach(() => { return db.into('fabric_types').insert(fabricTypes) })
            beforeEach(() => { return db.into('brands').insert(brands) })
            beforeEach(() => { return db.into('fabrics').insert(fabrics) })
            beforeEach(() => { return db.into('factories').insert(maliciousFactory) })
            beforeEach(() => { return db.into('fabrics_to_factories').insert(fabricsToMaliciousFactories) })

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

    describe('POST /api/fabrics', () => {
        beforeEach(() => { return db.into('fabric_types').insert(fabricTypes) })
        beforeEach(() => { return db.into('brands').insert(brands) })

        it('creates a fabric, responding with 201 and the new fabric', () => {
            const newFabric = {
                fabric_type_id: 1, 
                brand_id: 1, 
                fabric_mill_country: 'US', 
                fabric_mill_notes: 'over 200 employees', 
                dye_print_finish_country: 'US', 
                dye_print_finish_notes: '1000 employees',
                approved_by_admin: true
            }
    
            return supertest(app)
                .post('/api/fabrics')
                .send(newFabric)
                .expect(201)
                .expect(res => {
                    expect(res.body.fabric_type_id).to.eql(newFabric.fabric_type_id)
                    expect(res.body.brand_id).to.eql(newFabric.brand_id)
                    expect(res.body.fabric_mill_country).to.eql(newFabric.fabric_mill_country)
                    expect(res.body.fabric_mill_notes).to.eql(newFabric.fabric_mill_notes)
                    expect(res.body.dye_print_finish_country).to.eql(newFabric.dye_print_finish_country)
                    expect(res.body.approved_by_admin).to.eql(newFabric.approved_by_admin)
                    const expected = new Date().toLocaleString()
                    const actual = new Date(res.body.date_published).toLocaleString()
                    expect(actual).to.eql(expected)
                })
                .then(res => {
                    supertest(app)
                        .get(`/api/fabrics/${res.body.id}`)
                        .expect(res.body)
                })
        })

        const requiredFields = [
            'fabric_type_id',
            'brand_id', 
            'fabric_mill_country', 
            'fabric_mill_notes', 
            'dye_print_finish_country', 
            'dye_print_finish_notes',
            'approved_by_admin'
        ]
        
        requiredFields.forEach(field => {
            const newFabric = {
                fabric_type_id: 1, 
                brand_id: 1, 
                fabric_mill_country: 'US',
                fabric_mill_notes: 'over 200 employees',
                dye_print_finish_country: 'US',
                dye_print_finish_notes: '1000 employees',
                approved_by_admin: true
            }

            it(`responds with 400 and an error message when the '${field}' is missing`, () => {
                delete newFabric[field]

                return supertest(app)
                    .post('/api/fabrics')
                    .send(newFabric)
                    .expect(400, {
                        error: { message: `Missing '${field}' in request body`}
                    })
            })
        })

        it('removes XSS attack content from the response', () => {
            return supertest(app)
                .post('/api/fabrics')
                .send(maliciousFabric)
                .expect(201)
                .expect(res => {
                    expect(res.body.fabric_mill_notes).to.eql(expectedFabric.fabric_mill_notes)
                    expect(res.body.dye_print_finish_notes).to.eql(expectedFabric.dye_print_finish_notes)
                })
        })
    })

    describe('POST /api/fabrics/fabric-types', () => {
        it('creates a fabric-type, responding with 201 and the new fabric type', () => {
            const newFabricType = {
                english_name: 'poplin',
                fabric_type_class: 'woven',
                approved_by_admin: true
            }

            return supertest(app)
                .post('/api/fabrics/fabric-types')
                .send(newFabricType)
                .expect(201)
                .expect(res => {
                    expect(res.body.english_name).to.eql(newFabricType.english_name)
                    expect(res.body.fabric_type_class).to.eql(newFabricType.fabric_type_class)
                    expect(res.body.approved_by_admin).to.eql(newFabricType.approved_by_admin)
                    const expected = new Date().toLocaleString()
                    const actual = new Date(res.body.date_published).toLocaleString()
                    expect(actual).to.eql(expected)
                })
                .then(res => {
                    supertest(app)
                        .get(`/api/fabrics/fabric-types/${res.body.id}`)
                        .expect(res.body)
                })
        })

        const requiredFields = [
            'english_name',
            'fabric_type_class',
            'approved_by_admin'
        ]

        requiredFields.forEach(field => {
            const newFabricType = {
                english_name: 'poplin',
                fabric_type_class: 'woven',
                approved_by_admin: true
            }

            it(`responds with 400 and an error message when the '${field}' is missing`, () => {
                delete newFabricType[field]

                return supertest(app)
                    .post('/api/fabrics/fabric-types')
                    .send(newFabricType)
                    .expect(400, {
                        error: { message: `Missing '${field}' in request body`}
                    })
            })
        })

        it('removes XSS attack content from the response', () => {
            return supertest(app)
                .post('/api/fabrics/fabric-types')
                .send(maliciousFabricType)
                .expect(201)
                .expect(res => {
                    expect(res.body.english_name).to.eql(expectedFabricType.english_name)
                })
        })
    })

    describe('POST /api/fabrics/fiber-types', () => {
        it('creates a fiber-type, responding with 201 and the new fabric', () => {
            const newFiberType = {
                english_name: 'cotton',
                fiber_type_class: 'naturally occuring cellulosic fiber',
                approved_by_admin: true
            }

            return supertest(app)
                .post('/api/fabrics/fiber-types')
                .send(newFiberType)
                .expect(201)
                .expect(res => {
                    expect(res.body.english_name).to.eql(newFiberType.english_name)
                    expect(res.body.fiber_type_class).to.eql(newFiberType.fiber_type_class)
                    expect(res.body.approved_by_admin).to.eql(newFiberType.approved_by_admin)
                    const expected = new Date().toLocaleString()
                    const actual = new Date(res.body.date_published).toLocaleString()
                    expect(actual).to.eql(expected)
                })
                .then(res => {
                    supertest(app)
                        .get(`/api/fabrics/fiber-types/${res.body.id}`)
                        .expect(res.body)
                })
        })

        const requiredFields = [
            'english_name',
            'fiber_type_class',
            'approved_by_admin'
        ]

        requiredFields.forEach(field => {
            const newFiberType = {
                english_name: 'cotton',
                fiber_type_class: 'naturally occuring cellulosic fiber',
                approved_by_admin: true
            }

            delete newFiberType[field]

            it(`responds with 400 and an error message when the '${field}' is missing`, () => {
                return supertest(app)
                    .post('/api/fabrics/fiber-types')
                    .send(newFiberType)
                    .expect(400, {
                        error: { message: `Missing '${field}' in request body`}
                    })
            })
        })

        it('removes XSS attack content from the response', () => {
            return supertest(app)
                .post('/api/fabrics/fiber-types')
                .send(maliciousFiberType)
                .expect(201)
                .expect(res => {
                    expect(res.body.english_name).to.eql(expectedFiberType.english_name)
                })
        })
    })

    describe('POST /api/fabrics/notion-types', () => {
        const newNotionType = {
            english_name: 'button',
            approved_by_admin: true
        }

        it('creates a notion-type, responding with 201 and the new fabric', () => {
            return supertest(app)
                .post('/api/fabrics/notion-types')
                .send(newNotionType)
                .expect(201)
                .expect(res => {
                    expect(res.body.english_name).to.eql(newNotionType.english_name)
                    expect(res.body.approved_by_admin).to.eql(newNotionType.approved_by_admin)
                    const expected = new Date().toLocaleString()
                    const actual = new Date(res.body.date_published).toLocaleString()
                    expect(actual).to.eql(expected)
                })
                .then(res => {
                    supertest(app)
                        .get(`/api/fabrics/fiber-types/${res.body.id}`)
                        .expect(res.body)
                })
        })

        const requiredFields = [
            'english_name',
            'approved_by_admin'
        ]

        requiredFields.forEach(field => {
            const newNotionType = {
                english_name: 'button',
                approved_by_admin: true
            }

            delete newNotionType[field]

            it(`responds with 400 and an error message when the '${field}' is missing`, () => {
                return supertest(app)
                    .post('/api/fabrics/notion-types')
                    .send(newNotionType)
                    .expect(400, {
                        error: { message: `Missing '${field}' in request body`}
                    })
            })
        })

        it('removes XSS attack content from the response', () => {
            return supertest(app)
                .post('/api/fabrics/notion-types')
                .send(maliciousNotionType)
                .expect(201)
                .expect(res => {
                    expect(res.body.english_name).to.eql(expectedNotionType.english_name)
                })
        })
    })

    describe('POST /api/fabrics/:fabric_id/fibers', () => {
        beforeEach(() => { return db.into('fabric_types').insert(fabricTypes) })
        beforeEach(() => { return db.into('fiber_and_material_types').insert(fiberTypes) })
        beforeEach(() => { return db.into('brands').insert(brands) })
        beforeEach(() => { return db.into('factories').insert(factories) }) 
        beforeEach(() => { return db.into('fabrics').insert(fabrics) })
        beforeEach(() => { return db.into('fibers_and_materials').insert(fibers) })

        const fabricFiberPair =  {
            fabric_id: 1,
            fiber_or_material_id: 1
        }

        it('creates a fiber, responding with 201 and the new fabric', () => {
            const fabricId = 1

            return supertest(app)
                .post(`/api/fabrics/${fabricId}/fibers`)
                .send(fabricFiberPair)
                .expect(201, fabricFiberPair)
        })

        const requiredFields = [
            'fabric_id',
            'fiber_or_material_id'
        ]

        requiredFields.forEach(field => {
            it(`responds with 400 and an error message when the '${field}' is missing`, () => {
                const fabricFiberPair =  {
                    fabric_id: 1,
                    fiber_or_material_id: 1
                }
                
                delete fabricFiberPair[field]

                const fabricId = 1

                return supertest(app)
                    .post(`/api/fabrics/${fabricId}/fibers`)
                    .send(fabricFiberPair)
                    .expect(400, {
                        error: { message: `Missing '${field}' in request body`}
                    })
            })
        })
    })

    describe('POST /api/fabrics/:fabric_id/certifications', () => {
        beforeEach(() => { return db.into('fabric_types').insert(fabricTypes) })
        beforeEach(() => { return db.into('brands').insert(brands) })
        beforeEach(() => { return db.into('factories').insert(factories) }) 
        beforeEach(() => { return db.into('fabrics').insert(fabrics) })
        beforeEach(() => { return db.into('certifications').insert(certifications) })
        
        const fabricId = 1

        it('creates a certification, responding with 201 and the new fabric', () => {
            const newFabricCertificationPair = {
                fabric_id: 1,
                certification_id: 1
            }

            return supertest(app)
                .post(`/api/fabrics/${fabricId}/certifications`)
                .send(newFabricCertificationPair)
                .expect(201, newFabricCertificationPair)
        })

        const requiredFields = [
            'fabric_id',
            'certification_id'
        ]

        requiredFields.forEach(field => {
            it(`responds with 400 and an error message when the '${field}' is missing`, () => {
                const newFabricCertificationPair = {
                    fabric_id: 1,
                    certification_id: 1
                }

                delete newFabricCertificationPair[field]

                return supertest(app)
                    .post(`/api/fabrics/${fabricId}/certifications`)
                    .send(newFabricCertificationPair)
                    .expect(400, {
                        error: { message: `Missing '${field}' in request body`}
                    })
            })
        })
    })

    describe('POST /api/fabrics/:fabric_id/factories', () => {
        beforeEach(() => { return db.into('fabric_types').insert(fabricTypes) })
        beforeEach(() => { return db.into('brands').insert(brands) })
        beforeEach(() => { return db.into('factories').insert(factories) }) 
        beforeEach(() => { return db.into('fabrics').insert(fabrics) })

        const newFabricFactoryPair = {
            fabric_id: 1,
            factory_id: 1
        }

        const fabricId = 1

        it('creates a factory, responding with 201 and the new fabric', () => {
            return supertest(app)
                .post(`/api/fabrics/${fabricId}/factories`)
                .send(newFabricFactoryPair)
                .expect(201, newFabricFactoryPair)
        })

        const requiredFields = [
            'fabric_id',
            'factory_id'
        ]

        requiredFields.forEach(field => {
            const newFabricFactoryPair = {
                fabric_id: 1,
                factory_id: 1
            }

            delete newFabricFactoryPair[field]
            
            it(`responds with 400 and an error message when the '${field}' is missing`, () => {
                return supertest(app)
                    .post(`/api/fabrics/${fabricId}/factories`)
                    .send(newFabricFactoryPair)
                    .expect(400, {
                        error: { message: `Missing '${field}' in request body`}
                    })
            })
        })
    })

    describe('PATCH /api/fabrics/:fabric_id', () => {
        context('when the fabric with id fabric_id exists', () => {
            beforeEach(() => { return db.into('fabric_types').insert(fabricTypes) })
            beforeEach(() => { return db.into('brands').insert(brands) })
            beforeEach(() => { return db.into('fabrics').insert(fabrics) })

            it('updates the fabric and responds 204', () => {
                const idToUpdate = 1

                const updateFabric = {
                    fabric_type_id: 1,
                    brand_id: 1,
                    fabric_mill_country: 'PE',
                    fabric_mill_notes: 'This is a fabric mill in Peru',
                    dye_print_finish_country: 'US',
                    dye_print_finish_notes: 'This is a dye plant in Peru',
                    approved_by_admin: true
                }
    
                const expectedFabric = {
                    ...fabrics[idToUpdate - 1],
                    ...updateFabric
                }
    
                return supertest(app)
                    .patch(`/api/fabrics/${idToUpdate}`)
                    .send(updateFabric)
                    .expect(204)
                    .then(res => {
                        supertest(app)
                            .get(`/api/fabrics/${idToUpdate}`)
                            .expect(expectedFabric)
                    })
            })

            it('responds with 400 when no required fields are supplied', () => {
                    const idToUpdate = 1
                    return supertest(app)
                        .patch(`/api/fabrics/${idToUpdate}`)
                        .send({irrelevantField: 'bar'})
                        .expect(400, {
                            error: { message: `Request body must include 'fabric_type_id', 'brand_id', 'fabric_mill_country', 'fabric_mill_notes', 'dye_print_finish_country', 'dye_print_finish_notes', or 'approved_by_admin'`}
                        })
            })

            it('responds with 204 when updating only a subset of fields', () => {
                    const idToUpdate = 1
                    const updateFabric = {
                        fabric_mill_notes: 'New note.'
                    }
        
                    const expectedFabric = {
                        ...fabrics[idToUpdate - 1],
                        ...updateFabric
                    }
        
                    return supertest(app)
                        .patch(`/api/fabrics/${idToUpdate}`)
                        .send(updateFabric)
                        .expect(204)
                        .then(res => {
                            supertest(app)
                                .get(`/api/fabrics/${idToUpdate}`)
                                .expect(expectedFabric)
                        })
            })
        })

        context('when the fabric with id fabric_id does not exist', () => {
            const idToUpdate = 1
            const updateFabric = {
                fabric_type_id: 1,
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
                    .send(updateFabric)
                    .expect(404, {
                        error: { message: `Fabric does not exist.`} } )
            })
        })
    })


    describe('DELETE /api/fabrics/:fabric_id', () => {
        context('when the fabric with id fabric_id exists', () => {
            beforeEach(() => { return db.into('fabric_types').insert(fabricTypes) })
            beforeEach(() => { return db.into('brands').insert(brands) })
            beforeEach(() => { return db.into('fabrics').insert(fabrics) })

            it('removes the fabric and responds 204', () => {
                const idToRemove = 1
                const expectedFabrics = fabrics.filter(fabric => fabric.id !== idToRemove)

                return supertest(app)
                    .delete(`/api/fabrics/${idToRemove}`)
                    .expect(204)
                    .then(res => {
                        supertest(app)
                            .get('/api/fabrics')
                            .expect(res => {
                                expect(res.body.fabric_type_id).to.eql(expectedFabrics.fabric_type_id === undefined)
                                expect(res.body.fabric_mill_notes).to.eql(expectedFabrics.fabric_mill_notes === undefined)
                                expect(res.body.fabric_mill_country).to.eql(expectedFabrics.fabric_mill_country === undefined)
                                expect(res.body.dye_print_finish_notes).to.eql(expectedFabrics.dye_print_finish_notes === undefined)
                                expect(res.body.dye_print_finish_country).to.eql(expectedFabrics.dye_print_finish_country === undefined)
                            })
                    })    
            })
        })

        context('when the fabric with id fabric_id does not exist', () => {
            beforeEach(() => { return db.into('fabric_types').insert(fabricTypes) })
            beforeEach(() => { return db.into('brands').insert(brands) })
            beforeEach(() => { return db.into('fabrics').insert(fabrics) })

            it('responds with 404', () => {
                const idToRemove = 222

                return supertest(app)
                    .delete(`/api/fabrics/${idToRemove}`)
                    .expect(404, {
                        error: { message: `Fabric does not exist.`} } )
            })
        })
    })
})