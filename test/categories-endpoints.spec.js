describe('categories endpoints', function() {
    const app = require('../src/app')
    const { expect } = require('chai')
    const knex = require('knex')
    const jwt = require('jsonwebtoken')
    const supertest = require('supertest')

    const { makeBrand, makeMalBrand } = require('./brands.fixtures')
    const { makeCategoryArray, makeMalCategory } = require('./categories.fixtures')
    const { makeProduct, makeDry, makeMalProduct, makeWash } = require('./products.fixtures')
    const { hashedAdminArray, hashedUserArray, makeAdminArray, makeUserArray, makeMalUser } = require('./users.fixtures')
    
    const { categoryPost, categoriesInsert, categoriesGet } = makeCategoryArray()
    const { brandInsert } = makeBrand()
    const { malBrandInsert } = makeMalBrand()
    const { malCatInsert, malCatGet } = makeMalCategory()
    const { productPost, prodExtGet } = makeProduct()
    const { malProdGet, malProdInsert, malProdPost, extendedExpProduct } = makeMalProduct()
    const admin = makeAdminArray()[0]
    const dry = makeDry()
    const hashAdminArray = hashedAdminArray()
    const hashUserArray = hashedUserArray()
    const user = makeUserArray()[0]
    const wash = makeWash()

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
    before('clean the table', () => db.raw('TRUNCATE table categories, brands, wash_instructions, dry_instructions, products, users RESTART IDENTITY CASCADE'))
    afterEach('cleanup', () => db.raw('TRUNCATE table categories, brands, wash_instructions, dry_instructions, products, users RESTART IDENTITY CASCADE'))

    describe('GET /api/categories', () => {
        context('given there are categories in the database', () => {
            beforeEach('insert categories', () => {
                return db.into('categories').insert(categoriesInsert)
            })
    
            it('returns 200 and all of the categories', () => {
                return supertest(app)
                    .get('/api/categories')
                    .expect(200, categoriesGet)
            })
        })

        context('when there are no categories in the database', () => {
            it('responds with 200 and an empty list', () => {
                return supertest(app)
                    .get('/api/categories')
                    .expect(200)
                    .expect([])
            })
        })

        context('given a malicious category', () => {
            before(() => db.into('categories').insert(malCatInsert))
            it('removes the attack content', () => {
                return supertest(app)
                    .get('/api/categories')
                    .expect(200)
                    .expect(res => {
                        expect(res.body).to.eql(malCatGet)
                })    
            })
        })
    })

    describe('GET /api/categories/:category_id/products', () => {
            const categoryId = categoriesInsert[0].id
            const malCatId = malCatInsert.id
        context('given there are products for the specified category', () => {
            beforeEach(() => db.into('categories').insert(categoriesInsert))
            beforeEach(() => db.into('brands').insert(brandInsert))
            beforeEach(() => db.into('wash_instructions').insert(wash))
            beforeEach(() => db.into('dry_instructions').insert(dry))
            beforeEach(() => db.into('products').insert(productInsert))

            it('it responds with 200 and all the products for the specified category', () => {

                return supertest(app)
                    .get(`/api/categories/${categoryId}/products`)
                    .expect(200)
                    .expect(res => {
                        console.log('res.body', res.body)
                        for (let i = 0; i < res.body.length; i++) {
                            if (res.body[i].productObject.category_id === categoryId) {
                                const expectedProduct = prodExtGet.find(product => res.body[i].productObject.id === product.productObject.id)
                                expect(res.body[i].productObject).to.eql(expectedProduct.productObject)
                            }
                        }
                    })
            })      
        })

        context('given there are no products for the specified category', () => {
            beforeEach(() => db.into('categories').insert(categoriesInsert))
            beforeEach(() => db.into('brands').insert(brandInsert))
            beforeEach(() => db.into('wash_instructions').insert(wash))
            beforeEach(() => db.into('dry_instructions').insert(dry))
            it('responds with 200 and an empty list', () => {

                return supertest(app)
                    .get(`/api/categories/${categoryId}/products`)
                    .expect(200)
                    .expect([])
            })
        })

        context('given a malicious product', () => {            
            beforeEach(() => db.into('categories').insert(malCatInsert))
            beforeEach(() => db.into('brands').insert(malBrandInsert))
            beforeEach(() => db.into('wash_instructions').insert(wash))
            beforeEach(() => db.into('dry_instructions').insert(dry))
            beforeEach(() => db.into('products').insert(malProdInsert))

            it('removes the attack content', () => {
                return supertest(app)
                    .get(`/api/categories/${malCatId}/products`)
                    .expect(200)
                    .expect(res => {
                        expect(res.body).to.eql(extendedExpProduct)
                    })
            })
        })
    })

    describe('Protected endpoints', () => {
        beforeEach(() => db.into('users').insert(hashUserArray))

        const invalidSecret = 'bad-secret'
        const invalidUser =  { email: 'not-a-user', password: 'password' }
        const notAnAdmin = { email: user.email, password: user.password }
        const userNoCreds = { email: '', password: '' }
        const validUser = user

        describe('POST /api/categories/', () => {
            it(`responds with 401 and 'Missing bearer token' when no bearer token is provided`, () => {
                return supertest(app)
                    .post('/api/categories')
                    .send({})
                    .expect(401, { error: 'Missing bearer token'})
            })

            it(`responds with 401 and 'Unauthorized request' when no credentials are in the token`, () => {
                return supertest(app)
                    .post(`/api/categories`)
                    .set('Authorization', makeAuthHeader(userNoCreds))
                    .send({})
                    .expect(401, { error: 'Unauthorized request' })
            })

            it(`responds with 401 and 'Unauthorized request' when the JWT secret is invalid`, () => {                
                return supertest(app)
                    .post(`/api/categories`)
                    .set('Authorization', makeAuthHeader(validUser, invalidSecret))
                    .send({})
                    .expect(401, { error: 'Unauthorized request' })
            })

            it(`responds with 401 and 'Unauthorized request' when the JWT secret is invalid`, () => {
                return supertest(app)
                        .post(`/api/categories`)
                        .set('Authorization', makeAuthHeader(invalidUser))
                        .send({})
                        .expect(401, { error: 'Unauthorized request' })
            })

            it(`responds with 401 and 'Unauthorized request' when the user is not an admin`, () => {
                return supertest(app)
                    .post('/api/categories/')
                    .set('Authorization', makeAuthHeader(notAnAdmin))
                    .send({})
                    .expect(401, { error: 'Unauthorized request' })
            })
        })

        describe('PATCH /api/categories/:category_id', () => {
            beforeEach(() => db.into('categories').insert(categoriesInsert))

            it(`responds with 401 'Missing bearer token' when no bearer token`, () => (
                supertest(app)
                    .patch('/api/categories/1')
                    .send({ english_name: "new category name"})
                    .expect(401, { error: 'Missing bearer token'})
            ))
    
            it(`responds with 401 and 'Unauthorized request' when no credentials are in the token`, () => {    
                return supertest(app)
                    .patch('/api/categories/1')
                    .set('Authorization', makeAuthHeader(userNoCreds))
                    .send({})
                    .expect(401, { error: 'Unauthorized request' })
            })
    
            it(`responds with 401 and 'Unauthorized request' when the JWT secret is invalid`, () => {                
                return supertest(app)
                    .patch(`/api/categories/1`)
                    .set('Authorization', makeAuthHeader(validUser, invalidSecret))
                    .send({})
                    .expect(401, { error: 'Unauthorized request' })
            })
    
            it(`responds with 401 and 'Unauthorized request' when the user is not an admin`, () => {
                return supertest(app)
                    .patch('/api/categories/1')
                    .set('Authorization', makeAuthHeader(notAnAdmin))
                    .send({})
                    .expect(401, { error: 'Unauthorized request' })
            })
        })    
    })

    describe('POST /api/categories', () => {
        beforeEach(() => db.into('users').insert(hashAdminArray))

        it('creates a new category, returning 201 and the new category', async () => {
            const postResponse = await supertest(app)
                .post('/api/categories')
                .set('Authorization', makeAuthHeader(admin))
                .send(categoryPost)

            const getResponse = await supertest(app)
                .get('/api/categories')

            const expectedPostBody = {
                id: postResponse.body.id,
                ...categoryPost
            }

            const expectedGetBody = [ expectedPostBody ]
            

            expect(postResponse.status).to.eql(201)
            expect(postResponse.headers.location).to.eql(`/api/categories/${postResponse.body.id}`)
            expect(postResponse.body).to.eql(expectedPostBody)
            expect(getResponse.status).to.eql(200)
            expect(getResponse.body).to.eql(expectedGetBody)
        })

        it(`responds with 400 and an error message when the 'english_name' field is missing`, () => {
            const missingReqdField = {}

            return supertest(app)
                .post('/api/categories')
                .set('Authorization', makeAuthHeader(admin))
                .send(missingReqdField)
                .expect(400, {
                    error: { message: `Missing 'english_name' in request body.`}
                })
        })

        context('given a malicious category', () => {
            it(`removes the attack content from the response`, async () => {
                const postResponse = await supertest(app)
                    .post('/api/categories')
                    .set('Authorization', makeAuthHeader(admin))
                    .send(categoryPost)

                    const getResponse = await supertest(app)
                        .get('/api/categories')

                    const expectedPostBody = {
                        id: postResponse.body.id,
                        ...categoryPost
                    }

                    const expectedGetBody = [ expectedPostBody ]

                    expect(postResponse.status).to.eql(201)
                    expect(postResponse.headers.location).to.eql(`/api/categories/${postResponse.body.id}`)
                    expect(postResponse.body).to.eql(expectedPostBody)
                    expect(getResponse.status).to.eql(200)
                    expect(getResponse.body).to.eql(expectedGetBody)
            })
        }

        )
        
    })

    describe('PATCH /api/categories/:category_id', () => {
        beforeEach(() => db.into('users').insert(hashAdminArray))

        const catToUpdate = categoriesInsert[0]
        const idToUpdate = catToUpdate.id
        const fullUpdate = {
            english_name: 'umbrellas',
            category_class: 'accessories',
            feature_image: 'umbrella-pic.com'
        }
        const subsetUpdate = {
            english_name: 'umbrellas'
        }

        context('given the category is in the database', () => {
            beforeEach(() => db.into('categories').insert(categoriesInsert))

            it('responds with 204 and updates the category', async () => {
                const patchResponse = await supertest(app)
                    .patch(`/api/categories/${idToUpdate}`)
                    .set('Authorization', makeAuthHeader(admin))
                    .send(fullUpdate)

                const getResponse = await supertest(app)
                   .get(`/api/categories/`)

                const expectedCatArray = () => {
                    const updatedCat = {
                        ...catToUpdate,
                        ...fullUpdate
                    }
                    const newArray = [ ...categoriesInsert ]

                    newArray.splice(0, 1) // update this to newArray.splice(0, 1, updatedCat) and delete following splice method once server sorts items by ID
                    newArray.push(updatedCat)
                    return newArray
                }
        
                expect(patchResponse.status).to.eql(204)
                expect(getResponse.status).to.eql(200)
                expect(getResponse.body).to.eql(expectedCatArray())
            })

            it('responds with 400 when no required fields are supplied', () => {
                return supertest(app)
                    .patch(`/api/categories/${idToUpdate}`)
                    .set('Authorization', makeAuthHeader(admin))
                    .send({irrelevantField: 'bar'})
                    .expect(400, {
                        error: { message: `Request body must include 'english_name', 'category_class', and/or 'feature_image'`}
                    })
            })

            it(`responds with 204 when updating only a subset of fields`, async () => {
                const patchResponse = await supertest(app)
                    .patch(`/api/categories/${idToUpdate}`)
                    .set('Authorization', makeAuthHeader(admin))
                    .send(subsetUpdate)


                const getResponse = await supertest(app)
                   .get(`/api/categories/`)

                const expectedCatArray = () => {
                    const updatedCat = {
                        ...catToUpdate,
                        ...subsetUpdate
                    }

                    const newArray = [ ...categoriesInsert ]

                    newArray.splice(0, 1) // update this to newArray.splice(0, 1, updatedCat) and delete following splice method once server sorts items by ID
                    newArray.push(updatedCat)
                    return newArray
                }
        
                expect(patchResponse.status).to.eql(204)
                expect(getResponse.status).to.eql(200)
                expect(getResponse.body).to.eql(expectedCatArray())
            })
        })

        context('given nonexistant category id', () => {
            it('responds with 404', () => {
                const categoryId = 654
                return supertest(app)
                    .patch(`/api/categories/${categoryId}`)
                    .set('Authorization', makeAuthHeader(admin))
                    .expect(404, { error: { message: `Category does not exist.` } })
            })
        })
    })    
})