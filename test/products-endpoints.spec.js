const knex = require('knex')
const app = require('../src/app')
const { makeProductsArray, makeMaliciousProduct, makeBrand, makeCategory, makeWash, makeDry, makeProductsArrayWithBrand } = require('./products.fixtures')
const supertest = require('supertest')
const { expect } = require('chai')

// /api/products
    // GET

describe('Products Endpoints', () => {
    let db

    function insertFixtures(
        products=makeProductsArray(),
        brands=[makeBrand()],
        categories=[makeCategory()],
        washInstructions=[makeWash()],
        dryInstructions=[makeDry()]
      ) {
        return Promise.all([
          db.into('brands').insert(brands),
          db.into('wash_instructions').insert(washInstructions),
          db.into('dry_instructions').insert(dryInstructions),
          db.into('categories').insert(categories)
        ]).then(
          () => db.into('products').insert(products)
        )
    }

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL,
        })
        app.set('db', db)
    })

    after('disconnect from db', () => db.destroy())

    const cleanUpTables = () => db.raw(
        `TRUNCATE table products, brands, categories, wash_instructions, dry_instructions RESTART IDENTITY CASCADE`
      );
  
    before('clean tables', cleanUpTables)
  
    afterEach('cleanup tables', cleanUpTables)

    describe('GET /api/products', () => {
        context('Given there are products in the database', () => {
            const testProductsWithBrand = makeProductsArrayWithBrand()

            beforeEach(insertFixtures)

            it('GET /api/products responds with 200 and all of the products'), () => {
                return supertest(app)
                    .get('/api/products')
                    .expect(200, testProductsWithBrand)
            }
        })

        context('Given no products', () => {
            it('responds with 200 and an empty list', () => {
                return supertest(app)
                    .get('/api/products')
                    .expect(200, [])
            })
        })

        context('Given an XSS attack product', () => {
            const { maliciousProduct, expectedProduct } = makeMaliciousProduct()
            const testBrands = makeBrand()

            beforeEach(() => insertFixtures([ maliciousProduct ]))

            it('removes XSS attack content', () => {
                return supertest(app)
                    .get('/api/products')
                    .expect(200)
                    .expect(res => {
                        expect(res.body[0].english_name).to.eql(expectedProduct.english_name)
                        expect(res.body[0].product_url).to.eql(expectedProduct.product_url)
                        expect(res.body[0].cmt_factory_notes).to.eql(expectedProduct.cmt_factory_notes)
                    })
            })
        })
    })

    describe('GET /api/products/:product_id', () => {
        context('Given there are products in the database', () => {
            const testProducts = makeProductsArray()
            const testBrands = makeBrand()

            beforeEach(insertFixtures)

            it('GET /api/products/:product_id responds with 200 and the specified product', () => {
                const productId = 2
                const testProductsWithBrand = makeProductsArrayWithBrand()
                const expectedProduct = testProductsWithBrand[productId - 1]
                return supertest(app)
                    .get(`/api/products/${productId}`)
                    .expect(200, expectedProduct)
            })
        })

        context(`Given an XSS attack product`, () => {
            const { maliciousProduct, expectedProduct } = makeMaliciousProduct()

            beforeEach(() => insertFixtures([ maliciousProduct ]));

            it(`Removes XSS attack content`, () => {
                console.log('maliciousProduct', maliciousProduct)
                return supertest(app)
                    .get(`/api/products/${maliciousProduct.id}`)
                    .expect(200)
                    .expect(res => {
                        expect(res.body.english_name).to.eql(expectedProduct.english_name)
                        expect(res.body.product_url).to.eql(expectedProduct.product_url)
                        expect(res.body.cmt_factory_notes).to.eql(expectedProduct.cmt_factory_notes)
                    })
            })
        })

        context('Given no products', () => {
            it(`responds with 404`, () => {
                const productId = 123456
                return supertest(app)
                    .get(`/api/products/${productId}`)
                    .expect(404, { error: { message: `Product does not exist` } })
            })
        })
    })

    describe('POST /api/products', () => {
        beforeEach(() => insertFixtures([]))
        it(`Creates a product, responding with 201 and the new product`, () => {
            // this.retries(3)
            const newProduct = {
                english_name: 'Yellow Shirt',
                brand_id: 1,
                category_id: 1,
                product_url: 'https://canopyandunderstory.com',
                feature_image_url: "http://test-url-feature-image.com",
                multiple_color_options: true,
                wash_id: 1,
                dry_id: 1,
                cost_in_home_currency: 60,
                cmt_country: 'US',
                cmt_factory_notes: '100 employees',
                approved_by_admin: true
            }
            
            return supertest(app)
                .post('/api/products')
                .send(newProduct)
                .then(res => {
                    expect(res.body.english_name).to.eql(newProduct.english_name)
                    expect(res.body.brand_id).to.eql(newProduct.brand_id)
                    expect(res.body.category_id).to.eql(newProduct.category_id)
                    expect(res.body.product_url).to.eql(newProduct.product_url)
                    expect(res.body.feature_image_url).to.eql(newProduct.feature_image_url)
                    expect(res.body.multiple_color_options).to.eql(newProduct.multiple_color_options)
                    expect(res.body.wash_id).to.eql(newProduct.wash_id)
                    expect(res.body.dry_id).to.eql(newProduct.dry_id)
                    expect(res.body.cost_in_home_currency).to.eql(newProduct.cost_in_home_currency)
                    expect(res.body.cmt_country).to.eql(newProduct.cmt_country)
                    expect(res.body.cmt_factory_notes).to.eql(newProduct.cmt_factory_notes)
                    expect(res.body.approved_by_admin).to.eql(newProduct.approved_by_admin)
                    expect(res.body).to.have.property('id')
                    expect(res.headers.location).to.have.eql(`/api/products/${res.body.id}`)
                    const expected = new Date().toLocaleString()
                    const actual = new Date(res.body.date_published).toLocaleString()
                    expect(actual).to.eql(expected)
                    console.log('res', res)
                   return res
                })
                .then(postRes => {
                    supertest(app)
                    .get(`/api/products/${postRes.body.id}`)
                    .expect(postRes.body)
                })
                
        })

        const requiredFields = [
            'english_name',
            'brand_id',
            'category_id',
            'product_url',
            'feature_image_url',
            'multiple_color_options',
            'cost_in_home_currency',
            'wash_id',
            'dry_id',
            'cmt_country',
            'cmt_factory_notes',
            'approved_by_admin'
        ]

        requiredFields.forEach(field => {
            const newProduct = {
                english_name: 'Yellow Shirt',
                brand_id: 1,
                category_id: 1,
                product_url: 'https://canopyandunderstory.com',
                feature_image_url: 'https://canopyandunderstory.com',
                multiple_color_options: false,
                home_currency: 'USD',
                cost_in_home_currency: 60,
                wash_id: 1,
                dry_id: 1,
                cmt_country: 'US',
                cmt_factory_notes: '100 employees',
                approved_by_admin: true
            }

            it(`responds with 400 and an error message when the '${field}' is missing`, () => {
                delete newProduct[field]

                return supertest(app)
                    .post('/api/products')
                    .send(newProduct)
                    .expect(400, {
                        error: { message: `Missing '${field}' in request body`}
                    })
            })
        })

        it(`Removes XSS attack content from response`, () => {
            const { maliciousProduct, expectedProduct } = makeMaliciousProduct()
            return supertest(app)
                .post('/api/products')
                .send(maliciousProduct)
                .expect(201)
                .expect(res => {
                    expect(res.body.english_name).to.eql(expectedProduct.english_name)
                    expect(res.body.product_url).to.eql(expectedProduct.product_url)
                    expect(res.body.cmt_factory_notes).to.eql(expectedProduct.cmt_factory_notes)
                })
        })
    })

    describe('PATCH /api/products/:product_id', () => {
        context('Given there are products in the database', () => {
            const testProducts=makeProductsArray()
           
            beforeEach(insertFixtures)

            it('responds with 204 and updates the product', () => {
                const idToUpdate = 1
                const updateProduct = {
                    english_name: 'Updated Product Name',
                    brand_id: 1,
                    category_id: 1,
                    product_url: 'https://canopyandunderstory.com',
                    feature_image_url: 'https://canopyandunderstory.com',
                    multiple_color_options: false,
                    home_currency: 'USD',
                    cost_in_home_currency: 60,
                    wash_id: 1,
                    dry_id: 1,
                    cmt_country: 'US',
                    cmt_factory_notes: 'Updated Notes',
                    approved_by_admin: true
                }
                const expectedProduct = {
                    ...testProducts[idToUpdate - 1],
                    ...updateProduct
                }

                return supertest(app)
                    .patch(`/api/products/${idToUpdate}`)
                    .send(updateProduct)
                    .expect(204)
                    .then(res => {
                        supertest(app)
                            .get(`/api/products/${idToUpdate}`)
                            .expect(expectedProduct)
                    })
            })

            it('responds with 400 when no required fields supplied', () => {
                const idToUpdate = 1
                return supertest(app)
                    .patch(`/api/products/${idToUpdate}`)
                    .send({ irrelevantField: 'foo' })
                    .expect(400, {
                        error: { message: `Request body must contain 'english_name', 'brand_id', 'category_id', 'product_url', 'feature_image_url', 'multiple_color_options', 'cost_in_home_currency', 'wash_id', 'dry_id', 'cmt_country', 'cmt_factory_notes', or 'approved_by_admin'`}
                    })
            })

            it(`responds with 204 when updating only a subset of fields`, () => {
                const idToUpdate = 1
                const updateProduct = {
                    english_name: 'Updated Product Name'
                }
                const expectedProduct = {
                    ...testProducts[idToUpdate - 1],
                    ...updateProduct
                }

                return supertest(app)
                    .patch(`/api/products/${idToUpdate}`)
                    .send({
                        ...updateProduct,
                        fieldToIgnore: 'should not be in the GET response'})
                .expect(204)
                .then(res => {
                    supertest(app)
                        .get(`/api/products/${idToUpdate}`)
                        .expect(expectedProduct)
                })
            })
        })
        
        context(`Given no products`, () => {
            it(`responds with 404`, () => {
                const productId = 123456
                return supertest(app)
                    .patch(`/api/products/${productId}`)
                    .expect(404, { error: { message: `Product does not exist`}})
            })
        })
    })

    describe('DELETE /api/products/:product_id', () => {
        context('Given there are products in the database', () => {
            const testProducts = makeProductsArray()

            beforeEach(insertFixtures)

            it('responds with 204 and removes the product', () => {
                const idToRemove = 1
                const expectedProducts = makeProductsArrayWithBrand().filter(product => product.id !== idToRemove)

                return supertest(app)
                    .delete(`/api/products/${idToRemove}`)
                    .expect(204)
                    .then(res => 
                        supertest(app)
                            .get('/api/products')
                            .expect(expectedProducts)
                    )
            })
        })

        context('Given no products', () => {
            it(`responds with 404`, () => {
                const productId = 234567
                return supertest(app)
                    .delete(`/api/products/${productId}`)
                    .expect(404, { error: { message: `Product does not exist` } })
            })
        })
    })
})