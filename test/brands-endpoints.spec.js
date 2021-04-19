const knex = require('knex')
const app = require('../src/app')
const { 
    makeBrandsArray, 
    makeFiberTypesArray, 
    makeFiberArrayGet, 
    makeFiberArrayPost, 
    makeFactoryArray, 
    makeMaliciousBrand, 
    makeMaliciousFiber, 
    makeMaliciousNotion, 
    makeNotionsArrayGet, 
    makeNotionsArrayPost, 
    makeNotionType 
} = require('./brands.fixtures')
const { expect } = require('chai')
const supertest = require('supertest')

describe.only('Brands Endpoints', function() {
    let db

    const brands = makeBrandsArray()
    const factories = makeFactoryArray()
    const notionTypes = makeNotionType()

    function insertFixtures (
        brands = makeBrandsArray(),
        fiberTypes=makeFiberTypesArray(),
        factories=makeFactoryArray(),
        fibers=makeFiberArrayPost()
      ) {
        return Promise.all([
            db.into('brands').insert(brands),
            db.into('fiber_and_material_types').insert(fiberTypes),
            db.into('factories').insert(factories)
        ])
        .then(
            () => db.into('fibers_and_materials').insert(fibers)
        )
    }

    function insertNotionFixtures (
        brands = makeBrandsArray(),
        factories = makeFactoryArray(),
        notionTypes = makeNotionType(),
        notions = makeNotionsArrayPost()
    ) {
        return Promise.all([
            db.into('brands').insert(brands),
            db.into('factories').insert(factories),
            db.into('notion_types').insert(notionTypes)
        ])
        .then(
            () => db.into('notions').insert(notions)
        )
    }

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DATABASE_URL,
        })
        app.set('db', db)
    })

    after('disconnect from db', () => db.destroy())

    before('clean the table', () => db.raw('TRUNCATE table fibers_and_materials, fiber_and_material_types, notions, notion_types, brands, factories RESTART IDENTITY CASCADE'))
    
    afterEach('cleanup', () => db.raw('TRUNCATE table fibers_and_materials, fiber_and_material_types, notions, notion_types, brands, factories RESTART IDENTITY CASCADE'))

    describe('GET /api/brands', () => {
        context('Given there are brands in the database', () => {
            const testBrands = makeBrandsArray()
            beforeEach('insert brands', () => {
                return db
                    .into('brands')
                    .insert(testBrands)
            })
    
            it('GET /api/brands responds with 200 and all of the brands', () => {
                return supertest(app)
                    .get('/api/brands')
                    .expect(200, testBrands)
            })
        })

        context('Given no brands', () => {
            it('responds with 200 and an empty list', () => {
                return supertest(app)
                    .get('/api/brands')
                    .expect(200, [])
            })
        })
    
        context('Given an XSS attack brand', () => {
            const { maliciousBrand, expectedBrand } = makeMaliciousBrand()
    
            before(() => db.into('brands').insert(maliciousBrand))
    
            it('removes XSS attack content', () => {
                return supertest(app)
                    .get('/api/brands')
                    .expect(200)
                    .expect(res => {
                        expect(res.body[0].english_name).to.eql(expectedBrand.english_name)
                        expect(res.body[0].website).to.eql(expectedBrand.website)
                    })
            })
        })
    })
    
    describe('GET /api/brands/:brand_id', () => {
        context('Given brand with id brand_id exists', () => {
            const brandId = 2
            const testBrands = makeBrandsArray()
            const expectedBrand = testBrands[brandId - 1]
    
            beforeEach('insert brands', () => {
                return db
                    .into('brands')
                    .insert(testBrands)
            })
    
            it('GET /api/brands responds with 200 and the specified brand', () => {
                return supertest(app)
                    .get(`/api/brands/${brandId}`)
                    .expect(200, expectedBrand)
            })
        })

        context('Given no brand with id brand_id exists', () => {
            const brandId = 4

            it('responds with 404', () => {
                return supertest(app)
                    .get(`/api/brands/${brandId}`)
                    .expect(404)
            })
        })

        context('Given an XSS attack brand', () => {
            const { maliciousBrand, expectedBrand } = makeMaliciousBrand()
            const brandId = 567
    
            before(() => db.into('brands').insert(maliciousBrand))
    
            it('removes XSS attack content', () => {
                return supertest(app)
                    .get(`/api/brands/${brandId}`)
                    .expect(200)
                    .expect(res => {
                        expect(res.body.english_name).to.eql(expectedBrand.english_name)
                        expect(res.body.website).to.eql(expectedBrand.website)
                    })
            })
        })
    })

    describe('GET /api/brands/:brand_id/fibers', () => {
        context('Given there are fibers for the brand with id brand_id', () => {
            beforeEach(insertFixtures)
            const fiberArrayGet = makeFiberArrayGet()

            it('GET /api/brands/:brand_id/fibers responds with 200 and all of the fibers for the brand', () => {
                const brandId = 1

                return supertest(app)
                    .get(`/api/brands/${brandId}/fibers`)
                    .expect(200)
                    .expect(res => {
                        expect(res.body[0].fiber_or_material_type_id).to.eql(fiberArrayGet[0].fiber_type_id)
                        expect(res.body[0].fiber_type).to.eql(fiberArrayGet[0].fiber_type)
                        expect(res.body[0].fiber_type_class).to.eql(fiberArrayGet[0].class)
                        expect(res.body[0].brand_id).to.eql(fiberArrayGet[0].brand_id)
                        expect(res.body[0].producer_country).to.eql(fiberArrayGet[0].producer_country)
                        expect(res.body[0].producer_id).to.eql(fiberArrayGet[0].producer_id)
                        expect(res.body[0].production_notes).to.eql(fiberArrayGet[0].production_notes)
                        expect(res.body[0].approved_by_admin).to.eql(fiberArrayGet[0].approved_by_admin)
                    })
            })
        })

        context('Given there are no fibers for the brand with id brand_id', () => {
            const testBrands = makeBrandsArray()

            beforeEach('insert brands', () => {
                return db
                    .into('brands')
                    .insert(testBrands)
            })
    
            it('responds with 200 and an empty list', () => {
                const brandId = 1

                return supertest(app)
                    .get(`/api/brands/${brandId}/fibers`)
                    .expect(200, [])
            })
        })

        context('Given an XSS attack fiber', () => {
            beforeEach(insertFixtures)
            const { maliciousFiber, expectedFiber } = makeMaliciousFiber()

            beforeEach(() => db.into('fibers_and_materials').insert(maliciousFiber))
            const brandId = 2
    
            it('removes XSS attack content', () => {
                return supertest(app)
                    .get(`/api/brands/${brandId}/fibers`)
                    .expect(200)
                    .expect(res => {
                        expect(res.body[0].production_notes).to.eql(expectedFiber.production_notes)
                    })
            })
        })
    })

    describe('GET /api/brands/:brand_id/notions', () => {
        context('Given there are notions for the brand with id brand_id', () => {
            beforeEach(insertNotionFixtures)

            const notionsArrayGet = makeNotionsArrayGet()

            it('GET /api/brands/:brand_id/notions responds with 200 and all of the notions for the brand', () => {
                const brandId = 1

                return supertest(app)
                    .get(`/api/brands/${brandId}/notions`)
                    .expect(200, notionsArrayGet)
            })
        })

        context('Given there are no notions for the brand with id brand_id', () => {
            const testBrands = makeBrandsArray()
            
            beforeEach('insert brands', () => {
                return db
                    .into('brands')
                    .insert(testBrands)
            })

            const brandId = 1

            it('responds with 200 and an empty array', () => {
                return supertest(app)
                    .get(`/api/brands/${brandId}/notions`)
                    .expect(200, [])
            })
        })

        context('Given a malicious notion', () => {
            const { maliciousNotion, expectedNotion } = makeMaliciousNotion()
            const brandId = 1

            beforeEach(() => db.into('factories').insert(factories))
            beforeEach(() => db.into('brands').insert(brands))
            beforeEach(() => db.into('notion_types').insert(notionTypes))
            beforeEach(() => db.into('notions').insert(maliciousNotion))

            it('Returns 200 and and removes XSS attack content', () => {
                return supertest(app)
                    .get(`/api/brands/${brandId}/notions`)
                    .expect(200)
                    .then(res => {
                        expect(res.body[0].notion_factory_notes).to.eql(expectedNotion.notion_factory_notes)
                    })
            })
        })
    })

    describe('POST /api/brands', () => {
        it('Creates a brand, responding with 201 and the new brand', () => {
            const newBrand = {
                english_name: 'Zara',
                website: 'www.zara.com',
                home_currency: 'USD',
                size_system: 'US',
                approved_by_admin: true
            }

            return supertest(app)
                .post('/api/brands')
                .send(newBrand)
                .expect(201)
                .expect(res => {
                    expect(res.body.english_name).to.eql(newBrand.english_name)
                    expect(res.body.website).to.eql(newBrand.website)
                    expect(res.body.home_currency).to.eql(newBrand.home_currency)
                    expect(res.body.approved_by_admin).to.eql(newBrand.approved_by_admin)
                    expect(res.body).to.have.property('id')
                    expect(res.headers.location).to.eql(`/api/brands/${res.body.id}`)
                    const expected = new Date().toLocaleString()
                    const actual = new Date(res.body.date_published).toLocaleString()
                    expect(actual).to.eql(expected)
                })
                .then(res => {
                    supertest(app)
                        .get(`/api/brands/${res.body.id}`)
                        .expect(res.body)
                })
        })
            
        const requiredFields = [
            'english_name',
            'website',
            'home_currency',
            'size_system',
            'approved_by_admin'
        ]

        requiredFields.forEach(field => {
            const newBrand = {
                english_name: 'Zara',
                website: 'www.zara.com',
                home_currency: 'USD',
                size_system: 'US',
                approved_by_admin: true
            }

            it(`responds with 400 and an error message when the '${field}' is missing`, () => {
                delete newBrand[field]

                return supertest(app)
                    .post('/api/brands')
                    .send(newBrand)
                    .expect(400, {
                        error: { message: `Missing '${field}' in request body`}
                    })
            })
        })

        it(`Removes XSS attack content from response`, () => {
            const { maliciousBrand, expectedBrand } = makeMaliciousBrand()

            return supertest(app)
                .post('/api/brands')
                .send(maliciousBrand)
                .expect(201)
                .expect(res => {
                    expect(res.body.english_name).to.eql(expectedBrand.english_name)
                    expect(res.body.website).to.eql(expectedBrand.website)
                })
        })
    })

    describe('POST /api/brands/:brand_id/fibers', () => {
        beforeEach(() => db.into('fiber_and_material_types').insert(makeFiberTypesArray()))
        beforeEach(() => db.into('brands').insert(makeBrandsArray()))
        beforeEach(() => db.into('factories').insert(makeFactoryArray()))

        it(`creates a fiber, responding with 201 and the new fiber`, () => {
            const newFiber = {
                fiber_or_material_type_id: 1,
                brand_id: 2,
                producer_country: 1,
                producer_id: 1,
                production_notes: 'This is a note about fiber',
                approved_by_admin: true
            }

            const brandId = 2

            return supertest(app)
                .post(`/api/brands/${brandId}/fibers`)
                .send(newFiber)
                .expect(201)
                .expect(res => {
                    expect(res.body.fiber_or_material_type_id).to.eql(newFiber.fiber_or_material_type_id)
                    expect(res.body.brand_id).to.eql(newFiber.brand_id)
                    expect(res.body.producer_country).to.eql(newFiber.producer_country)
                    expect(res.body.producer_id).to.eql(newFiber.producer_id)
                    expect(res.body.production_notes).to.eql(newFiber.production_notes)
                    expect(res.body.approved_by_admin).to.eql(newFiber.approved_by_admin)
                    expect(res.body).to.have.property('id')
                    expect(res.headers.location).to.eql(`/api/brands/${brandId}/fibers/${res.body.id}`)
                    const expected = new Date().toLocaleString()
                    const actual = new Date(res.body.date_published).toLocaleString()
                    expect(actual).to.eql(expected)
                })
                .then(res => {
                    supertest(app)
                        .get(`/api/brands/${brandId}/fibers/${res.body.id}`)
                        .expect(res.body)
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
                fiber_or_material_type_id: 2,
                brand_id: 1,
                producer_country: 1,
                producer_id: 1,
            }

            it(`responds with 400 and an error message when the '${field}' is missing`, () => {
                delete newFiber[field]

                return supertest(app)
                    .post('/api/brands/1/fibers')
                    .send(newFiber)
                    .expect(400, {
                        error: { message: `Missing '${field}' in request body`}
                    })
            })
        })

        it(`Removes XSS attack content from response`, () => {
            const { maliciousFiber, expectedFiber } = makeMaliciousFiber()
            const brandId = 1

            return supertest(app)
                .post(`/api/brands/${brandId}/fibers`)
                .send(maliciousFiber)
                .expect(201)
                .expect(res => {
                    expect(res.body.production_notes).to.eql(expectedFiber.production_notes)                })
        })
    })

    describe('POST /api/brands/:brand_id/notions', () => {
        beforeEach(() => db.into('brands').insert(makeBrandsArray()))
        beforeEach(() => db.into('factories').insert(makeFactoryArray()))
        beforeEach(() => db.into('notion_types').insert(makeNotionType()))

        it('Creates a new notion, returning 201 and the new notion', () => {
            const newNotion = {
                notion_type_id: 1,
                brand_id: 2,
                manufacturer_country: 1,
                manufacturer_id: 1,
                manufacturer_notes: 'These are the notes.',
                material_type_id: 1,
                material_origin_id: 1,
                material_notes: 'These are the notes.'
            }

            const brandId = 2

            return supertest(app)
                .post(`/api/brands/${brandId}/notions`)
                .send(newNotion)
                .expect(201)
                .expect(res => {
                    expect(res.body.notion_type_id).to.eql(newNotion.notion_type_id)
                    expect(res.body.brand_id).to.eql(newNotion.brand_id)
                    expect(res.body.manufacturer_country).to.eql(newNotion.notion_factory_country)
                    expect(res.body.manufacturer_id).to.eql(newNotion.notion_factory_country)
                    expect(res.body.manufacturer_notes).to.eql(newNotion.notion_factory_country)
                    expect(res.body.material_type_id).to.eql(newNotion.notion_factory_country)
                    expect(res.body.material_origin_id).to.eql(newNotion.notion_factory_country)
                    expect(res.body.material_notes).to.eql(newNotion.notion_factory_country)
                    expect(res.body.approved_by_admin).to.eql(false)
                    expect(res.body).to.have.property('id')
                    expect(res.headers.location).to.eql(`/api/brands/${brandId}/notions/${res.body.id}`)
                    const expected = new Date().toLocaleString()
                    const actual = new Date(res.body.date_published).toLocaleString()
                    expect(actual).to.eql(expected)
                })
                .then(postRes => {
                    ('postRes', postRes)
                    supertest(app)
                        .get(`/api/brands/${brandId}/notions/${postRes.body.id}`)
                        .expect(postRes.body)
                })
        })

        const requiredValues = [
            'notion_type_id',
            'brand_id',
            'notion_factory_country',
            'notion_factory_id',
            'notion_factory_notes'
        ]

        requiredValues.forEach(value => {
            const newNotion = {
                notion_type_id: 1,
                brand_id: 2,
                notion_factory_country: 'US',
                notion_factory_id: 1,
                notion_factory_notes: 1
            }

        const brandId = 2

            it(`Responds with 400 and an error message when the '${value}' is missing`, () => {
                delete newNotion[value]
                    return supertest(app)
                        .post(`/api/brands/${brandId}/notions`)
                        .send(newNotion)
                        .expect(400, {
                            error: { message: `Missing '${value}' in request body`}
                        })
            })
        })    

        it(`Removes XSS attack content from response`, () => {
            const { maliciousNotion, expectedNotion } = makeMaliciousNotion()
            const brandId = 1

            return supertest(app)
                .post(`/api/brands/${brandId}/notions`)
                .send(maliciousNotion)
                .expect(201)
                .expect(res => {
                    expect(res.body.notion_factory_notes).to.eql(expectedNotion.notion_factory_notes)                })
                 
        })
    })

    describe('PATCH /api/brands/:brand_id', () => {
        context('Given there are brands in the database', () => {
            const brands = makeBrandsArray()

            beforeEach(() => db.into('brands').insert(brands))

            it('responds with 204 and updates the brand', () => {
                const idToUpdate = 2

                const updateBrand = {
                    english_name: 'Updated Brand Name',
                    website: 'www.updatedbrand.com',
                    home_currency: 2,
                    size_system: 2,
                    approved_by_admin: false
                }

                const expectedBrand = {
                    ...brands[idToUpdate - 1],
                    ...updateBrand
                }

                return supertest(app)
                    .patch(`/api/brands/${idToUpdate}`)
                    .send(updateBrand)
                    .expect(204)
                    .then(res => {
                        supertest(app)
                            .get(`/api/brands/${idToUpdate}`)
                            .expect(expectedBrand)
                    })
            })

            it('responds with 400 when no required fields are supplied', () => {
                const idToUpdate = 1
                return supertest(app)
                    .patch(`/api/brands/${idToUpdate}`)
                    .send({irrelevantField: 'bar'})
                    .expect(400, {
                        error: { message: `Request body must include 'english_name', 'website', 'home_currency', 'size_system',  and/or 'approved_by_admin'`}
                    })
            })

            it(`responds with 204 when updating only a subset of fields`, () => {
                const idToUpdate = 1
                const updateBrand = {
                    website: 'www.newbrandwebsite.com'
                }
                const expectedBrand = {
                    ...brands[idToUpdate - 1],
                    ...updateBrand
                }

                return supertest(app)
                    .patch(`/api/brands/${idToUpdate}`)
                    .send({
                        ...updateBrand,
                        fieldToIgnore: 'should not be in the GET response'})
                .expect(204)
                .then(res => {
                    supertest(app)
                        .get(`/api/brands/${idToUpdate}`)
                        .expect(expectedBrand)
                })
            })
        })

        context('Given nonexistant brand id', () => {
            it('responds with 404', () => {
                const brandId = 654
                return supertest(app)
                    .patch(`/api/brands/${brandId}`)
                    .expect(404, { error: { message: `Brand does not exist.` } })
            })
        })
    })
    
    describe('DELETE /api/brands/:brand_id', () => {
        context('Given there are products in the database', () => {
            const brands = makeBrandsArray()

            beforeEach(() => db.into('brands').insert(brands))

            it('responds with 204 and removes the brand', () => {
                const idToRemove = 1
                const expectedBrands = brands.filter(brand => brand.id !== idToRemove)

                return supertest(app)
                    .delete(`/api/brands/${idToRemove}`)
                    .expect(204)
                    .then(res => 
                        supertest(app)
                            .get('/api/brands')
                            .expect(expectedBrands)
                    )
            })
        })

        context('Given no brands', () => {
            it('responds with 404', () => {
                const brandId = 432
                return supertest(app)
                    .delete(`/api/brands/${brandId}`)
                    .expect(404, { error: { message: 'Brand does not exist.' } })
            })
        })
    })
})