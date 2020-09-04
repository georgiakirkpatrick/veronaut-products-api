const { expect } = require('chai')
const knex = require('knex')
const app = require('../src/app')
const supertest = require('supertest')
const { makeProductsArray } = require('./products.fixtures')

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

describe('GET /products', function() {
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

    context('Given no categories', () => {
        it('responds with 200 and an empty list', () => {
            return supertest(app)
                .get('/products')
                .expect(200, [])
        })
    })
})
        
describe.only('GET /products/:product_id', function() {
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

    context('Given no products', () => {
        it(`responds with 404`, () => {
            const categoryId = 123456
            return supertest(app)
                .get(`products/${productId}`)
                .expect(404, { error: { message: `Product doesn't exist` } })
        })
    })
})

    