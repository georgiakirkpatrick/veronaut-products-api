const knex = require('knex')
const app = require('../src/app')
const { makeProductsArray, makeMaliciousProduct } = require('./products.fixtures')
const supertest = require('supertest')
const { expect } = require('chai')

describe('Products Endpoints', () => {
    let db

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL,
        })
        app.set('db', db)
    })

    after('disconnect from db', () => db.destroy())

    before('clean the table', () => db('products').truncate())

    afterEach('cleanup', () => db('products').truncate())

    describe('GET /products', () => {
        context('Given there are products in the database', () => {
            const testProducts = makeProductsArray()

            beforeEach('insert products', () => {
                return db
                    .into('products')
                    .insert(testProducts)
            })

            it('GET /products responds with 200 and all of the products'), () => {
                return supertest(app)
                    .get('/products')
                    .expect(200, testProducts)
            }
        })

        context('Given no products', () => {
            it('responds with 200 and an empty list', () => {
                return supertest(app)
                    .get('/products')
                    .expect(200, [])
            })
        })

        context('Given an XSS attack product', () => {
            const { maliciousProduct, expectedProduct } = makeMaliciousProduct()

            beforeEach('insert malicious products', () => {
                return db
                    .into('products')
                    .insert([ maliciousProduct ])
            })

            it('removes XSS attack content', () => {
                return supertest(app)
                    .get('/products')
                    .expect(200)
                    .expect(res => {
                        expect(res.body[0].english_name).to.eql(expectedProduct.english_name)
                        expect(res.body[0].product_url).to.eql(expectedProduct.product_url)
                        expect(res.body[0].cmt_factory_notes).to.eql(expectedProduct.cmt_factory_notes)
                    })
            })
        })
    })

    describe('GET /products/:product_id', () => {
        context('Given there are products in the database', () => {
            const testProducts = makeProductsArray()

            beforeEach('insert products', () => {
                return db
                    .into('products')
                    .insert(testProducts)
            })

            it('GET /products/:product_id responds with 200 and the specified product', () => {
                const productId = 2
                const expectedProduct = testProducts[productId - 1]
                return supertest(app)
                    .get(`/products/${productId}`)
                    .expect(200, expectedProduct)
            })
        })

        context(`Given an XSS attack product`, () => {
            const { maliciousProduct, expectedProduct } = makeMaliciousProduct()

            beforeEach('Insert malicious product', () => {
                return db
                    .into('products')
                    .insert([ maliciousProduct ])
            })

            it(`Removes XSS attack content`, () => {
                return supertest(app)
                    .get(`/products/${maliciousProduct.id}`)
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
                const categoryId = 123456
                return supertest(app)
                    .get(`products/${productId}`)
                    .expect(404, { error: { message: `Product doesn't exist` } })
            })
        })
    })

    describe('POST /products', () => {
        it(`Creates a product, responding with 201 and the new product`, () => {
            this.retries(3)
            const newProduct = {
                english_name: 'Yellow Shirt',
                brand_id: 1,
                category_id: 10,
                product_url: 'https://canopyandunderstory.com',
                home_currency: 'USD',
                cost_in_home_currency: 60,
                cmt_country: 'US',
                cmt_factory_notes: '100 employees',
                approved_by_admin: true
            }
            
            return supertest(app)
                .post('products')
                .send(newProduct)
                .expect(res => {
                    expext(res.body.english_name).to.eql(newProduct.english_name)
                    expext(res.body.brand_id).to.eql(newProduct.brand_id)
                    expext(res.body.category_id).to.eql(newProduct.category_id)
                    expext(res.body.product_url).to.eql(newProduct.product_url)
                    expext(res.body.home_currency).to.eql(newProduct.home_currency)
                    expext(res.body.cost_in_home_currency).to.eql(newProduct.cost_in_home_currency)
                    expext(res.body.cmt_country).to.eql(newProduct.cmt_country)
                    expext(res.body.cmt_factory_notes).to.eql(newProduct.cmt_factory_notes)
                    expext(res.body.approved_by_admin).to.eql(newProduct.approved_by_admin)
                    expect(res.body).to.have.property('id')
                    expect(res.headers.location).to.have.eql(`/product/${res.body.id}`)
                    const expected = new Date().toLocaleString()
                    const actual = new Date(res.body.date_published).toLocaleString()
                    expect(actual).to.eql(expected)
                })
                .then(postRes => 
                    supertest(app))
                    .get(`/products/${postRes.body.id}`)
                    .expect(postRes.body)
                
        })

        const requiredFields = [
            'english_name',
            'brand_id',
            'category_id',
            'product_url',
            'home_currency',
            'cost_in_home_currency',
            'cmt_country',
            'cmt_factory_notes',
            'approved_by_admin'
        ]

        requiredFields.forEach(field => {
            const newProduct = {
                english_name: 'Yellow Shirt',
                brand_id: 1,
                category_id: 10,
                product_url: 'https://canopyandunderstory.com',
                home_currency: 'USD',
                cost_in_home_currency: 60,
                cmt_country: 'US',
                cmt_factory_notes: '100 employees',
                approved_by_admin: true
            }

            it(`responds with 400 and an error message when the '${field}' is missing`, () => {
                delete newProduct[field]

                return supertest(app)
                    .post('/products')
                    .send(newProduct)
                    .expect(400, {
                        error: { message: `Missing '${field}' in request body`}
                    })
            })
        })

        it(`Removes XSS attack content from response`, () => {
            const { maliciousProduct, expectedProduct } = makeMaliciousProduct()
            return supertest(app)
                .post('/products')
                .send(maliciousProduct)
                .expect(201)
                .expect(res => {
                    expect(res.body.english_name).to.eql(expectedProduct.english_name)
                    expect(res.body.product_url).to.eql(expectedProduct.product_url)
                    expect(res.body.cmt_factory_notes).to.eql(expectedProduct.cmt_factory_notes)
                })
        })
    })

    describe('DELETE /products/:product_id', () => {
        context('Given there are products in the database', () => {
            const testProducts = makeProductsArray()

            beforeEach('insert products', () => {
                return db
                    .into('products')
                    .insert(testProducts)
            })

            it('responds with 204 and removes the product', () => {
                const idToRemove = 1
                const expectedProducts = testProducts.filter(product => product.id !== idToRemove)
                return supertest(app)
                    .delete(`/products/${idToRemove}`)
                    .expect(204)
                    .then(res => 
                        supertest(app)
                            .get('/products')
                            .expect(expectedProducts)
                    )
            })
        })

        context('Given no products', () => {
            it(`responds with 404`, () => {
                const productId = 234567
                return supertest(app)
                    .delete(`/products/${productId}`)
                    .expect(404, { error: { message: `Product does not exist` } })
            })
        })
    })
})