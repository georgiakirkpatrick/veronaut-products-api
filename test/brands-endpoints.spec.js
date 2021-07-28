const knex = require('knex')
const app = require('../src/app')
const { expect } = require('chai')
const supertest = require('supertest')

const { makeBrandArray, makeMalBrand } = require('./brands.fixtures')
const { makeFactoryArray,makeMalFactory } = require('./factories.fixtures')
const { makeFiberTypeArray,makeFiberArray, makeMalFiber,makeMalFiberType } = require('./fibers.fixtures')
const { makeMalNotion, makeMalNotionType, makeNotionArray, makeNotionType } = require('./notions.fixtures')
 
describe('Brands Endpoints', () => {
    const brands = makeBrandArray()
    const factories = makeFactoryArray()
    const notionTypes = makeNotionType()
    const { fibersPost, fibersGet } = makeFiberArray()
    const fiberTypes = makeFiberTypeArray()
    const { malBrand, expectedBrand } = makeMalBrand()
    const { malFactory } = makeMalFactory()
    const { malFiber, expectedFiber } = makeMalFiber()
    const { malFiberType } = makeMalFiberType()
    const { malNotion, expectedNotion } = makeMalNotion()
    const { malNotionType, expectedNotionType } = makeMalNotionType()
    const { notionsPost, notionsGet } = makeNotionArray()
    
    let db
    
    const insertFixtures = () => (
        Promise.all([
            db.into('brands').insert(brands),
            db.into('fiber_and_material_types').insert(fiberTypes),
            db.into('factories').insert(factories)
        ])
        .then(
            () => db.into('fibers_and_materials').insert(fibersPost)
        )
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
        `TRUNCATE table fibers_and_materials, fiber_and_material_types, notions, notion_types, brands,
        factories RESTART IDENTITY CASCADE`
    ))

    afterEach('cleanup', () => db.raw(
        `TRUNCATE table fibers_and_materials, fiber_and_material_types, notions, notion_types, brands, 
        factories RESTART IDENTITY CASCADE`
    ))

    describe('GET /api/brands', () => {
        context('Given there are brands in the database', () => {
            beforeEach('insert brands', () => ( db.into('brands').insert(brands)))

            it('GET /api/brands responds with 200 and all of the brands', () => {
                return supertest(app)
                    .get('/api/brands')
                    .expect(200, brands)
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
            before(() => db.into('brands').insert(malBrand))
    
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
            const brandId = brands[0].id
            const expectedBrand = brands[0]

            beforeEach(() => db.into('brands').insert(brands))
    
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
            const brandId = 666
            before(() => db.into('brands').insert(malBrand))
    
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

            it('GET /api/brands/:brand_id/fibers responds with 200 and all of the fibers for the brand', () => {
                const brandId = 1

                return supertest(app)
                    .get(`/api/brands/${brandId}/fibers`)
                    .expect(200)
                    .expect(res => {
                        expect(res.body[0].fiber_or_material_type_id).to.eql(fibersGet[0].fiber_type_id)
                        expect(res.body[0].fiber_type).to.eql(fibersGet[0].fiber_type)
                        expect(res.body[0].fiber_type_class).to.eql(fibersGet[0].class)
                        expect(res.body[0].brand_id).to.eql(fibersGet[0].brand_id)
                        expect(res.body[0].producer_country).to.eql(fibersGet[0].producer_country)
                        expect(res.body[0].producer_id).to.eql(fibersGet[0].producer_id)
                        expect(res.body[0].production_notes).to.eql(fibersGet[0].production_notes)
                        expect(res.body[0].approved_by_admin).to.eql(fibersGet[0].approved_by_admin)
                    })
            })
        })

        context('Given there are no fibers for the brand with id brand_id', () => {
            beforeEach('insert brands', () => ( db.into('brands').insert(brands)))
    
            it('responds with 200 and an empty list', () => {
                const brandId = 1

                return supertest(app)
                    .get(`/api/brands/${brandId}/fibers`)
                    .expect(200, [])
            })
        })

        context('Given an XSS attack fiber', () => {
            beforeEach(() => db.into('brands').insert(malBrand))
            beforeEach(() => db.into('factories').insert(malFactory))
            beforeEach(() => db.into('fiber_and_material_types').insert(malFiberType))
            beforeEach(() => db.into('fibers_and_materials').insert(malFiber))
            
            const brandId = 666
    
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
            beforeEach(insertFixtures)
            beforeEach(() => db.into('notion_types').insert(notionTypes))
            beforeEach(() => db.into('notions').insert(notionsPost))

            it('GET /api/brands/:brand_id/notions responds with 200 and all of the notions for the brand', () => {
                const brandId = 1

                return supertest(app)
                    .get(`/api/brands/${brandId}/notions`)
                    .expect(200, [notionsGet])
            })
        })

        context('Given there are no notions for the brand with id brand_id', () => {
            beforeEach('insert brands', () => ( db.into('brands').insert(brands)))
            const brandId = 1

            it('responds with 200 and an empty array', () => {
                return supertest(app)
                    .get(`/api/brands/${brandId}/notions`)
                    .expect(200, [])
            })
        })

        context('Given a malicious notion', () => {
            const brandId = 666

            beforeEach(() => db.into('factories').insert(malFactory))
            beforeEach(() => db.into('brands').insert(malBrand))
            beforeEach(() => db.into('notion_types').insert(malNotionType))
            beforeEach(() => db.into('fiber_and_material_types').insert(malFiberType))
            beforeEach(() => db.into('notions').insert(malNotion))

            it('Returns 200 and and removes XSS attack content', () => {
                return supertest(app)
                    .get(`/api/brands/${brandId}/notions`)
                    .expect(200)
                    .then(res => {
                        expect(res => {
                            expect(res.body[0].notion_factory_notes).to.eql(expectedNotion.notion_factory_notes)
                            expect(res.body[0].material_notes).to.eql(expectedNotion.material_notes)
                        })
                    })
            })
        })
    })

    describe('POST /api/brands', () => {          
        it('Creates a brand, responding with 201 and the new brand', () => {
            const newBrand = brands[0]
            
            return (
            supertest(app)
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
                    return supertest(app)
                        .get(`/api/brands/${res.body.id}`)
                        .expect(res => {
                            expect(res.body.english_name).to.eql(newBrand.english_name)
                            expect(res.body.website).to.eql(newBrand.website)
                            expect(res.body.home_currency).to.eql(newBrand.home_currency)
                            expect(res.body.approved_by_admin).to.eql(newBrand.approved_by_admin)
                        })
                })
            )    

        })
            
        const requiredFields = [
            'english_name',
            'website',
            'home_currency',
            'size_system'
        ]

        requiredFields.forEach(field => {
            const newBrand = {
                english_name: 'Zara',
                website: 'www.zara.com',
                home_currency: 1,
                size_system: 1
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
            const { malBrand, expectedBrand } = makeMalBrand()

            return supertest(app)
                .post('/api/brands')
                .send(malBrand)
                .expect(201)
                .expect(res => {
                    expect(res.body.english_name).to.eql(expectedBrand.english_name)
                    expect(res.body.website).to.eql(expectedBrand.website)
                })
        })
    })

    describe('PATCH /api/brands/:brand_id', () => {
        context('Given there are brands in the database', () => {
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
                    .then(res => supertest(app)
                        .get(`/api/brands/${idToUpdate}`)
                        .expect(expectedBrand)
                    )
            })

            it('responds with 400 when no required fields are supplied', () => {
                const idToUpdate = 1
                return supertest(app)
                    .patch(`/api/brands/${idToUpdate}`)
                    .send({irrelevantField: 'bar'})
                    .expect(400, {
                        error: { message: `Request body must include 'english_name', 'website', 'home_currency', 'size_system', and/or 'approved_by_admin'`}
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
                        return supertest(app)
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