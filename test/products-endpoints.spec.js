const knex = require('knex')
const app = require('../src/app')

const { makeCertificationsArray } = require('./certifications.fixtures')

const { makeBrandsArray, makeMaliciousBrand, makeFiberArrayGet, makeFiberArrayPost, makeFiberTypesArray, 
    makeNotionsArrayGet, makeNotionsArrayPost, makeNotionType, makeMaliciousNotion, makeMaliciousNotionType 
} = require('./brands.fixtures')

const { makeMaliciousCertification, makeFabricTypesArray, makeFabricsArray, 
    makeMaliciousFabricType, makeMaliciousFabric, makeMaliciousFiber, makeMaliciousFiberType 
} = require('./fabrics.fixtures')

const { makeFactoriesArray, makeMaliciousFactory } = require('./factories.fixtures')

const { makeCategory, makeDry, makeImage, makeNotionsToMaterials, makeMaterials, makeMaterialTypes,
    makeProductsArray, makeProductsArrayWithBrand, makeProductToCertificationArray, makeProductToFactoriesArray,
    makeProductToFiberArray,makeProductToNotions, makeSize, makeSizeClass, makeSizeType, makeSizeToProduct,
    makeWash, makeMaliciousImage, makeMaliciousProduct, makeMaliciousSize, makeMaliciousSizeClass, makeMaliciousSizeType
} = require('./products.fixtures')

const supertest = require('supertest')
const { expect } = require('chai')

describe('Products Endpoints', () => {
    let db

    const { maliciousBrand, expectedBrand } = makeMaliciousBrand()

    const certifications = makeCertificationsArray()
    const { maliciousCertification, expectedCertification } = makeMaliciousCertification()
    const productsToCertifications = makeProductToCertificationArray()

    const fabricTypes = makeFabricTypesArray()
    const { maliciousFabricType, expectedFabricType } = makeMaliciousFabricType()

    const fabrics = makeFabricsArray()
    const { maliciousFabric, expectedFabric } = makeMaliciousFabric()

    const factories = makeFactoriesArray()
    const { maliciousFactory, expectedFactory } = makeMaliciousFactory()
    const productsToFactories = makeProductToFactoriesArray()

    const fiberTypes = makeFiberTypesArray()
    const { maliciousFiberType, expectedFiberType } = makeMaliciousFiberType()

    const fibers = makeFiberArrayPost()
    const getFibers = makeFiberArrayGet()
    const { maliciousFiber, expectedFiber } = makeMaliciousFiber()
    const productsToFibers = makeProductToFiberArray()

    const image=makeImage()
    const { maliciousImage, expectedImage } = makeMaliciousImage()

    const notionType = makeNotionType()
    const { maliciousNotionType, expectedNotionType} = makeMaliciousNotionType()

    const notions=makeNotionsArrayPost()
    const getNotions = makeNotionsArrayGet()
    const { maliciousNotion, expectedNotion } = makeMaliciousNotion()
    const productsToNotions = makeProductToNotions()
    const notionsToMaterials = makeNotionsToMaterials()
    const materials = makeMaterials()
    const materialTypes = makeMaterialTypes()

    const size = makeSize()
    const sizeClass = makeSizeClass()
    const sizeType = makeSizeType()
    const sizeToProduct = makeSizeToProduct()
    const { maliciousSize, expectedSize } = makeMaliciousSize()
    const { maliciousSizeClass, expectedSizeClass } = makeMaliciousSizeClass()
    const { maliciousSizeType, expectedSizeType } = makeMaliciousSizeType()

    function insertFixtures(
        products=makeProductsArray(),
        brands=makeBrandsArray(),
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
        `TRUNCATE table products, brands, categories, certifications, dry_instructions, fabric_types, fabrics, 
        factories, fibers_and_materials, fiber_and_material_types, notion_types, notions, notions_to_products, 
        notions_to_fibers_and_materials, product_cmts_to_certifications, product_cmts_to_factories, 
        sizes, size_classes, size_types, sizes_to_products, wash_instructions RESTART IDENTITY CASCADE`
    );
  
    before('clean tables', cleanUpTables)
  
    afterEach('cleanup tables', cleanUpTables)

    describe('GET /api/products', () => {
        context('Given there are products in the database', () => {
            const testProducts = makeProductsArray()

            beforeEach(insertFixtures)

            it('GET /api/products responds with 200 and all of the products', () => {
                return supertest(app)
                    .get('/api/products')
                    .expect(200, testProducts)
            })
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
            beforeEach(insertFixtures)

            it('GET /api/products/:product_id responds with 200 and the specified product', () => {
                const productId = 2
                const productArray = makeProductsArray()
                const expectedProduct = productArray[productId - 1]

                return supertest(app)
                    .get(`/api/products/${productId}`)
                    .expect(200)
                    .expect(res => {
                        expect(res.body.id).to.eql(expectedProduct.id)
                        expect(res.body.english_name).to.eql(expectedProduct.english_name)
                        expect(res.body.brand_id).to.eql(expectedProduct.brand_id)
                        expect(res.body.category_id).to.eql(expectedProduct.category_id)
                        expect(res.body.product_url).to.eql(expectedProduct.product_url)
                        expect(res.body.feature_image_url).to.eql(expectedProduct.feature_image_url)
                        expect(res.body.multiple_color_options).to.eql(expectedProduct.multiple_color_options)
                        expect(res.body.cost_in_home_currency).to.eql(expectedProduct.cost_in_home_currency)
                        expect(res.body.wash_id).to.eql(expectedProduct.wash_id)
                        expect(res.body.dry_id).to.eql(expectedProduct.dry_id)
                        expect(res.body.cmt_country).to.eql(expectedProduct.cmt_country)
                        expect(res.body.cmt_factory_notes).to.eql(expectedProduct.cmt_factory_notes)
                        expect(res.body.approved_by_admin).to.eql(expectedProduct.approved_by_admin)
                        expect(res.body.date_published).to.eql(expectedProduct.date_published)
                    })
            })
        })

        context(`Given an XSS attack product`, () => {
            const { maliciousProduct, expectedProduct } = makeMaliciousProduct()

            beforeEach(() => insertFixtures([ maliciousProduct ]));

            it(`Removes XSS attack content`, () => {
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

    describe('GET /api/products/:product_id/certifications', () => {
        const productId = 1

        context('when there are certifications in the database', () => {
            beforeEach(insertFixtures)
            beforeEach(() => { return db.into('certifications').insert(certifications) })
            beforeEach(() => { return db.into('product_cmts_to_certifications').insert(productsToCertifications)})
            
            it('returns all the certifications', () => {
                return supertest(app)
                    .get(`/api/products/${productId}/certifications`)
                    .expect(200, certifications)
            })
        })

        context('when there are no certifications in the database', () => {
            beforeEach(insertFixtures)

            it('responds with 200 and an empty list', () => {
                return supertest(app)
                    .get(`/api/products/${productId}/certifications`)
                    .expect(200, [])
            })
        })

        context('given a malicious certification', () => {
            beforeEach(insertFixtures)
            beforeEach(() => { return db.into('certifications').insert( maliciousCertification) })

            const pTC = [{ product_id: productId, certification_id: maliciousCertification.id }]

            beforeEach(() => { return db.into('product_cmts_to_certifications').insert(pTC)})

            it('removes the attack content', () => {
                return supertest(app)
                    .get(`/api/products/${productId}/certifications`)
                    .expect(200, [ expectedCertification ])
            })
        })
    })

    describe('GET /api/products/:product_id/fabrics', () => {
        context('when there are fabrics in the database', () => {
            beforeEach(insertFixtures)
            beforeEach(() => { return db.into('fabric_types').insert(fabricTypes) })
            beforeEach(() => { return db.into('fabrics').insert(fabrics) })
        

            it('returns all the fabrics', () => {
                return supertest(app)
                    .get('/api/fabrics')
                    .expect(200)
                    .expect(res => {
                        expect(res.body.fabric_type_id).to.eql(fabrics.fabric_type_id)
                        expect(res.body.brand_id).to.eql(fabrics.brand_id)
                        expect(res.body.fabric_type).to.eql(fabricTypes.english_name)
                        expect(res.body.fabric_mill_country).to.eql(fabrics.fabric_mill_country)
                        expect(res.body.fabric_mill_notes).to.eql(fabrics.fabric_mill_notes)
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
            beforeEach(insertFixtures)
            beforeEach(() => { return db.into('fabric_types').insert(fabricTypes) })
            beforeEach(() => { return db.into('fabrics').insert(maliciousFabric) })

            it('removes the attack content', () => {
                return supertest(app)
                    .get('/api/fabrics')
                    .expect(200)
                    .expect(res => {
                        expect(res.body[0].english_name).to.eql(expectedFabric.english_name)
                        expect(res.body[0].website).to.eql(expectedFabric.website)
                    })
            })
        })
    })

    describe('GET /api/products/:product_id/factories', () => {
        beforeEach(insertFixtures)
        productId = 1

        context('when there are factories in the database', () => {
            beforeEach(() => { return db.into('factories').insert(factories) })
            beforeEach(() => { return db.into('product_cmts_to_factories').insert(productsToFactories) })

            it('returns all the factories', () => {
                return supertest(app)
                    .get(`/api/products/${productId}/factories`)
                    .expect(200)
                    .expect(res => {
                        expect(res.body[0].english_name).to.eql(factories[0].english_name)
                    })
            })
        })

        context('when there are no factories in the database', () => {
            it('responds with 200 and an empty list', () => {
                return supertest(app)
                    .get(`/api/products/${productId}/factories`)
                    .expect(200, [])
                })
        })

        context('given a malicious factory', () => {
            beforeEach(() => { return db.into('factories').insert(maliciousFactory) })

            const pTF = [{ product_id: productId, factory_id: maliciousFactory.id, stage: 'sew' }]

            beforeEach(() => { return db.into('product_cmts_to_factories').insert(pTF) })

            it('removes the attack content', () => {
                return supertest(app)
                    .get(`/api/products/${productId}/factories`)
                    .expect(200)
                    .expect(res => {
                        expect(res.body[0].id).to.eql(expectedFactory.id)
                        expect(res.body[0].english_name).to.eql(expectedFactory.english_name)
                        expect(res.body[0].country).to.eql(expectedFactory.country)
                        expect(res.body[0].website).to.eql(expectedFactory.website)
                        expect(res.body[0].notes).to.eql(expectedFactory.notes)
                        expect(res.body[0].approved_by_admin).to.eql(expectedFactory.approved_by_admin)
                        expect(res.body[0].date_published).to.eql(expectedFactory.date_published)
                    })
                    // , [ expectedFactory ]
            })
        })
    })

    describe('GET /api/products/:product_id/fibers', () => {
        beforeEach(insertFixtures)
        productId = 1

        context('when there are fibers in the database', () => {
            beforeEach(() => { return db.into('factories').insert(factories) })
            beforeEach(() => { return db.into('fiber_and_material_types').insert(fiberTypes) })
            beforeEach(() => { return db.into('fibers_and_materials').insert(fibers) })
            beforeEach(() => { return db.into('fibers_to_products').insert(productsToFibers) })

            it('returns all the fibers', () => {
                return supertest(app)
                    .get(`/api/products/${productId}/fibers`)
                    .expect(200, getFibers)
            })
        })

        context('when there are no fibers in the database', () => {
            it('responds with 200 and an empty list', () => {
            
            return supertest(app)
                .get(`/api/products/${productId}/fibers`)
                .expect(200, [])
            })
        })

        context('given a malicious fiber', () => {
            beforeEach(() => { return db.into('factories').insert(factories) })
            beforeEach(() => { return db.into('fiber_and_material_types').insert(fiberTypes) })
            beforeEach(() => { return db.into('fibers_and_materials').insert(fibers) })
            beforeEach(() => { return db.into('fibers_and_materials').insert(maliciousFiber) })

            const pTF = [{ product_id: productId, fiber_or_material_id: maliciousFiber.id }]

            beforeEach(() => { return db.into('fibers_to_products').insert(pTF) })

            it('removes the attack content', () => {
                return supertest(app)
                    .get(`/api/products/${productId}/fibers`)
                    .expect(200, [ expectedFiber ])
            })
        })
    })

    describe('GET /api/products/:product_id/images', () => {
        beforeEach(insertFixtures)

        context('when there are images in the database', () => {
            beforeEach(() => { return db.into('product_images').insert(image) })
            
            it('returns all the images', () => {
                return supertest(app)
                    .get(`/api/products/${productId}/images`)
                    .expect(200, [ image ])
            })
        })

        context('when there are no images in the database', () => {
            it('responds with 200 and an empty list', () => {
            
            return supertest(app)
                .get(`/api/products/${productId}/images`)
                .expect(200, [])
            })
        })

        context('given a malicious image', () => {
            beforeEach(() => { return db.into('product_images').insert(maliciousImage) })

            it('removes the attack content', () => {
                return supertest(app)
                    .get(`/api/products/${productId}/images`)
                    .expect(200, [ expectedImage ])
            })
        })
    })

    describe('GET /api/products/:product_id/notions', () => {
        beforeEach(insertFixtures)
        productId = 1

        context('when there are notions in the database', () => {
            beforeEach(() => { return db.into('factories').insert(factories)})
            beforeEach(() => { return db.into('notion_types').insert(notionType) })
            beforeEach(() => { return db.into('notions').insert(notions) })
            beforeEach(() => { return db.into('notions_to_products').insert(productsToNotions) })
            beforeEach(() => { return db.into('fiber_and_material_types').insert(materialTypes) })
            beforeEach(() => { return db.into('fibers_and_materials').insert(materials) })
            beforeEach(() => { return db.into('notions_to_fibers_and_materials').insert(notionsToMaterials) })
            
            it('returns all the notions', () => {
                return supertest(app)
                    .get(`/api/products/${productId}/notions`)
                    .expect(200)
                    .expect(res => {
                        expect(res.body[0].id).to.eql(notions[0].id)
                        expect(res.body[0].notion_type_id).to.eql(notions[0].notion_type_id)
                        expect(res.body[0].brand_id).to.eql(notions[0].brand_id)
                        expect(res.body[0].notion_type).to.eql(notionType[0].english_name)
                        expect(res.body[0].notion_factory_country).to.eql(notions[0].notion_factory_country)
                        expect(res.body[0].notion_factory_id).to.eql(notions[0].notion_factory_id)
                        expect(res.body[0].factory).to.eql(factories[0].english_name)
                        expect(res.body[0].notion_factory_country).to.eql(notions[0].notion_factory_country)
                        expect(res.body[0].notion_factory_id).to.eql(notions[0].notion_factory_id)
                        expect(res.body[0].factory).to.eql(factories[0].english_name)
                        expect(res.body[0].notion_factory_notes).to.eql(notions[0].notion_factory_notes)
                        expect(res.body[0].material_id).to.eql(materials.id)
                        expect(res.body[0].fiber_or_material_type_id).to.eql(materialTypes.id)
                        expect(res.body[0].material_id).to.eql(materialTypes.id)
                        expect(res.body[0].material).to.eql(materialTypes.english_name)
                    })
            })
        })

        context('when there are no notions in the database', () => {
            it('responds with 200 and an empty list', () => {
            
            return supertest(app)
                .get(`/api/products/${productId}/notions`)
                .expect(200, [])
            })
        })

        context('given a malicious notion', () => {
            beforeEach(() => { return db.into('factories').insert(factories)})
            beforeEach(() => { return db.into('notion_types').insert(notionType) })
            beforeEach(() => { return db.into('notions').insert(maliciousNotion) })
            beforeEach(() => { return db.into('fiber_and_material_types').insert(materialTypes) })
            beforeEach(() => { return db.into('fibers_and_materials').insert(materials) })

            const nTFM = { notion_id: maliciousNotion.id, fiber_or_material_id: productId }

            beforeEach(() => { return db.into('notions_to_fibers_and_materials').insert(nTFM) })

            const pTN = { product_id: productId, notion_id: maliciousNotion.id }

            beforeEach(() => { return db.into('notions_to_products').insert(pTN) })

            it('removes the attack content', () => {
                return supertest(app)
                    .get(`/api/products/${productId}/notions`)
                    .expect(200)
                    .expect(res => {
                        expect(res.body[0].notion_type).to.eql(notionType[0].english_name)
                        expect(res.body[0].factory).to.eql(factories[0].english_name)
                        expect(res.body[0].notion_factory_notes).to.eql(expectedNotion.notion_factory_notes)
                        expect(res.body[0].material).to.eql(materialTypes.english_name)
                        expect(res.body[0].material_producer).to.eql(expectedNotion.material_producer)
                    })
            })
        })            
    })

    describe('GET /api/products/:product_id/sizes', () => {
        beforeEach(insertFixtures)

        const productId = 1

        context('when there are sizes in the database', () => {
            beforeEach(() => { return db.into('size_classes').insert([ sizeClass ]) })
            beforeEach(() => { return db.into('size_types').insert([ sizeType ]) })
            beforeEach(() => { return db.into('sizes').insert([ size ])})
            beforeEach(() => { return db.into('sizes_to_products').insert([ sizeToProduct ]) })
            
            it('returns all the sizes', () => {
                return supertest(app)
                    .get(`/api/products/${productId}/sizes`)
                    .expect(200)
                    .expect(res => {
                        expect(res.body[0].id).to.eql(size.id)
                        expect(res.body[0].size_type_id).to.eql(size.size_type_id)
                        expect(res.body[0].size_type).to.eql(sizeType.english_name)
                        expect(res.body[0].size_class_id).to.eql(size.size_class_id)
                        expect(res.body[0].size_class).to.eql(sizeClass.english_name)
                        expect(res.body[0].us_size).to.eql(size.us_size)
                    })
            })
        })

        context('when there are no sizes in the database', () => {
            beforeEach(() => { return db.into('size_classes').insert([ sizeClass ]) })
            beforeEach(() => { return db.into('size_types').insert([ sizeType ]) })
            beforeEach(() => { return db.into('sizes').insert([ size ])})
            beforeEach(() => { return db.into('sizes_to_products').insert() })

            
            it('responds with 200 and an empty list', () => {
                return supertest(app)
                    .get(`/api/products/${productId}/sizes`)
                    .expect(200, [])
                })
            })

        context('given a malicious size', () => {
            beforeEach(() => { return db.into('size_classes').insert([ maliciousSizeClass ]) })
            beforeEach(() => { return db.into('size_types').insert([ maliciousSizeType ]) })
            beforeEach(() => { return db.into('sizes').insert([ maliciousSize ])})
            beforeEach(() => { return db.into('sizes_to_products').insert([ sizeToProduct ]) })


            it('removes the attack content', () => {
                return supertest(app)
                    .get(`/api/products/${productId}/sizes`)
                    .expect(200)
                    .expect( res => {
                        expect(res.body[0].size_type).to.eql(maliciousSizeType.english_name)
                        expect(res.body[0].size_class).to.eql(maliciousSizeClass.english_name)
                        expect(res.body[0].us_size).to.eql(maliciousSize.us_size)
                    })
            })
        })
    })

    describe('POST /api/products', () => {
        beforeEach(() => insertFixtures([]))

        it(`Creates a product, responding with 201 and the new product`, () => {
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

    describe('POST /api/products/:product_id/certifications', () => {
        beforeEach(insertFixtures)
        beforeEach(() => { return db.into('certifications').insert(certifications[0]) })

        const productId = 1

        it('creates a product-certification pair, responding with 201 and the new product-certification pair', () => {
            const productCertificationPair = {
                product_id: 1,
                certification_id: 1
            }

            return supertest(app)
                .post(`/api/products/${productId}/certifications`)
                .send(productCertificationPair)
                .expect(201, productCertificationPair)
        })

        const requiredFields = [
            'product_id',
            'certification_id'
        ]
        
        requiredFields.forEach(field => {
            const newCertificationPair = {
                product_id: 1,
                certification_id: 1
            }

            delete newCertificationPair[field]

            it(`responds with 400 and an error message when the '${field}' is missing`, () => {
                
                return supertest(app)
                    .post(`/api/products/${productId}/certifications`)
                        .send(newCertificationPair)
                        .expect(400, {
                            error: { message: `Missing '${field}' in request body`}
                        })
            })
        })
    })

    describe('POST /api/products/:product_id/fabrics', () => {
        beforeEach(insertFixtures)
        beforeEach(() => { return db.into('fabric_types').insert(fabricTypes) })
        beforeEach(() => { return db.into('fabrics').insert(fabrics) })
    
        const productId = 1

        it('creates a product-fabric pair, responding with 201 and the new product-fabric pair', () => {
            const newProductFabricPair = {
                product_id: 1,
                fabric_id: 1
            }

            return supertest(app)
                .post(`/api/products/${productId}/fabrics`)
                .send(newProductFabricPair)
                .expect(201, newProductFabricPair)
        })

        const requiredFields = [
            'product_id',
            'fabric_id'
        ]
        
        requiredFields.forEach(field => {
            const newProductFabricPair = {
                product_id: 1,
                fabric_id: 1
            }

            delete newProductFabricPair[field]

            it(`responds with 400 and an error message when the '${field}' is missing`, () => {
                return supertest(app)
                    .post(`/api/products/${productId}/fabrics`)
                    .send(newProductFabricPair)
                    .expect(400, {
                        error: { message: `Missing '${field}' in request body`}
                    })
            })
        })
    })

    describe('POST /api/products/:product_id/factories', () => {
            beforeEach(insertFixtures)
            beforeEach(() => { return db.into('factories').insert(factories) })

            const productId = 1

        it('creates a product-factory pair, responding with 201 and the new product-factory pair', () => {
            const newProductFactoryTriplet = {
                product_id: 1,
                factory_id: 1,
                stage: 'sew'
            }

            return supertest(app)
                .post(`/api/products/${productId}/factories`)
                .send(newProductFactoryTriplet)
                .expect(201, newProductFactoryTriplet)
        })

        const requiredFields = [
            'product_id',
            'factory_id',
            'stage'
        ]
        
        requiredFields.forEach(field => {
            const newProductFactoryTriplet = {
                product_id: 1,
                factory_id: 1,
                stage: 'sew'
            }

            delete newProductFactoryTriplet[field]

            it(`responds with 400 and an error message when the '${field}' is missing`, () => {
                return supertest(app)
                    .post(`/api/products/${productId}/factories`)
                    .send(newProductFactoryTriplet)
                    .expect(400, {
                        error: { message: `Missing '${field}' in request body`}
                    })  
            })
        })
    })

    describe('POST /api/products/:product_id/fibers', () => {
        beforeEach(insertFixtures)
        beforeEach(() => { return db.into('factories').insert(factories) })
        beforeEach(() => { return db.into('fiber_and_material_types').insert(fiberTypes) })
        beforeEach(() => { return db.into('fibers_and_materials').insert(fibers) })
    
        const productId = 1

        it('creates a product-fiber pair, responding with 201 and the new product-fiber pair', () => {
            const newProductFiberPair = {
                product_id: 1,
                fiber_or_material_id: 1
            }

            return supertest(app)
                .post(`/api/products/${productId}/fibers`)
                .send(newProductFiberPair)
                .expect(201, newProductFiberPair)
        })

        const requiredFields = [
            'product_id',
            'fiber_or_material_id'
        ]
        
        requiredFields.forEach(field => {
            const newProductFiberPair = {
                product_id: 1,
                fiber_or_material_id: 1
            }

            delete newProductFiberPair[field]

            it(`responds with 400 and an error message when the '${field}' is missing`, () => {
                return supertest(app)
                    .post(`/api/products/${productId}/fibers`)
                    .send(newProductFiberPair)
                    .expect(400, {
                        error: { message: `Missing '${field}' in request body`}
                })  
            })
        })    
    })

    describe('POST /api/products/:product_id/notions', () => {
        beforeEach(insertFixtures)
        beforeEach(() => { return db.into('factories').insert(factories)})
        beforeEach(() => { return db.into('notion_types').insert(notionType)})
        beforeEach(() => { return db.into('notions').insert(notions)})

        const productId = 1

        it('creates a product-notion pair, responding with 201 and the new product-notion pair', () => {
            const newProductNotionPair = {
                product_id: 1,
                notion_id: 1
            }

            return supertest(app)
                .post(`/api/products/${productId}/notions`)
                .send(newProductNotionPair)
                .expect(201, newProductNotionPair)
        })

        const requiredFields = []
        
        requiredFields.forEach(field => {
            const newProductNotionPair = {
                product_id: 1,
                notion_id: 1
            }

            delete newProductNotionPair[field]

            it(`responds with 400 and an error message when the '${field}' is missing`, () => {
                return supertest(app)
                    .post(`/api/products/${productId}/notions`)
                    .send(newProductNotionPair)
                    .expect(400, {
                        error: { message: `Missing '${field}' in request body`}
                    })  
            })
        })
    })

    describe('POST /api/products/:product_id/sizes', () => {
        beforeEach(insertFixtures)
        beforeEach(() => { return db.into('size_classes').insert(sizeClass)})
        beforeEach(() => { return db.into('size_types').insert(sizeType)})
        beforeEach(() => { return db.into('sizes').insert(size)})

        const productId = 1

        it('creates a product-size pair, responding with 201 and the new product-size pair', () => {
            const newProductSizePair = {
                product_id: 1,
                size_id: 1
            }

            return supertest(app)
                .post(`/api/products/${productId}/sizes`)
                .send(newProductSizePair)
                .expect(201, newProductSizePair)
            })

            const requiredFields = [
                'product_id',
                'size_id'
            ]
        
            requiredFields.forEach(field => {
                const newProductSizePair = {
                    product_id: 1,
                    size_id: 1
                }
            
            delete newProductSizePair[field]

            it(`responds with 400 and an error message when the '${field}' is missing`, () => {
                return supertest(app)
                    .post(`/api/products/${productId}/sizes`)
                    .send(newProductSizePair)
                    .expect(400, {
                        error: { message: `Missing '${field}' in request body`}
                    }) 
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

            it('responds with 400 when no required fields are supplied', () => {
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
                const expectedProducts =  testProducts.filter(product => product.id !== idToRemove)

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