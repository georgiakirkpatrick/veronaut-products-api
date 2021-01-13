const knex = require('knex')
const app = require('../src/app')
const { expect } = require('chai')
const { makeCategoriesArray, makeBrandsArray, makeWash, makeDry, makeProductsArray, makeMaliciousProduct } = require('./categories.fixtures')
const supertest = require('supertest')

describe('Categories Endpoints', function() {
    let db

    const categories=makeCategoriesArray()
    const brands=makeBrandsArray()
    const wash=[makeWash()]
    const dry=[makeDry()]
    const {products, productsWithBrands}=makeProductsArray()

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DATABASE_URL,
        })
        app.set('db', db)
    })

    after('disconnect from db', () => db.destroy())

    before('clean the table', () => db.raw('TRUNCATE table categories, brands, wash_instructions, dry_instructions, products RESTART IDENTITY CASCADE'))
    
    afterEach('cleanup', () => db.raw('TRUNCATE table categories, brands, wash_instructions, dry_instructions, products RESTART IDENTITY CASCADE'))

    describe('GET /api/categories', () => {
        
        context('Given there are categories in the database', () => {
            const testCategories = makeCategoriesArray()
    
            beforeEach('insert categories', () => {
                return db.into('categories').insert(testCategories)
            })
    
            it('GET /api/categories responds with 200 and all of the categories', () => {
                return supertest(app)
                    .get('/api/categories')
                    .expect(200, testCategories)
            })
        })
    
        context('Given no categories', () => {
            it('responds with 200 and an empty list', () => {
                return supertest(app)
                    .get('/api/categories')
                    .expect(200, [])
            })
        })
    })

    describe('GET /api/categories/:category_id/products', () => {
        context('Given there are products for the specified category', () => {

            beforeEach('insert categories', () => { return db.into('categories').insert(categories) })
            beforeEach('insert brands', () => { return db.into('brands').insert(brands) })
            beforeEach('insert wash', () => { return db.into('wash_instructions').insert(wash) })
            beforeEach('insert dry', () => { return db.into('dry_instructions').insert(dry) })
            beforeEach('insert products', () => { return db.into('products').insert(products) })

            it('it responds with 200 and all the products for the specified category', () => {
                const categoryId = 1

                return supertest(app)
                    .get(`/api/categories/${categoryId}/products`)
                    .expect(200, productsWithBrands)
            })
        })

        context('Given no products', () => {
            
            beforeEach('insert categories', () => { return db.into('categories').insert(categories) })
            beforeEach('insert brands', () => { return db.into('brands').insert(brands) })
            beforeEach('insert wash', () => { return db.into('wash_instructions').insert(wash) })
            beforeEach('insert dry', () => { return db.into('dry_instructions').insert(dry) })
            beforeEach('insert products', () => { return db.into('products').insert([]) })

            it('responds with 200 and an empty list', () => {
                const categoryId = 1

                return supertest(app)
                    .get(`/api/categories/${categoryId}/products`)
                    .expect(200, [])
            })
        })

        context('Given an XSS attack product', () => {
            const { maliciousProduct, expectedProduct } = makeMaliciousProduct()
            
            beforeEach('insert categories', () => { return db.into('categories').insert(categories) })
            beforeEach('insert brands', () => { return db.into('brands').insert(brands) })
            beforeEach('insert wash', () => { return db.into('wash_instructions').insert(wash) })
            beforeEach('insert dry', () => { return db.into('dry_instructions').insert(dry) })
            beforeEach('insert malicious products', () => { return db.into('products').insert([maliciousProduct]) })

            const categoryId = 1

            it('removes XSS attack content', () => {
                return supertest(app)
                    .get(`/api/categories/${categoryId}/products`)
                    .expect(200)
                    .expect(res => {
                        expect(res.body[0].english_name).to.equal(expectedProduct.english_name)
                        expect(res.body[0].product_url).to.equal(expectedProduct.product_url)
                        expect(res.body[0].cmt_factory_notes).to.equal(expectedProduct.cmt_factory_notes)
                    })
            })
        })
    })

    describe('POST /api/categories', () => {
        it('creates a new category, returning 201 and the new category', () => {
            const newCategory = categories[0]

            return supertest(app)
                .post('/api/categories')
                .send(newCategory)
                .expect(201)
                .expect(res => {
                    expect(res.body.english_name).to.eql(newCategory.english_name)
                    expect(res.body.category_class).to.eql(newCategory.category_class)
                })
        })
    })
})