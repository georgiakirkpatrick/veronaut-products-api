const knex = require('knex')
const app = require('../src/app')
const { expect } = require('chai')
const supertest = require('supertest')
const { makeBrandArray } = require('./brands.fixtures')
const { makeCategoryArray, makeMalCat } = require('./categories.fixtures')
const { makeProductArray, makeDry, makeMalProduct, makeWash } = require('./products.fixtures')
const { makeAdmin, makeUsers } = require('./users.fixtures')

describe('Categories Endpoints', function() {
    const adminArray = makeAdmin()
    const categories = makeCategoryArray()
    const brands = makeBrandArray()
    const wash = makeWash()
    const dry = makeDry()
    const { productsPost, productsExtendedGet } = makeProductArray()
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
    before('clean the table', () => db.raw('TRUNCATE table categories, brands, wash_instructions, dry_instructions, products, users RESTART IDENTITY CASCADE'))
    afterEach('cleanup', () => db.raw('TRUNCATE table categories, brands, wash_instructions, dry_instructions, products, users RESTART IDENTITY CASCADE'))

    describe('GET /api/categories', () => {
        context('Given there are categories in the database', () => {
            beforeEach('insert categories', () => {
                return db.into('categories').insert(categories)
            })
    
            it('GET /api/categories responds with 200 and all of the categories', () => {
                return supertest(app)
                    .get('/api/categories')
                    .expect(200, categories)
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
            beforeEach(() => db.into('categories').insert(categories))
            beforeEach(() => db.into('brands').insert(brands))
            beforeEach(() => db.into('wash_instructions').insert(wash))
            beforeEach(() => db.into('dry_instructions').insert(dry))
            beforeEach(() => db.into('products').insert(productsPost))

            it('it responds with 200 and all the products for the specified category', () => {
                const categoryId = 1

                return supertest(app)
                    .get(`/api/categories/${categoryId}/products`)
                    .expect(200, productsExtendedGet)
            })      
        })

        context('Given no products', () => {
    
            beforeEach(() => db.into('categories').insert(categories))
            beforeEach(() => db.into('brands').insert(brands))
            beforeEach(() => db.into('wash_instructions').insert(wash))
            beforeEach(() => db.into('dry_instructions').insert(dry))

            it('responds with 200 and an empty list', () => {
                const categoryId = 1

                return supertest(app)
                    .get(`/api/categories/${categoryId}/products`)
                    .expect(200, [])
            })
        })

        context('Given an XSS attack product', () => {
            const { malProduct, expectedProduct } = makeMalProduct()
            
            beforeEach(() => db.into('categories').insert(categories))
            beforeEach(() => db.into('brands').insert(brands))
            beforeEach(() => db.into('wash_instructions').insert(wash))
            beforeEach(() => db.into('dry_instructions').insert(dry))
            beforeEach(() => db.into('products').insert([malProduct]))

            const categoryId = 1

            it('removes XSS attack content', () => {
                return supertest(app)
                    .get(`/api/categories/${categoryId}/products`)
                    .expect(200)
                    .expect(res => {
                        expect(res.body[0].productObject.english_name).to.equal(expectedProduct.english_name)
                        expect(res.body[0].productObject.product_url).to.equal(expectedProduct.product_url)
                        expect(res.body[0].productObject.cmt_factory_notes).to.equal(expectedProduct.cmt_factory_notes)
                    })
            })
        })
    })

    describe('Protected endpoints', () => {
        beforeEach(() => db.into('users').insert(users)) 

        const newCategory = categories[0]

        describe('POST /api/categories/', () => {
            it(`responds with 401 'Missing basic token' when no basic token`, () => (
                supertest(app)
                    .post('/api/categories')
                    .send(newCategory)
                    .expect(401, { error: `Missing basic token`})
            ))

            it(`responds 401 'Unauthorized request' when no credentials in token`, () => {
                const userNoCreds = { email: '', password: '' }
                return supertest(app)
                    .post(`/api/categories`)
                    .set('Authorization', makeAuthHeader(userNoCreds))
                    .send(newCategory)
                    .expect(401, { error: `Unauthorized request` })
            })

            it(`responds 401 'Unatuhorized request' when invalid user`, () => {
                const invalidUserCreds =  { email: 'not-a-user', password: 'incorrect-password' }
                
                return supertest(app)
                    .post(`/api/categories`)
                    .set('Authorization', makeAuthHeader(invalidUserCreds))
                    .send(newCategory)
                    .expect(401, { error: 'Unauthorized request' })
            })

            it(`responds 401 'Unauthorized request' when the password is wrong`, () => {
                const incorrectPassword = { email: users[0].email, password: 'wrong' }

                return supertest(app)
                    .post('/api/categories')
                    .set('Authorization', makeAuthHeader(incorrectPassword))
                    .send(newCategory)
                    .expect(401, { error: 'Unauthorized request' })
            })
        })

        describe('PATCH /api/categories/:category_id', () => {
            beforeEach(() => db.into('categories').insert(categories))
    
            it(`responds with 401 'Missing basic token' when no basic token`, () => (
                supertest(app)
                    .patch('/api/categories/1')
                    .send({ english_name: "new category name"})
                    .expect(401, { error: `Missing basic token`})
            ))
    
            it(`responds 401 'Unauthorized request' when no credentials in token`, () => {
                const userNoCreds = { email: '', password: '' }
    
                return supertest(app)
                    .patch('/api/categories/1')
                    .set('Authorization', makeAuthHeader(userNoCreds))
                    .send({ english_name: "new category name" })
                    .expect(401, { error: `Unauthorized request` })
            })
    
            it(`responds 401 'Unatuhorized request' when invalid user`, () => {
                const invalidUserCreds =  { email: 'not-a-user', password: 'incorrect-password' }
                
                return supertest(app)
                    .patch(`/api/categories/1`)
                    .set('Authorization', makeAuthHeader(invalidUserCreds))
                    .send({ english_name: "new category name" })
                    .expect(401, { error: 'Unauthorized request' })
            })
    
            it(`responds 401 'Unauthorized request' when the password is wrong`, () => {
                const incorrectPassword = { email: adminArray[0].email, password: 'wrong' }
    
                return supertest(app)
                    .patch('/api/categories/1')
                    .set('Authorization', makeAuthHeader(incorrectPassword))
                    .send({ english_name: "new category name" })
                    .expect(401, { error: 'Unauthorized request' })
            })
    
            it(`responds 401 'Unauthorized request' when the user is not an admin`, () => {
                const notAnAdmin = { email: adminArray[0].email, password: adminArray[0].password }
    
                return supertest(app)
                    .patch('/api/categories/1')
                    .set('Authorization', makeAuthHeader(notAnAdmin))
                    .send({ english_name: "new category name" })
                    .expect(401, { error: 'Unauthorized request' })
            })
        })    
    })

    describe('POST /api/categories', () => {
        beforeEach(() => db.into('users').insert(users)) 

        it('creates a new category, returning 201 and the new category', () => {
            const newCategory = {
                english_name: categories[0].english_name,
                category_class: categories[0].category_class,
                feature_image: categories[0].feature_image
            }

            return supertest(app)
                .post('/api/categories')
                .set('Authorization', makeAuthHeader(users[0]))
                .send(newCategory)
                .expect(201)
                .expect(res => {
                    expect(res.body.english_name).to.eql(newCategory.english_name)
                    expect(res.body.category_class).to.eql(newCategory.category_class)
                    expect(res.body.feature_image).to.eql(newCategory.feature_image)
                })
        })

        const requiredFields = [
            'english_name'
        ]

        requiredFields.forEach(field => {
            const newCategory = {
                english_name: 'House slippers'
            }

            it(`responds with 400 and an error message when the '${field}' is missing`, () => {
                delete newCategory[field]

                return supertest(app)
                    .post('/api/categories')
                    .set('Authorization', makeAuthHeader(users[0]))
                    .send(newCategory)
                    .expect(400, {
                        error: { message: `Missing '${field}' in request body.`}
                    })
            })
        })

        it(`Removes XSS attack content from response`, () => {
            const { malCategory, expectedCategory } = makeMalCat()

            return supertest(app)
                .post('/api/categories')
                .set('Authorization', makeAuthHeader(users[0]))
                .send(malCategory)
                .expect(201)
                .expect(res => {
                    expect(res.body.english_name).to.eql(expectedCategory.english_name)
                    expect(res.body.category_class).to.eql(expectedCategory.category_class)
                    expect(res.body.feature_image).to.eql(expectedCategory.feature_image)
                })
        })
    })

    describe('PATCH /api/categories/:category_id', () => {
        beforeEach(() => db.into('users').insert(adminArray))

        const adminUser = adminArray[0]

        context('Given the category is in the database', () => {
            beforeEach(() => db.into('categories').insert(categories))

            it('responds with 204 and updates the category', () => {
                const idToUpdate = 2

                const updateCategory = {
                    english_name: 'umbrellas',
                    category_class: 'accessories',
                    feature_image: 'umbrella-pic.com'
                }

                const expectedCategory = {
                    ...categories[idToUpdate - 1],
                    ...updateCategory
                }

                return supertest(app)
                    .patch(`/api/categories/${idToUpdate}`)
                    .set('Authorization', makeAuthHeader(adminUser))
                    .send(updateCategory)
                    .expect(204)
                    .then(async res => {
                        await supertest(app)
                        .get(`/api/categories`)
                        .expect(200)
                        .expect(res => {
                            const updatedCat = res.body.find(cat => cat.id === idToUpdate)
                            const updateKeys = Object.keys(updateCategory)

                            updateKeys.forEach(key => {
                                expect(updatedCat[key]).to.eql(expectedCategory[key])
                            })
                        })
                        .catch(error => {
                            console.log(error)
                        })
                    })
            })

            it('responds with 400 when no required fields are supplied', () => {
                const idToUpdate = 1
                return supertest(app)
                    .patch(`/api/categories/${idToUpdate}`)
                    .set('Authorization', makeAuthHeader(adminUser))
                    .send({irrelevantField: 'bar'})
                    .expect(400, {
                        error: { message: `Request body must include 'english_name', 'category_class', and/or 'feature_image'`}
                    })
            })

            it(`responds with 204 when updating only a subset of fields`, () => {
                const idToUpdate = 1
                const updateCategory = {
                    english_name: 'new category name'
                }
                const expectedCategory = {
                    ...categories[idToUpdate - 1],
                    ...updateCategory
                }

                return supertest(app)
                    .patch(`/api/categories/${idToUpdate}`)
                    .set('Authorization', makeAuthHeader(adminUser))
                    .send({
                        ...updateCategory,
                        fieldToIgnore: 'should not be in the GET response'})
                    .expect(204)
                    .then(res => {
                        return supertest(app)
                            .get(`/api/categories`)
                            .expect(res => {
                                const updatedCat = res.body.find(cat => cat.id === idToUpdate)
                                const updateKeys = Object.keys(updateCategory)

                                updateKeys.forEach(key => {
                                    expect(updatedCat[key]).to.eql(expectedCategory[key])
                                })
                            })
                    })
            })
        })

        context('Given nonexistant category id', () => {
            it('responds with 404', () => {
                const categoryId = 654
                return supertest(app)
                    .patch(`/api/categories/${categoryId}`)
                    .set('Authorization', makeAuthHeader(adminUser))
                    .expect(404, { error: { message: `Category does not exist.` } })
            })
        })
    })    
})