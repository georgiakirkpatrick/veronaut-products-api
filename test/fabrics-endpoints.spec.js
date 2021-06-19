const knex = require('knex')
const app = require('../src/app')
const supertest = require('supertest')
const { expect } = require('chai')
const { makeBrandArray, makeMalBrand } = require('./brands.fixtures')
const { makeCertificationArray, makeMalCertification } = require('./certifications.fixtures')
const { 
    makeFabricArray, makeFabricsToCertifications, makeFabricsToFactories, makeFabricsToFibers,
    makeFabricsTomalFibers, makeFabricsTomalCertifications, makeFabricsTomalFactories, makeFabricTypeArray,
    makeFibersToFactories, makeNotionTypesArray, makeMalFabricType, makeMalNotionType, makeMalFabric, makeMalFibersToFactories
} = require('./fabrics.fixtures')
const { makeFactoryArray, makeMalFactory } = require('./factories.fixtures')
const { makeFiberArray, makeFiberTypeArray, makeMalFiber, makeMalFiberType } = require('./fibers.fixtures')

describe('Fabrics Endpoints', function() {
    const fabricTypes = makeFabricTypeArray()
    const fiberTypes = makeFiberTypeArray()
    const notionTypes = makeNotionTypesArray()
    const brands = makeBrandArray()
    const fabrics = makeFabricArray()
    const { fibersPost, fibersGet} = makeFiberArray()
    const factories = makeFactoryArray()
    const certifications = makeCertificationArray()
    const fabricsToFibers = makeFabricsToFibers()
    const fibersToFactories = makeFibersToFactories()
    const fabricsToFactories = makeFabricsToFactories()
    const { malBrand } = makeMalBrand()
    const { malFabric, expectedFabric } = makeMalFabric()
    const { malFiber, expectedFiber } = makeMalFiber()
    const { malFabricType, expectedFabricType } = makeMalFabricType()
    const { malFiberType } = makeMalFiberType()
    const { malNotionType, expectedNotionType } = makeMalNotionType()
    const { malFactory, expectedFactory } = makeMalFactory()
    const { malCertification, expectedCertification } = makeMalCertification()
    const malFibersToFactories = makeMalFibersToFactories()
    const fabricsTomalFibers = makeFabricsTomalFibers()
    const fabricsToCertifications = makeFabricsToCertifications()
    const fabricsTomalCertifications = makeFabricsTomalCertifications()
    const fabricsTomalFactories = makeFabricsTomalFactories()

    let db

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DATABASE_URL,
        })
        app.set('db', db)
    })

    after('disconnect from db', () => db.destroy())
    before('clean the table', () => db.raw('TRUNCATE table fabric_types, brands, fabrics, factories, fiber_and_material_types, fibers_to_factories, fabrics_to_fibers_and_materials, notion_types, certifications, fabrics_to_certifications RESTART IDENTITY CASCADE'))
    afterEach('cleanup', () => db.raw('TRUNCATE table fabric_types, brands, fabrics, factories, fiber_and_material_types, fibers_to_factories, fabrics_to_fibers_and_materials, notion_types, certifications, fabrics_to_certifications RESTART IDENTITY CASCADE'))

    describe('GET /api/fabrics', () => {
        context('when there are fabrics in the database', () => {
            beforeEach(() =>  db.into('fabric_types').insert(fabricTypes))
            beforeEach(() =>  db.into('brands').insert(brands))
            beforeEach(() =>  db.into('fabrics').insert(fabrics))
            
            it('returns all the fabrics', () => {
                return supertest(app)
                    .get('/api/fabrics')
                    .expect(200)
                    .expect(res => {
                        expect(res.body.fabric_type_id).to.eql(fabrics.fabric_type_id)
                        expect(res.body.brand_id).to.eql(fabrics.brand_id)
                        expect(res.body.fabric_type).to.eql(fabricTypes.english_name)
                        expect(res.body.fabric_mill_id).to.eql(fabrics.fabric_mill_id)
                        expect(res.body.fabric_mill_country).to.eql(fabrics.fabric_mill_country)
                        expect(res.body.fabric_mill_notes).to.eql(fabrics.fabric_mill_notes)
                        expect(res.body.dye_print_finish_id).to.eql(fabrics.dye_print_finish_id)
                        expect(res.body.dye_print_finish_country).to.eql(fabrics.dye_print_finish_country)
                        expect(res.body.dye_print_finish_notes).to.eql(fabrics.dye_print_finish_notes)
                        expect(res.body.approved_by_admin).to.eql(fabrics.approved_by_admin)
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

    describe('GET /api/fabrics/fabric-types', () => {
        context('when there are fabric types in the database', () => {
            beforeEach(() =>  db.into('fabric_types').insert(fabricTypes))

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

        context('given a malicious fabric type', () => {
            beforeEach(() =>  db.into('fabric_types').insert(malFabricType))

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
            // beforeEach(() =>  db.into('fabric_types').insert(fabricTypes))
            beforeEach(() =>  db.into('brands').insert(brands))
            beforeEach(() =>  db.into('fabrics').insert(fabrics))

            const fabricId = 1

            it('returns the fabric with id fabric_id', () => {
                return supertest(app)
                    .get(`/api/fabrics/${fabricId}`)
                    .expect(200, fabrics[fabricId - 1])
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
            beforeEach(() =>  db.into('fabric_types').insert(fabricTypes))
            beforeEach(() =>  db.into('fiber_and_material_types').insert(fiberTypes))
            beforeEach(() =>  db.into('brands').insert(brands))
            beforeEach(() =>  db.into('factories').insert(factories))
            beforeEach(() =>  db.into('fabrics').insert(fabrics))
            beforeEach(() =>  db.into('fibers_and_materials').insert(fibersPost))
            beforeEach(() =>  db.into('fabrics_to_fibers_and_materials').insert(fabricsToFibers))
            beforeEach(() =>  db.into('fibers_to_factories').insert(fibersToFactories))
            
            const fabricId = 1

            it('returns all the fibers for the fabric with fabric_id', () => {
                return supertest(app)
                    .get(`/api/fabrics/${fabricId}/fibers`)
                    .expect(200)
                    .expect(res => {
                        expect(res.body[0].id).to.eql(fibersGet[0].id)
                        expect(res.body[0].brand_id).to.eql(fibersGet[0].brand_id),
                        expect(res.body[0].fiber_type_id).to.eql(fibersGet[0].fiber_type_id)
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
            beforeEach(() =>  db.into('fabrics').insert(fabrics))

            const fabricId = 1

            it('returns 200 and an empty list', () => {
                return supertest(app)
                    .get(`/api/fabrics/${fabricId}/fibers`)
                    .expect(200, [])
            })
        })

        context('given a malicious fiber', () => {
            // beforeEach(() =>  db.into('fabric_types').insert(fabricTypes))
            beforeEach(() =>  db.into('brands').insert(brands))
            beforeEach(() =>  db.into('brands').insert(malBrand))
            beforeEach(() =>  db.into('factories').insert(malFactory)) 
            beforeEach(() =>  db.into('fabrics').insert(fabrics))
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

    describe('GET /api/fabrics/:fabric_id/certifications', () => {
        context('when there are certifications in the database', () => {
            beforeEach(() =>  db.into('certifications').insert(certifications))
            beforeEach(() =>  db.into('fabric_types').insert(fabricTypes))
            beforeEach(() =>  db.into('brands').insert(brands))
            beforeEach(() =>  db.into('fabrics').insert(fabrics))
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
                    })
            })
        })

        context('when there are no certifications in the database', () => {
            beforeEach(() =>  db.into('fabric_types').insert(fabricTypes))
            beforeEach(() =>  db.into('brands').insert(brands))
            beforeEach(() =>  db.into('fabrics').insert(fabrics))

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
            beforeEach(() =>  db.into('fabrics').insert(fabrics))
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
            beforeEach(() =>  db.into('fabrics').insert(fabrics))
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
            beforeEach(() =>  db.into('fabrics').insert(fabrics))

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
            beforeEach(() =>  db.into('fabrics').insert(fabrics))
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

    describe('POST /api/fabrics', () => {
        beforeEach(() =>  db.into('fabric_types').insert(fabricTypes))
        beforeEach(() =>  db.into('brands').insert(brands))

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
                .then(res => {
                    supertest(app)
                        .get(`/api/fabrics/${res.body.id}`)
                        .expect(res.body)
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
                fabric_type_id: 1, 
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
                    .send(newFabric)
                    .expect(400, {
                        error: { message: `Missing '${field}' in request body`}
                    })
            })
        })

        it('removes XSS attack content from the response', () => {
            return supertest(app)
                .post('/api/fabrics')
                .send(malFabric)
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
            'fabric_type_class'
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
                .send(malFabricType)
                .expect(201)
                .expect(res => {
                    expect(res.body.english_name).to.eql(expectedFabricType.english_name)
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
                    .send(newNotionType)
                    .expect(400, {
                        error: { message: `Missing '${field}' in request body`}
                    })
            })
        })

        it('removes XSS attack content from the response', () => {
            return supertest(app)
                .post('/api/fabrics/notion-types')
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
        beforeEach(() =>  db.into('fabrics').insert(fabrics))
        beforeEach(() =>  db.into('fibers_and_materials').insert(fibersPost))

        const fabricFiberPair =  {
            fabric_id: 1,
            fiber_or_material_id: 1,
            percent_of_fabric: 100
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
        beforeEach(() =>  db.into('fabric_types').insert(fabricTypes))
        beforeEach(() =>  db.into('brands').insert(brands))
        beforeEach(() =>  db.into('factories').insert(factories)) 
        beforeEach(() =>  db.into('fabrics').insert(fabrics))
        beforeEach(() =>  db.into('certifications').insert(certifications))
        
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
        beforeEach(() =>  db.into('fabric_types').insert(fabricTypes))
        beforeEach(() =>  db.into('brands').insert(brands))
        beforeEach(() =>  db.into('factories').insert(factories)) 
        beforeEach(() =>  db.into('fabrics').insert(fabrics))

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
            beforeEach(() =>  db.into('fabric_types').insert(fabricTypes))
            beforeEach(() =>  db.into('brands').insert(brands))
            beforeEach(() =>  db.into('fabrics').insert(fabrics))

            it('updates the fabric and responds 204', () => {
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
                            error: { message: `Request body must include 'brand_id', 'fabric_mill_country', 'fabric_mill_id', 'fabric_mill_notes', 'dye_print_finish_country', 'dye_print_finish_id', 'dye_print_finish_notes', or 'approved_by_admin'`}
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
            beforeEach(() =>  db.into('fabric_types').insert(fabricTypes))
            beforeEach(() =>  db.into('brands').insert(brands))
            beforeEach(() =>  db.into('fabrics').insert(fabrics))

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
            beforeEach(() =>  db.into('fabric_types').insert(fabricTypes))
            beforeEach(() =>  db.into('brands').insert(brands))
            beforeEach(() =>  db.into('fabrics').insert(fabrics))

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