describe('Products Endpoints', () => {
    const app = require('../src/app')
    const { expect } = require('chai')
    const knex = require('knex')
    const jwt = require('jsonwebtoken')
    const supertest = require('supertest')

    const { makeCategoryArray } = require('./categories.fixtures')
    const { makeBrand, makeMalBrand } = require('./brands.fixtures')
    const { makeCertArray, makeMalCert } = require('./certifications.fixtures')
    const { makeFabric, makeMalFabric } = require('./fabrics.fixtures')
    const { makeFactory, makeMalFactory } = require('./factories.fixtures')
    const { makeFiber, makeFiberType, makeMalFiber, makeMalFiberType } = require('./fibers.fixtures')
    const { makeNotion, makeNotionType, makeMalNotion, makeMalNotionType, makeNotsToCerts, makeMalNotToMalCert } = require('./notions.fixtures')
    const { makeColor, makeDry, makeImage, makeProduct, makeProdToCert, 
        makeProdFab, makeProdFact, makeProdFib, makeProdNot, makeProdSize, 
        makeWash, makeMalColor, makeMalImage, makeMalProduct } = require('./products.fixtures')
    const { hashedAdminArray, hashedUserArray, makeAdminArray, makeUserArray } = require('./users.fixtures')
    const { brandInsert } = makeBrand()
    const { categoriesInsert } = makeCategoryArray()
    const { certArrayInsert } = makeCertArray()
    const { colorPost, colorInsert, colorGet } = makeColor()
    const { fabricPost, fabricInsert, fabricGetAll } = makeFabric()
    const { factoryInsert } = makeFactory()
    const { fiberInsert, fiberGet} = makeFiber()
    const { imagePost, imageInsert, imageGet } = makeImage()
    const { malBrandInsert } = makeMalBrand()
    const { malCertGet, malCertInsert } = makeMalCert()
    const { malColorPost, malColorInsert, malColorGet } = makeMalColor()
    const { malFabPost, malFabInsert, malFabGetAll } = makeMalFabric()
    const { malFactInsert, malFactGet } = makeMalFactory() 
    const { malFiberInsert, malFiberGet } = makeMalFiber()
    const { malFtInsert } = makeMalFiberType()
    const { malImagePost, malImageInsert, malImageGet } = makeMalImage()
    const { malNotionInsert, malNotionGet } = makeMalNotion()
    const { malNtInsert } = makeMalNotionType()
    const { malProdGet, malProdInsert, malProdPost, extMalProdGet } = makeMalProduct()
    const { notionInsert } = makeNotion()
    const { productPost, prodFormPost, productInsert, unfeaturedProdInsert, prodSubsetUpdate, prodFullUpdate, prodOnlyGet, prodExtGet } = makeProduct()
    const { prodCertPost, prodCertInsert, prodCertGet, prodMalCertInsert, prodMalCertGet } = makeProdToCert()
    const { prodToFabPost, prodToFabInsert, prodToMalFabInsert, prodFabGet } = makeProdFab()
    const { prodToFactPost, prodToMalFactPost, prodFactGet, prodMalFactGet } = makeProdFact()
    const { prodFibPost, prodFibInsert, prodFibGet, prodMalFibPost, prodMalFibInsert, prodMalFibGet } = makeProdFib()
    const { prodNotPost, prodNotInsert, prodNotGet, prodToMalNot, prodMalNotArray } = makeProdNot()
    const { sizeInsert, prodSizePost, prodSizeInsert, prodSizeGet } = makeProdSize()
    const admin = makeAdminArray()[0]
    const dryInstructions = [ makeDry() ]
    const { ftInsert } = makeFiberType()
    const hashAdminArray = hashedAdminArray()
    const hashUserArray = hashedUserArray()
    const { ntInsert } = makeNotionType()
    const user = makeUserArray()[0]
    const washInstructions = [ makeWash() ]      

    let db

    const makeAuthHeader = (user, secret = process.env.JWT_SECRET) => {
        const token = jwt.sign({ user_id: user.id }, secret, {
            subject: user.email,
            algorithm: 'HS256',
        })
        return `Bearer ${token}`
    } 
    
    const insertProductArray = () => (
        Promise.all([
            db.into('brands').insert(brandInsert),
            db.into('categories').insert(categoriesInsert),
            db.into('dry_instructions').insert(dryInstructions),
            db.into('factories').insert(factoryInsert),
            db.into('wash_instructions').insert(washInstructions),
            db.into('users').insert(hashUserArray)
        ])
        .then(() => db.into('products').insert(productInsert))
    )

    const insertProdReqs = () => (
        Promise.all([
            db.into('brands').insert(brandInsert),
            db.into('categories').insert(categoriesInsert),
            db.into('dry_instructions').insert(dryInstructions),
            db.into('factories').insert(factoryInsert),
            db.into('wash_instructions').insert(washInstructions),
            db.into('users').insert(hashUserArray)
        ])
    )

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DATABASE_URL,
        })
        app.set('db', db)
    })
    after('disconnect from db', () => db.destroy())

    const cleanUpTables = () => db.raw(
        `TRUNCATE table fabrics_to_products, fibers_to_products, notions_to_certifications, notions_to_fibers_and_materials, notions_to_products, 
        product_cmts_to_certifications, product_cmts_to_factories, sizes_to_products, products, product_colors, fabrics, notions,fibers_and_materials, 
        brands,categories,certifications, dry_instructions, fabric_types, factories, fiber_and_material_types, notion_types, sizes, wash_instructions, users
        RESTART IDENTITY CASCADE`
    )

    before('clean tables', () => cleanUpTables())
    afterEach('clean tables', () => cleanUpTables())

    describe('GET /api/products', () => {
        context('given there are products in the database', () => {
            beforeEach(insertProductArray)

            it('responds with 200 and all of the products', () => {
                return supertest(app)
                    .get('/api/products')
                    .expect(200, prodOnlyGet)
            })
        })

        context('when there are no products in the database', () => {
            it('responds with 200 and an empty list', () => {
                return supertest(app)
                    .get('/api/products')
                    .expect(200, [])
            })
        })

        context('given a malicious product', () => {
            beforeEach(() =>  db.into('brands').insert(malBrandInsert))
            beforeEach(() =>  db.into('wash_instructions').insert(washInstructions))
            beforeEach(() =>  db.into('dry_instructions').insert(dryInstructions))
            beforeEach(() =>  db.into('categories').insert(categoriesInsert))
            beforeEach(() =>  db.into('products').insert(malProdInsert))

            it('removes the attack content', () => {
                return supertest(app)
                    .get('/api/products')
                    .expect(200, [ malProdGet ])
            })
        })
    })

    describe('GET /api/products/featured', () => {
        beforeEach(insertProdReqs)

        context('given there are featured products in the database', () => {
            beforeEach(() => db.into("products").insert(productInsert))

            it('responds with 200 and all of the featured products', () => {
                return supertest(app)
                    .get('/api/products/featured')
                    .expect(200, prodOnlyGet)
            })
        })

        context('when there are no featured products in the database', () => {
            beforeEach(() => db.into("products").insert(unfeaturedProdInsert))

            it('responds with 200 and an empty list', () => {
                return supertest(app)
                    .get('/api/products/featured')
                    .expect(200, [])
            })
        })

        context('given a malicious featured product', () => {
            beforeEach(() =>  db.into('brands').insert(malBrandInsert))
            beforeEach(() =>  db.into('products').insert(malProdInsert))

            it('removes the attack content', () => {
                return supertest(app)
                    .get('/api/products/featured')
                    .expect(200, [ malProdGet ])
            })
        })
    })

    describe('GET /api/products/:product_id', () => {
        beforeEach(insertProductArray)
        const productId = productInsert.id

        context('given the product with id product_id exists', () => {
            it('responds with 200 and returns the product with id product_id', () => {
                return supertest(app)
                    .get(`/api/products/${productId}`)
                    .expect(200, prodExtGet[productId - 1])
            })
        })

        context('when the product does not exist', () => {
            it('responds with 404 and an error message', () => {
                const nonexistantId = productInsert.id + 1
                
                return supertest(app)
                    .get(`/api/products/${nonexistantId}`)
                    .expect(404, { error: { message: `Product does not exist.` } })
            })
        })

        context('given a malicious product', () => {
            beforeEach(() =>  db.into('brands').insert(malBrandInsert))
            beforeEach(() =>  db.into('factories').insert(malFactInsert))
            beforeEach(() => db.into('products').insert(malProdInsert))
            const malProductId = malProdInsert.id

            it('removes the attack content', async () => {
                return supertest(app)
                    .get(`/api/products/${malProductId}`)
                    .expect(200, extMalProdGet)
            })
        })
    })

    describe('GET /api/products/:product_id/certifications', () => {
        const productId = productInsert.id

        context('when there are certifications associated with the product with id product_id', () => {
            beforeEach(insertProductArray)
            beforeEach(() =>  db.into('certifications').insert(certArrayInsert))
            beforeEach(() =>  db.into('product_cmts_to_certifications').insert(prodCertInsert))
            
            it('responds with 200 and all the certifications', () => {
                return supertest(app)
                    .get(`/api/products/${productId}/certifications`)
                    .expect(200, prodCertGet)
            })
        })

        context('when there are no certifications associated with the product with id product_id', () => {
            beforeEach(insertProductArray)

            it('responds with 200 and an empty list', () => {
                return supertest(app)
                    .get(`/api/products/${productId}/certifications`)
                    .expect(200)
                    .expect([])
            })
        })

        context('given a malicious certification', () => {
            beforeEach(insertProductArray)
            beforeEach(() =>  db.into('certifications').insert( malCertInsert))
            beforeEach(() =>  db.into('product_cmts_to_certifications').insert(prodMalCertInsert))

            it('removes the attack content', () => {
                return supertest(app)
                    .get(`/api/products/${productId}/certifications`)
                    .expect(200, prodMalCertGet)
            })
        })
    })

    // insert GET /:product_id/colors testing suite here
    describe.only("GET /api/products/:product_id/colors", () => {
        const productId = productInsert.id

        context('when there are colors associated with the product with id product_id', () => {
            beforeEach(insertProductArray)
            beforeEach(() =>  db.into("product_colors").insert(colorInsert))
            
            it('responds with 200 and all the colors', () => {
                return supertest(app)
                    .get(`/api/products/${productId}/colors`)
                    .expect(200, colorGet)
            })
        })

        context('when there are no colors associated with the product with id product_id', () => {
            beforeEach(insertProductArray)

            it('responds with 200 and an empty list', () => {
                return supertest(app)
                    .get(`/api/products/${productId}/colors`)
                    .expect(200)
                    .expect([])
            })
        })

        context('given a malicious color', () => {
            beforeEach(insertProductArray)
            beforeEach(() =>  db.into('product_colors').insert(malColorInsert))

            it('removes the attack content', () => {
                return supertest(app)
                    .get(`/api/products/${productId}/colors`)
                    .expect(200, malColorGet)
            })
        })
    })

    describe('GET /api/products/:product_id/fabrics', () => {
        beforeEach(insertProductArray)
        const productId = productInsert.id

        context('when there are fabrics associated with the product with id product_id', () => {
            beforeEach(() =>  db.into('fabrics').insert(fabricInsert))
            beforeEach(() => db.into('fabrics_to_products').insert(prodToFabInsert))

            it('responds with 200 and all the fabrics', () => {
                return supertest(app)
                    .get(`/api/products/${productId}/fabrics`)
                    .expect(200, prodFab)
            })
        })

        context('when there are no fabrics associated with the product with id product_id', () => {
            it('responds with 200 and an empty list', () => {
                
                return supertest(app)
                    .get(`/api/products/${productId}/fabrics`)
                    .expect(200, [])
            })
        })

        context('given a malicious fabric', () => {
            beforeEach(() =>  db.into('brands').insert(malBrandInsert))
            beforeEach(() =>  db.into('fabrics').insert(malFabInsert))
            beforeEach(() => db.into('fabrics_to_products').insert(prodToMalFabInsert))

            it('removes the attack content', () => {
                return supertest(app)
                    .get(`/api/products/${productId}/fabrics`)
                    .expect(200, prodMalFab)
            })
        })
    })

    describe('GET /api/products/:product_id/factories', () => {
        beforeEach(insertProductArray)
        productId = 1

        context('when there are factories associated with the product with id product_id', () => {
            beforeEach(() =>  db.into('product_cmts_to_factories').insert(prodToFactPost))

            it('responds with 200 and all the factories', () => {
                return supertest(app)
                    .get(`/api/products/${productId}/factories`)
                    .expect(200, prodFactGet)
            })
        })

        context('when there are no factories associated with the product with id product_id', () => {
            it('responds with 200 and an empty list', () => {
                return supertest(app)
                    .get(`/api/products/${productId}/factories`)
                    .expect(200, [])
                })
        })

        context('given a malicious factory', () => {
            beforeEach(() =>  db.into('factories').insert(malFactInsert))
            beforeEach(() =>  db.into('product_cmts_to_factories').insert(prodToMalFactPost))

            it('removes the attack content', () => {
                return supertest(app)
                    .get(`/api/products/${productId}/factories`)
                    .expect(200, prodMalFactGet)
            })
        })
    })

    describe('GET /api/products/:product_id/fibers', () => {
        beforeEach(insertProductArray)
        const productId = productInsert.id

        context('when there are fibers associated with the product with id product_id', () => {
            beforeEach(() =>  db.into('fiber_and_material_types').insert(ftInsert))
            beforeEach(() =>  db.into('fibers_and_materials').insert(fiberInsert))
            beforeEach(() =>  db.into('fibers_to_products').insert(prodFibPost))

            it('responds with 200 and all the fibers', () => {
                return supertest(app)
                    .get(`/api/products/${productId}/fibers`)
                    .expect(200, fiberGet)
            })
        })

        context('when there are no fibers associated with the product with id product_id', () => {
            it('responds with 200 and an empty list', () => {

            return supertest(app)
                .get(`/api/products/${productId}/fibers`)
                .expect(200, [])
            })
        })

        context('given a malicious fiber', () => {
            beforeEach(() =>  db.into('brands').insert(malBrandInsert))
            beforeEach(() =>  db.into('factories').insert(malFactInsert))
            beforeEach(() =>  db.into('fiber_and_material_types').insert(malFtInsert))
            beforeEach(() =>  db.into('fibers_and_materials').insert(malFiberInsert))
            beforeEach(() =>  db.into('fibers_to_products').insert(prodMalFibPost))

            it('removes the attack content', () => {
                return supertest(app)
                    .get(`/api/products/${productId}/fibers`)
                    .expect(200, malFiberGet)
            })
        })
    })

    describe('GET /api/products/:product_id/images', () => {
        beforeEach(insertProductArray)
        beforeEach(() => db.into('product_colors').insert(colorInsert))
        const productId = productInsert.id

        context('when there are images associated with the product with id product_id', () => {
            beforeEach(() =>  db.into('product_images').insert(imageInsert))
            
            it('responds with 200 and all the images', () => {
                return supertest(app)
                    .get(`/api/products/${productId}/images`)
                    .expect(200, [ imageGet ])
            })
        })

        context('when there are no images associated with the product with id product_id', () => {
            it('responds with 200 and an empty list', () => {
                return supertest(app)
                    .get(`/api/products/${productId}/images`)
                    .expect(200, [])
            })
        })

        context('given a malicious image', () => {
            beforeEach(() =>  db.into('product_images').insert(malImageInsert))

            it('removes the attack content', () => {
                return supertest(app)
                    .get(`/api/products/${productId}/images`)
                    .expect(200, [ malImageGet ])
            })
        })
    })

    describe('GET /api/products/:product_id/notions', () => {
        beforeEach(insertProductArray)
        const productId = productInsert.id

        context('when there are notions associated with the product with id product_id', () => {
            beforeEach(() => db.into('certifications').insert(certArrayInsert))
            beforeEach(() => db.into('fiber_and_material_types').insert(ftInsert))
            beforeEach(() => db.into('notion_types').insert(ntInsert))
            beforeEach(() => db.into('notions').insert(notionInsert))
            beforeEach(() => db.into('notions_to_products').insert(prodNotInsert))
            beforeEach(() => db.into('notions_to_certifications').insert(makeNotsToCerts()))

            it('responds with 200 and all the notions', () => {
                return supertest(app)
                    .get(`/api/products/${productId}/notions`)
                    .expect(200, makeProdNot().prodNotArray)
            })
        })

        context('when there are no notions associated with the product with id product_id', () => {
            it('responds with 200 and an empty list', () => {
            
            return supertest(app)
                .get(`/api/products/${productId}/notions`)
                .expect(200)
                .expect([])
            })
        })

        context('given a malicious notion', () => {
            beforeEach(() => db.into('certifications').insert(malCertInsert))
            beforeEach(() => db.into('factories').insert(malFactInsert))
            beforeEach(() => db.into('fiber_and_material_types').insert(malFtInsert))
            beforeEach(() => db.into('notion_types').insert(malNtInsert))
            beforeEach(() => db.into('notions').insert(malNotionInsert))
            beforeEach(() => db.into('notions_to_products').insert(makeProdNot().prodToMalNot))
            beforeEach(() => db.into('notions_to_certifications').insert(makeMalNotToMalCert()))

            it('removes the attack content', () => {
                return supertest(app)
                    .get(`/api/products/${productId}/notions`)
                    .expect(200, makeProdNot().prodMalNotArray)
            })
        })        
    })

    describe('GET /api/products/:product_id/sizes', () => {
        beforeEach(insertProductArray)
        const productId = productInsert.id

        context('when there are sizes associated with the product with id product_id', () => {
            beforeEach(() =>  db.into('sizes').insert(sizeInsert))
            beforeEach(() =>  db.into('sizes_to_products').insert(prodSizeInsert))

            it('responds with 200 and all the sizes', () => {
                return supertest(app)
                    .get(`/api/products/${productId}/sizes`)
                    .expect(200, [ sizeInsert ])
            })
        })

        context('when there are no sizes associated with the product with id product_id', () => {
            it('responds with 200 and an empty list', () => {
                return supertest(app)
                    .get(`/api/products/${productId}/sizes`)
                    .expect(200, [])
            })
        })
    })

    describe('Protected endpoints', () => {
        describe('POST /api/products/', () => {
            beforeEach(() => db.into('brands').insert(brandInsert))
            beforeEach(() => db.into('categories').insert(categoriesInsert))
            beforeEach(() => db.into('dry_instructions').insert(dryInstructions))
            beforeEach(() => db.into('factories').insert(factoryInsert))
            beforeEach(() => db.into('wash_instructions').insert(washInstructions))
            beforeEach(() => db.into('users').insert(hashUserArray))
            const invalidSecret = 'bad-secret'
            const invalidUser =  { email: 'not-a-user', password: 'password' }
            const notAnAdmin = { email: user.email, password: user.password }
            const userNoCreds = { email: '', password: '' }
            const validUser = user

            it(`responds with 401 'Missing bearer token' when no bearer token is provided`, () => {
                return supertest(app)
                    .post('/api/products')
                    .send(productPost)
                    .expect(401, { error: 'Missing bearer token'})
            })

            it(`responds with 401 and 'Unauthorized request' when no credentials are in the token`, () => {
                return supertest(app)
                    .post(`/api/products`)
                    .set('Authorization', makeAuthHeader(userNoCreds))
                    .send(productPost)
                    .expect(401, { error: 'Unauthorized request' })
            })

            it(`responds with 201 when credentials are in the token`, () => {
                return supertest(app)
                    .post(`/api/products`)
                    .set('Authorization', makeAuthHeader(user))
                    .send(productPost)
                    .expect(201)
            })

            it(`responds with 401 and 'Unauthorized request' when the JWT secret is invalid`, () => {
                return supertest(app)
                    .post(`/api/products`)
                    .set('Authorization', makeAuthHeader(validUser, invalidSecret))
                    .send(productPost)
                    .expect(401, { error: 'Unauthorized request' })
            })

            it(`responds with 401 and 'Unauthorized request' when the user is invalid`, () => {
                return supertest(app)
                    .post('/api/products')
                    .set('Authorization', makeAuthHeader(invalidUser))
                    .send(productPost)
                    .expect(401, { error: 'Unauthorized request' })
            })
        })

        describe('PATCH /api/products/:product_id', () => {
            beforeEach(insertProductArray)

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
                cmt_sew_country: 1,
                cmt_cut_country: 1,
                cmt_notes: '100 employees',
                featured: false,
                approved_by_admin: true
            }

            it(`responds with 401 'Missing bearer token' when no bearer token is provided`, () => {
                return supertest(app)
                    .patch('/api/products/1')
                    .send({ english_name: newProduct.english_name})
                    .expect(401, { error: 'Missing bearer token'})
            })

            it(`responds with 401 and 'Unauthorized request' when no credentials are in the token`, () => {
                const userNoCreds = { email: '', password: '' }

                return supertest(app)
                    .patch('/api/products/1')
                    .set('Authorization', makeAuthHeader(userNoCreds))
                    .send({ english_name: newProduct.english_name })
                    .expect(401, { error: 'Unauthorized request' })
            })

            it(`responds with 401 and 'Unauthorized request' when the JWT secret is invalid`, () => {
                const invalidUserCreds =  { email: 'not-a-user', password: 'incorrect-password' }
                
                return supertest(app)
                    .patch(`/api/products/1`)
                    .set('Authorization', makeAuthHeader(invalidUserCreds))
                    .send({ english_name: newProduct.english_name })
                    .expect(401, { error: 'Unauthorized request' })
            })

            it(`responds with 401 and 'Unauthorized request' when the password is wrong`, () => {
                const incorrectPassword = { email: user.email, password: 'wrong' }

                return supertest(app)
                    .patch('/api/products/1')
                    .set('Authorization', makeAuthHeader(incorrectPassword))
                    .send({ english_name: newProduct.english_name })
                    .expect(401, { error: 'Unauthorized request' })
            })
        })

        describe('DELETE /api/products/:product_id', () => {
            beforeEach(insertProductArray)
            const productId = productInsert.id
            
            it(`responds with 401 'Missing bearer token' when no bearer token is provided`, () => {
                return supertest(app)
                    .delete(`/api/products/${productId}`)
                    .expect(401, { error: 'Missing bearer token'})
            })

            it(`responds with 401 and 'Unauthorized request' when no credentials are in the token`, () => {
                const userNoCreds = { email: '', password: '' }
                return supertest(app)
                    .delete(`/api/products/${productId}`)
                    .set('Authorization', makeAuthHeader(userNoCreds))
                    .expect(401, { error: 'Unauthorized request' })
            })

            it(`responds with 401 and 'Unauthorized request' when the JWT secret is invalid`, () => {
                const invalidUserCreds =  { email: 'not-a-user', password: 'incorrect-password' }
                
                return supertest(app)
                    .delete(`/api/products/${productId}`)
                    .set('Authorization', makeAuthHeader(invalidUserCreds))
                    .expect(401, { error: 'Unauthorized request' })
            })

            it(`responds with 401 and 'Unauthorized request' when the password is wrong`, () => {
                const incorrectPassword = { email: user.email, password: 'wrong' }

                return supertest(app)
                    .delete(`/api/products/${productId}`)
                    .set('Authorization', makeAuthHeader(incorrectPassword))
                    .expect(401, { error: 'Unauthorized request' })
            })
        })
    })

    describe('POST /api/products', () => {
        beforeEach(insertProdReqs)
        
        it('creates a product, responding with 201 and the new product', async () => {
            const postResponse = await supertest(app)
                .post('/api/products')
                .set('Authorization', makeAuthHeader(user))
                .send(productPost)
                
            const getResponse = await supertest(app)
                .get('/api/products')

            const expected = new Date().toLocaleString()
            const postCreated = new Date(postResponse.body.created_at).toLocaleString()
            const postUpdated = new Date(postResponse.body.updated_at).toLocaleString()

            const expectedPostBody = {
                id: postResponse.body.id,
                ...productPost,
                featured: false,
                approved_by_admin: false,
                created_at: postResponse.body.created_at,
                updated_at: postResponse.body.updated_at
            }

            const expectedGetBody = [
                {
                    ...expectedPostBody,
                    brand_currency: brandInsert.home_currency,
                    brand_name: brandInsert.english_name
                }
            ]

            expect(postResponse.status).to.eql(201)
            expect(postResponse.headers.location).to.eql(`/api/products/${postResponse.body.id}`)
            expect(postResponse.body.approved_by_admin).to.eql(false)
            expect(postResponse.body).to.eql(expectedPostBody)
            expect(postCreated).to.eql(expected)
            expect(postUpdated).to.eql(expected)
            expect(getResponse.status).to.eql(200)
            expect(getResponse.body).to.eql(expectedGetBody)
        })

        const requiredFields = [
            'english_name',
            'brand_id',
            'category_id',
            'product_url',
            'feature_image_url',
            'cost_in_home_currency',
            'wash_id',
            'dry_id'
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
                cmt_sew_country: 1,
                cmt_cut_country: 1,
                cmt_country: 'US',
                cmt_factory_notes: '100 employees',
                approved_by_admin: true
            }

            it(`responds with 400 and an error message when the '${field}' is missing`, () => {
                delete newProduct[field]

                return supertest(app)
                    .post('/api/products')
                    .set('Authorization', makeAuthHeader(user))
                    .send(newProduct)
                    .expect(400, {
                        error: { message: `Missing '${field}' in request body`}
                    })
            })
        })

        context('given a malicious product', () => {
            it('removes the attack content from the response', async () => {
                const postResponse = await supertest(app)
                    .post('/api/products')
                    .set('Authorization', makeAuthHeader(user))
                    .send(malProdPost)
                    
                const getResponse = await supertest(app)
                    .get('/api/products')

                const expected = new Date().toLocaleString()
                const postCreated = new Date(postResponse.body.created_at).toLocaleString()
                const postUpdated = new Date(postResponse.body.updated_at).toLocaleString()

                const expectedPostBody = {
                    id: postResponse.body.id,
                    ...malProdPost,
                    english_name: malProdGet.english_name,
                    product_url: malProdGet.product_url,
                    cmt_notes: malProdGet.cmt_notes,
                    feature_image_url: malProdGet.feature_image_url,
                    created_at: postResponse.body.created_at,
                    updated_at: postResponse.body.updated_at
                }

                const expectedGetBody = [
                    {
                        ...malProdGet,
                        created_at: expectedPostBody.created_at,
                        updated_at: expectedPostBody.updated_at
                    }
                ]


                expect(postResponse.status).to.eql(201)
                expect(postResponse.headers.location).to.eql(`/api/products/${postResponse.body.id}`)
                expect(postResponse.body).to.eql(expectedPostBody)
                expect(postCreated).to.eql(expected)
                expect(postUpdated).to.eql(expected)
                expect(getResponse.status).to.eql(200)
                expect(getResponse.body).to.eql(expectedGetBody)
            })
        })
    })

    // describe('POST /api/products/product-form', () => {
    //     beforeEach(() =>  db.into('brands').insert(brandInsert))
    //     beforeEach(() =>  db.into('categories').insert(categoriesInsert))
    //     beforeEach(() =>  db.into('dry_instructions').insert(dryInstructions))
    //     beforeEach(() =>  db.into('factories').insert(factoryInsert))
    //     beforeEach(() =>  db.into('wash_instructions').insert(washInstructions))
    //     beforeEach(() =>  db.into('users').insert(hashUserArray))
    //     beforeEach(() =>  db.into('certifications').insert(certArrayInsert))
    //     beforeEach(() =>  db.into('fiber_and_material_types').insert(ftInsert))
    //     beforeEach(() =>  db.into('notion_types').insert(ntInsert))
    //     beforeEach(() =>  db.into('sizes').insert(sizeInsert))

    //     it('creates a product from the product form, responding with 201 and the new product', () => {
    //         const newProduct = {
    //             english_name: 'Yellow Shirt',
    //             brand_id: 1,
    //             category_id: 1,
    //             product_url: 'https://canopyandunderstory.com',
    //             feature_image_url: "http://test-url-feature-image.com",
    //             multiple_color_options: true,
    //             cost_in_home_currency: 60,
    //             wash_id: 1,
    //             dry_id: 1,
    //             cmt_cut_country: 1,
    //             cmt_sew_country: 1,
    //             cmt_notes: '100 employees',
    //             featured: false,
    //             color_fieldsets: [
    //                 {
    //                     name: 'Daffodil',
    //                     descriptionId: 4,
    //                     swatchUrl: 'www.swatch-1.com',
    //                     imageUrls: ['image-1.com', 'image-2.com']
    //                 },
    //                 {
    //                     name: 'Sky',
    //                     descriptionId: 5,
    //                     swatchUrl: 'www.swatch-2.com',
    //                     imageUrls: ['image-3.com', 'image-4.com']
    //                 }
    //             ],
    //             sew_fact: {
    //                 countryId: 1,
    //                 factoryId: 1
    //             },
    //             cut_fact: {
    //                 countryId: 1,
    //                 factoryId: 1
    //             },
    //             man_cert_checks: [1],

    //             selected_sizes: [1],
    //             fabrics: [
    //                 {
    //                     certs: [1],
    //                     fabric_details: {
    //                         dyeFinCountryId: 1,
    //                         dyeFinId: 1,
    //                         dyeFinNotes: 'Notes',
    //                         wovKnitCountryId: 1,
    //                         wovKnitId: 1,
    //                         wovKnitNotes: 'Notes'
    //                     },
    //                     fiber_array: [
    //                         {
    //                             id: 3,
    //                             fiberTypeId: 1,
    //                             percentage: 100,
    //                             originId: 1,
    //                             producerId: 1,
    //                             producerNotes: 'Notes',
    //                             certIds: [1]
    //                         }
    //                     ],
    //                     relationship: 'primary'
    //                 }
    //             ],
    //             notions: [
    //                 {
    //                     typeId: 1,
    //                     countryId: 1,
    //                     factoryId: 1,
    //                     notes: null,
    //                     materialTypeId: 1,
    //                     materialOriginId: 1,
    //                     materialProducerId: 1,
    //                     certIds: [1]
    //                 }
    //             ],
    //             approved_by_admin: true
    //         }

    //         return supertest(app)
    //             .post('/api/products/product-form')
    //             .set('Authorization', makeAuthHeader(user))
    //             .send(newProduct)
    //             .expect(201)
    //             .catch(error => {
    //                 console.log(error)
    //             })
    //             .then(res => {
    //                 expect(res.body.english_name).to.eql(newProduct.english_name)
    //                 expect(res.body.brand_id).to.eql(newProduct.brand_id)
    //                 expect(res.body.category_id).to.eql(newProduct.category_id)
    //                 expect(res.body.product_url).to.eql(newProduct.product_url)
    //                 expect(res.body.feature_image_url).to.eql(newProduct.feature_image_url)
    //                 expect(res.body.multiple_color_options).to.eql(newProduct.multiple_color_options)
    //                 expect(res.body.wash_id).to.eql(newProduct.wash_id)
    //                 expect(res.body.dry_id).to.eql(newProduct.dry_id)
    //                 expect(res.body.cost_in_home_currency).to.eql(newProduct.cost_in_home_currency)
    //                 expect(res.body.cmt_cut_country).to.eql(newProduct.cmt_cut_country)
    //                 expect(res.body.cmt_sew_country).to.eql(newProduct.cmt_sew_country)
    //                 expect(res.body.cmt_notes).to.eql(newProduct.cmt_notes)
    //                 expect(res.body.featured).to.eql(newProduct.featured)
    //                 expect(res.body.approved_by_admin).to.eql(newProduct.approved_by_admin)
    //                 expect(res.body).to.have.property('id')
    //                 expect(res.headers.location).to.have.eql(`/api/products/${res.body.id}`)
    //                 const expected = new Date().toLocaleString()
    //                 const actual = new Date(res.body.created_at).toLocaleString()
    //                 expect(actual).to.eql(expected)
    //                 console.log('expected', expected)
    //                 console.log('actual', actual)

    //                 return res
    //             })
    //             .then(res => {
    //                 supertest(app)
    //                 .get(`/api/products/${res.body.id}`)
    //                 .catch(error => {
    //                     console.log(error)
    //                 })
                    
    //             })
                
    //     })

    //     it('creates a product color', () => {})

    //     it('creates a product image', () => {})

    //     it('creates a product-sewing-factory pair', () => {})

    //     it('creates a product-cutting-factory pair', () => {})

    //     it('creates a product-cmt-certification pair', () => {})

    //     it('creates a product-size pair', () => {})

    //     it('creates a new fabric', () => {})

    //     it('creates a product-size pair', () => {})





    //     const requiredFields = [
    //         'english_name',
    //         'brand_id',
    //         'category_id',
    //         'product_url',
    //         'feature_image_url',
    //         'multiple_color_options',
    //         'cost_in_home_currency',
    //         'wash_id',
    //         'dry_id',
    //     ]

    //     requiredFields.forEach(field => {
    //         const newProduct = {
    //             english_name: 'Yellow Shirt',
    //             brand_id: 1,
    //             category_id: 1,
    //             product_url: 'https://canopyandunderstory.com',
    //             feature_image_url: 'https://canopyandunderstory.com',
    //             multiple_color_options: false,
    //             home_currency: 'USD',
    //             cost_in_home_currency: 60,
    //             wash_id: 1,
    //             dry_id: 1,
    //             cmt_country: 'US',
    //             cmt_factory_notes: '100 employees',
    //             approved_by_admin: true
    //         }

    //         it(`responds with 400 and an error message when the '${field}' is missing`, () => {
    //             delete newProduct[field]

    //             return supertest(app)
    //                 .post('/api/products')
    //                 .set('Authorization', makeAuthHeader(user))
    //                 .send(newProduct)
    //                 .expect(400, {
    //                     error: { message: `Missing '${field}' in request body`}
    //                 })
    //         })
    //     })

    //     context('given a malicious product', () => {
    //         it(`removes the attack content from the response`, () => {
    //             return supertest(app)
    //                 .post('/api/products')
    //                 .set('Authorization', makeAuthHeader(user))
    //                 .send(malProdPost)
    //                 .expect(201)
    //                 .expect(res => {
    //                     expect(res.body.english_name).to.eql(malProdGet.english_name)
    //                     expect(res.body.product_url).to.eql(malProdGet.product_url)
    //                     expect(res.body.cmt_factory_notes).to.eql(malProdGet.cmt_factory_notes)
    //                 })
    //         })
    //     })
    // })

    describe('POST /api/products/:product_id/certifications', () => {
        beforeEach(insertProductArray)
        beforeEach(() =>  db.into('certifications').insert(certArrayInsert[0]))
        const productId = productInsert.id

        it('creates a product-certification pair, responding with 201 and the new product-certification pair', async () => {            
            const postResponse = await supertest(app)
                .post(`/api/products/${productId}/certifications`)
                .set('Authorization', makeAuthHeader(user))
                .send(prodCertPost)
                
            const getResponse = await supertest(app)
                .get(`/api/products/${productId}/certifications`)

            const expected = new Date().toLocaleString()
            const postCreated = new Date(postResponse.body.created_at).toLocaleString()
            const postUpdated = new Date(postResponse.body.updated_at).toLocaleString()

            const expectedPostBody = {
                ...prodCertPost,
                approved_by_admin: false,
                created_at: postResponse.body.created_at,
                updated_at: postResponse.body.updated_at
            }

            const expectedGetBody = [
                {
                    ...prodCertGet[0],
                    pair_approved_by_admin: false,
                    pair_created_at: postResponse.body.created_at,
                    pair_updated_at: postResponse.body.updated_at
                }
            ]

            expect(postResponse.status).to.eql(201)
            expect(postResponse.body.approved_by_admin).to.eql(false)
            expect(postResponse.body).to.eql(expectedPostBody)
            expect(postCreated).to.eql(expected)
            expect(postUpdated).to.eql(expected)
            expect(getResponse.status).to.eql(200)
            expect(getResponse.body).to.eql(expectedGetBody)
        })

        it(`responds with 400 and an error message when the 'certification_id' is missing`, () => {
            return supertest(app)
                .post(`/api/products/${productId}/certifications`)
                .set('Authorization', makeAuthHeader(user))
                .send({})
                .expect(400, { error: { message: `Missing 'certification_id' in request body`} })
        })
    })

    describe('POST /api/products/:product_id/colors', () => {
        beforeEach(insertProductArray)
        const productId = productInsert.id

        it('creates a color, responding with 201 and the new color', async () => {
            const postResponse = await supertest(app)
                .post(`/api/products/${productId}/colors`)
                .set('Authorization', makeAuthHeader(user))
                .send(colorPost)

            const getResponse = await supertest(app)
                .get(`/api/products/${productId}/colors`)

            const expected = new Date().toLocaleString()
            const postCreated = new Date(postResponse.body.created_at).toLocaleString()
            const postUpdated = new Date(postResponse.body.updated_at).toLocaleString()

            const expectedPostBody = {
                ...colorGet[0],
                approved_by_admin: false,
                created_at: postResponse.body.created_at,
                updated_at: postResponse.body.updated_at
            }

            const expectedGetBody = [
                expectedPostBody
            ]

            expect(postResponse.status).to.eql(201)
            expect(postResponse.body.approved_by_admin).to.eql(false)
            expect(postResponse.body).to.eql(expectedPostBody)
            expect(postCreated).to.eql(expected)
            expect(postUpdated).to.eql(expected)
            expect(getResponse.status).to.eql(200)
            expect(getResponse.body).to.eql(expectedGetBody)
        })

        const requiredFields = [
            'color_description_id',
            'color_english_name'
        ]
        
        requiredFields.forEach(field => {
            const color = {
                ...colorPost
            }

            delete color[field]

            it(`responds with 400 and an error message when the '${field}' is missing`, () => {
                return supertest(app)
                    .post(`/api/products/${productId}/colors`)
                    .set('Authorization', makeAuthHeader(user))
                    .send(color)
                    .expect(400, {
                        error: { message: `Missing '${field}' in request body`}
                    })
            })
        })

        context('given a malicious color', () => {
            it('removes the attack content from the response', async () => {
                const postResponse = await supertest(app)
                    .post(`/api/products/${productId}/colors`)
                    .set('Authorization', makeAuthHeader(user))
                    .send(malColorPost)
                    
                const getResponse = await supertest(app)
                    .get(`/api/products/${productId}/colors`)

                const expected = new Date().toLocaleString()
                const created = new Date(postResponse.body.created_at).toLocaleString()
                const updated = new Date(postResponse.body.updated_at).toLocaleString()
    
                const expectedPostBody = {
                    id: postResponse.body.id,
                    ...malColorPost,
                    color_english_name: malColorGet.color_english_name,
                    swatch_image_url: malColorGet.swatch_image_url,
                    created_at: postResponse.body.created_at,
                    updated_at: postResponse.body.updated_at
                }
    
                const expectedGet = [
                    {
                        ...malColorGet,
                        created_at: postResponse.body.created_at,
                        updated_at: postResponse.body.updated_at
                    }
                ]
                
                expect(postResponse.status).to.eql(201)
                expect(postResponse.body).to.eql(expectedPostBody)
                expect(created).to.eql(expected)
                expect(updated).to.eql(expected)
                expect(getResponse.status).to.eql(200)
                expect(getResponse.body).to.eql(expectedGet)
            })            
        })
    })

    describe('POST /api/products/:product_id/fabrics', () => {
        beforeEach(insertProductArray)
        beforeEach(() =>  db.into('fabrics').insert(fabricInsert))
        const productId = productInsert.id

        it('creates a product-fabric set, responding with 201 and the new product-fabric set', async () => {            
            const postResponse = await supertest(app)
                .post(`/api/products/${productId}/fabrics`)
                .set('Authorization', makeAuthHeader(user))
                .send(prodToFabPost)
                
            const getResponse = await supertest(app)
                .get(`/api/products/${productId}/fabrics`)

            const expected = new Date().toLocaleString()
            const postCreated = new Date(postResponse.body.created_at).toLocaleString()
            const postUpdated = new Date(postResponse.body.updated_at).toLocaleString()

            const expectedPostBody = {
                product_id: productId, 
                ...prodToFabPost,
                relationship: "primary",
                approved_by_admin: false,
                created_at: postResponse.body.created_at,
                updated_at: postResponse.body.updated_at
            }

            const expectedGetBody = [
                {
                    ...prodFact()[0],
                    pair_approved_by_admin: expectedPostBody.approved_by_admin,
                    pair_created_at: expectedPostBody.created_at,
                    pair_updated_at: expectedPostBody.updated_at
                }    
            ]

            expect(postResponse.status).to.eql(201)
            expect(postResponse.body.approved_by_admin).to.eql(false)
            expect(postResponse.body).to.eql(expectedPostBody)
            expect(postCreated).to.eql(expected)
            expect(postUpdated).to.eql(expected)
            expect(getResponse.status).to.eql(200)
            expect(getResponse.body).to.eql(expectedGetBody)
        })

        it(`responds with 400 and an error message when the 'fabric_id' is missing`, () => {
            return supertest(app)
                .post(`/api/products/${productId}/fabrics`)
                .set('Authorization', makeAuthHeader(user))
                .send({})
                .expect(400, {
                    error: { message: `Missing 'fabric_id' in request body`}
                })
        })
    })

    describe('POST /api/products/:product_id/factories', () => {
        beforeEach(insertProductArray)
        const productId = productInsert.id

        it('creates a product-factory set, responding with 201 and the new product-factory set', async () => {
            const postResponse = await supertest(app)
                .post(`/api/products/${productId}/factories`)
                .set('Authorization', makeAuthHeader(user))
                .send(prodToFactPost)
                
            const getResponse = await supertest(app)
                .get(`/api/products/${productId}/factories`)

            const expected = new Date().toLocaleString()
            const postCreated = new Date(postResponse.body.created_at).toLocaleString()
            const postUpdated = new Date(postResponse.body.updated_at).toLocaleString()

            const expectedPostBody = {
                ...prodToFactPost,
                approved_by_admin: false,
                created_at: postResponse.body.created_at,
                updated_at: postResponse.body.updated_at
            }

            const expectedGetBody = [
                {
                    ...prodFactGet[0],
                    pair_approved_by_admin: expectedPostBody.approved_by_admin,
                    pair_created_at: expectedPostBody.created_at,
                    pair_updated_at: expectedPostBody.updated_at
                }    
            ]

            expect(postResponse.status).to.eql(201)
            expect(postResponse.body.approved_by_admin).to.eql(false)
            expect(postResponse.body).to.eql(expectedPostBody)
            expect(postCreated).to.eql(expected)
            expect(postUpdated).to.eql(expected)
            expect(getResponse.status).to.eql(200)
            expect(getResponse.body).to.eql(expectedGetBody)
        })

        it(`responds with 400 and an error message when the 'factory_id' is missing`, () => {
            return supertest(app)
                .post(`/api/products/${productId}/factories`)
                .set('Authorization', makeAuthHeader(user))
                .send({})
                .expect(400, {
                    error: { message: `Missing 'factory_id' in request body`}
                })  
        })
    })

    describe('POST /api/products/:product_id/fibers', () => {
        beforeEach(insertProductArray)
        beforeEach(() =>  db.into('fiber_and_material_types').insert(ftInsert))
        beforeEach(() =>  db.into('fibers_and_materials').insert(fiberInsert))
        const productId = productInsert.id

        it('creates a product-fiber pair, responding with 201 and the new product-fiber pair', async () => {
            const postResponse = await supertest(app)
                .post(`/api/products/${productId}/fibers`)
                .set('Authorization', makeAuthHeader(user))
                .send(prodFibPost)
                
            const getResponse = await supertest(app)
                .get(`/api/products/${productId}/fibers`)

            const expected = new Date().toLocaleString()
            const postCreated = new Date(postResponse.body.created_at).toLocaleString()
            const postUpdated = new Date(postResponse.body.updated_at).toLocaleString()

            const expectedPostBody = {
                product_id: productId,
                ...prodFibInsert,
                approved_by_admin: false,
                created_at: postResponse.body.created_at,
                updated_at: postResponse.body.updated_at
            }

            const expectedGetBody = [
                {
                    ...prodFibGet[0],
                    pair_approved_by_admin: expectedPostBody.approved_by_admin,
                    pair_created_at: expectedPostBody.created_at,
                    pair_updated_at: expectedPostBody.updated_at
                }    
            ]

            expect(postResponse.status).to.eql(201)
            expect(postResponse.body.approved_by_admin).to.eql(false)
            expect(postResponse.body).to.eql(expectedPostBody)
            expect(postCreated).to.eql(expected)
            expect(postUpdated).to.eql(expected)
            expect(getResponse.status).to.eql(200)
            expect(getResponse.body).to.eql(expectedGetBody)
        })

        it(`responds with 400 and an error message when the 'fiber_or_material_id' is missing`, () => {
            return supertest(app)
                .post(`/api/products/${productId}/fibers`)
                .set('Authorization', makeAuthHeader(user))
                .send({})
                .expect(400, {
                    error: { message: `Missing 'fiber_or_material_id' in request body`}
            })  
        })
    })

    describe('POST /api/products/:product_id/images', () => {
        beforeEach(insertProductArray)
        beforeEach(() => db.into('product_colors').insert(colorInsert))
        const productId = productInsert.id

        it('creates a product-image pair, responding with 201 and the new product-image pair', async () => {
            const postResponse = await supertest(app)
                .post(`/api/products/${productId}/images`)
                .set('Authorization', makeAuthHeader(user))
                .send(imagePost)
                
            const getResponse = await supertest(app)
                .get(`/api/products/${productId}/images`)

            const expected = new Date().toLocaleString()
            const postCreated = new Date(postResponse.body.created_at).toLocaleString()
            const postUpdated = new Date(postResponse.body.updated_at).toLocaleString()

            const expectedPostBody = {
                product_id: productId,
                ...imageInsert,
                approved_by_admin: false,
                created_at: postResponse.body.created_at,
                updated_at: postResponse.body.updated_at
            }

            const expectedGetBody = [
                {
                    ...expectedPostBody
                }   
            ]

            expect(postResponse.status).to.eql(201)
            expect(postResponse.body.approved_by_admin).to.eql(false)
            expect(postResponse.body).to.eql(expectedPostBody)
            expect(postCreated).to.eql(expected)
            expect(postUpdated).to.eql(expected)
            expect(getResponse.status).to.eql(200)
            expect(getResponse.body).to.eql(expectedGetBody)
        })

        const requiredFields = [
            "product_image_url",
            "color_id",
            "primary_image_for_color"
        ]

        requiredFields.forEach(field => {
            const image = {
                ...imagePost
            }

            delete image[field]

            it(`responds with 400 and an error message when '${field}' is missing`, () => {
                return supertest(app)
                    .post(`/api/products/${productId}/images`)
                    .set('Authorization', makeAuthHeader(user))
                    .send(image)
                    .expect(400, {
                        error: { message: `Missing '${field}' in request body`}
                })  
            })
        })
    })

    describe('POST /api/products/:product_id/notions', () => {
        beforeEach(insertProductArray)
        beforeEach(() =>  db.into('fiber_and_material_types').insert(ftInsert))
        beforeEach(() =>  db.into('fibers_and_materials').insert(fiberInsert))
        beforeEach(() =>  db.into('notion_types').insert(ntInsert))
        beforeEach(() =>  db.into('notions').insert(notionInsert))
        beforeEach(() => db.into('certifications').insert(certArrayInsert))
        beforeEach(() =>  db.into('notions_to_certifications').insert(makeNotsToCerts()))
        const productId = productInsert.id

        it('creates a product-notion pair, responding with 201 and the new product-notion pair', async () => {
            const postResponse = await supertest(app)
                .post(`/api/products/${productId}/notions`)
                .set('Authorization', makeAuthHeader(user))
                .send(prodNotPost)
                
            const getResponse = await supertest(app)
                .get(`/api/products/${productId}/notions`)

            const expected = new Date().toLocaleString()
            const postCreated = new Date(postResponse.body.created_at).toLocaleString()
            const postUpdated = new Date(postResponse.body.updated_at).toLocaleString()

            const expectedPostBody = {
                product_id: productId,
                ...prodNotPost,
                approved_by_admin: false,
                created_at: postResponse.body.created_at,
                updated_at: postResponse.body.updated_at
            }

            const expectedGetBody = [
                {
                    ...prodNotGet()[0],
                    pair_approved_by_admin: expectedPostBody.approved_by_admin,
                    pair_created_at: expectedPostBody.created_at,
                    pair_updated_at: expectedPostBody.updated_at
                }   
            ]

            expect(postResponse.status).to.eql(201)
            expect(postResponse.body.approved_by_admin).to.eql(false)
            expect(postResponse.body).to.eql(expectedPostBody)
            expect(postCreated).to.eql(expected)
            expect(postUpdated).to.eql(expected)
            expect(getResponse.status).to.eql(200)
            expect(getResponse.body).to.eql(expectedGetBody)
        })

        const requiredFields = [ "notion_id" ]

        requiredFields.forEach(field => {
            const notion = {
                ...prodNotPost
            }

            delete notion[field]

            it(`responds with 400 and an error message when '${field}' is missing`, () => {
                return supertest(app)
                    .post(`/api/products/${productId}/notions`)
                    .set('Authorization', makeAuthHeader(user))
                    .send(notion)
                    .expect(400, {
                        error: { message: `Missing '${field}' in request body`}
                })  
            })
        })
    })

    describe('POST /api/products/:product_id/sizes', () => {
        beforeEach(insertProductArray)
        beforeEach(() =>  db.into('sizes').insert(sizeInsert))
        const productId = productInsert.id

        it('creates a product-size pair, responding with 201 and the new product-size pair', async () => {
            const postResponse = await supertest(app)
                .post(`/api/products/${productId}/sizes`)
                .set('Authorization', makeAuthHeader(user))
                .send(prodSizePost)
                
            const getResponse = await supertest(app)
                .get(`/api/products/${productId}/sizes`)
            
            const expected = new Date().toLocaleString()
            const postCreated = new Date(postResponse.body.created_at).toLocaleString()
            const postUpdated = new Date(postResponse.body.updated_at).toLocaleString()
    
            const expectedPostBody = {
                size_id: prodSizePost.size_id,
                product_id: productId,
                approved_by_admin: false,
                created_at: postResponse.body.created_at,
                updated_at: postResponse.body.updated_at
            }
            
            const expectedGetBody = [
                {
                    ...prodSizeGet[0],
                    pair_approved_by_admin: expectedPostBody.approved_by_admin,
                    pair_created_at: expectedPostBody.created_at,
                    pair_updated_at: expectedPostBody.updated_at
                }
            ]

            expect(postResponse.status).to.eql(201)
            expect(postResponse.body.approved_by_admin).to.eql(false)
            expect(postResponse.body).to.eql(expectedPostBody)
            expect(postCreated).to.eql(expected)
            expect(postUpdated).to.eql(expected)
            expect(getResponse.status).to.eql(200)
            expect(getResponse.body).to.eql(expectedGetBody)
        })
        
        it(`responds with 400 and an error message when the 'size_id' is missing`, () => {
            return supertest(app)
                .post(`/api/products/${productId}/sizes`)
                .set('Authorization', makeAuthHeader(user))
                .send({})
                .expect(400, {
                    error: { message: `Missing 'size_id' in request body`}
                }) 
        })
    })

    describe('PATCH /api/products/:product_id', () => {
        beforeEach(() => db.into('users').insert(hashAdminArray))

        context('given the product with id product_id exists', () => {
            beforeEach(insertProductArray)
            const productId = productInsert.id

            it('responds with 204 and updates the product', async function () {
                this.retries(3)

                const patchResponse = await supertest(app)
                    .patch(`/api/products/${productId}`)
                    .set('Authorization', makeAuthHeader(admin))
                    .send(prodFullUpdate)

                const getResponse = await supertest(app)
                    .get(`/api/products/${productId}`)
                
                const created = new Date(getResponse.body.created_at).toLocaleString()
                const updated = new Date(getResponse.body.updated_at).toLocaleString()
                const expectedCreated = new Date(notionInsert.created_at).toLocaleString()
                const expectedUpdated = new Date().toLocaleString()

                const expectedProduct = {
                    productObject: {
                        ...prodExtGet[productId - 1].productObject,
                        ...prodFullUpdate,
                        updated_at: expectedUpdated
                    },
                    prodCertArray: prodExtGet[productId - 1].prodCertArray,
                    prodColorArray: prodExtGet[productId - 1].prodColorArray,
                    cmtFactArray: prodExtGet[productId - 1].cmtFactArray,
                    prodNotArray: prodExtGet[productId - 1].prodNotArray,
                    notCertArray: prodExtGet[productId - 1].notCertArray
                }

                expect(patchResponse.status).to.eql(204)
                expect(getResponse.status).to.eql(200)
                expect(getResponse.body).to.eql(expectedProduct)      
                expect(created).to.eql(expectedCreated)
                expect(updated).to.eql(expectedUpdated)
            })

            it('responds with 400 when no required fields are supplied', () => {
                return supertest(app)
                    .patch(`/api/products/${productId}`)
                    .set('Authorization', makeAuthHeader(admin))
                    .send({})
                    .expect(400, {
                        error: { message: `Request body must contain 'english_name', 'brand_id', 'category_id', 'product_url', 'feature_image_url', 'multiple_color_options', 'cost_in_home_currency', 'wash_id', 'dry_id', 'cmt_sew_country', 'cmt_cut_country', 'cmt_notes', 'featured', or 'approved_by_admin'`}
                    })
            })

            it(`responds with 204 when updating only a subset of fields`, async function () {
                this.retries(3)

                const patchResponse = await supertest(app)
                    .patch(`/api/products/${productId}`)
                    .set('Authorization', makeAuthHeader(admin))
                    .send(prodSubsetUpdate)

                const getResponse = await supertest(app)
                    .get(`/api/products/${productId}`)
                
                const created = new Date(getResponse.body.created_at).toLocaleString()
                const updated = new Date(getResponse.body.updated_at).toLocaleString()
                const expectedCreated = new Date(productInsert.created_at).toLocaleString()
                const expectedUpdated = new Date().toLocaleString()

                const expectedProduct = {
                    productObject: {
                        ...prodExtGet[productId - 1].productObject,
                        ...prodSubsetUpdate,
                        updated_at: expectedUpdated
                    },
                    prodCertArray: prodExtGet[productId - 1].prodCertArray,
                    prodColorArray: prodExtGet[productId - 1].prodColorArray,
                    cmtFactArray: prodExtGet[productId - 1].cmtFactArray,
                    prodNotArray: prodExtGet[productId - 1].prodNotArray,
                    notCertArray: prodExtGet[productId - 1].notCertArray
                }

                expect(patchResponse.status).to.eql(204)
                expect(getResponse.status).to.eql(200)
                expect(getResponse.body).to.eql(expectedProduct)      
                expect(created).to.eql(expectedCreated)
                expect(updated).to.eql(expectedUpdated)
            })
        })    
        
        context('when the product with id product_id does not exist', () => {
            it('responds with 404 and an error message', () => {
                const nonexistantId = productId + 1
                return supertest(app)
                    .patch(`/api/products/${nonexistantId}`)
                    .set('Authorization', makeAuthHeader(admin))
                    .expect(404, { error: { message: `Product does not exist.`}})
            })
        })
    })

    describe('DELETE /api/products/:product_id', () => {
        beforeEach(() => db.into('users').insert(hashAdminArray))
        const productId = productInsert.id

        context('given the product with id product_id exists', () => {
            beforeEach(insertProductArray)

            it('responds with 204 and removes the product', async () => {
                const deleteResponse = await supertest(app)
                    .delete(`/api/products/${productId}`)
                    .set('Authorization', makeAuthHeader(admin))
                    
                const getResponse = await supertest(app)
                    .get(`/api/products/${productId}`)

                expect(deleteResponse.status).to.eql(204)
                expect(getResponse.status).to.eql(404)
            })
        })

        context('when the product with id product_id does not exist', () => {
            it("responds with 404 and an error message", () => {
                const nonexistantId = productId + 1
                return supertest(app)
                    .delete(`/api/products/${nonexistantId}`)
                    .set('Authorization', makeAuthHeader(admin))
                    .expect(404, { error: { message: "Product does not exist." } })
            })
        })
    })
})