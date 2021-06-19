const knex = require('knex')
const app = require('../src/app')
const supertest = require('supertest')
const { expect } = require('chai')
const { makeCategoryArray } = require('./categories.fixtures')
const { makeCertificationArray } = require('./certifications.fixtures')
const { makeBrandArray, makeMalBrand } = require('./brands.fixtures')
const { makeMalCertification } = require('./certifications.fixtures')
const { makeFabricTypeArray, makeFabricArray, makeMalFabric } = require('./fabrics.fixtures')
const { makeFactoryArray, makeMalFactory } = require('./factories.fixtures')
const { makeFiberArray, makeFiberTypeArray, makeMalFiber, makeMalFiberType } = require('./fibers.fixtures')
const { makeNotionArray, makeNotionType, makeMalNotion, makeMalNotionType } = require('./notions.fixtures')
const {
    makeDry, makeImage, makeProductArray, makeProductToCertificationArray, makeProductToFactoriesArray,
    makeProductToFiberArray, makeSize, makeSizeToProduct, makeWash, makeMalImage, makeMalProduct
} = require('./products.fixtures')

describe('Products Endpoints', () => {
    const brands = makeBrandArray()
    const categories = makeCategoryArray()
    const certifications = makeCertificationArray()
    const dryInstructions = [ makeDry() ]
    const fabricTypes = makeFabricTypeArray()
    const fabrics = makeFabricArray()
    const factories = makeFactoryArray()
    const { fibersPost, fibersGet} = makeFiberArray()
    const fiberTypes = makeFiberTypeArray()
    const image = makeImage()
    const { malBrand } = makeMalBrand()
    const { malCertification, expectedCertification } = makeMalCertification()
    const { malFabric, expectedFabric } = makeMalFabric()
    const { malFactory, expectedFactory } = makeMalFactory()
    const { malFiber, expectedFiber } = makeMalFiber()
    const { malFiberType } = makeMalFiberType()
    const { malImage, expectedImage } = makeMalImage()
    const { malNotion, expectedNotion } = makeMalNotion()
    const { malNotionType} = makeMalNotionType()
    const { malProduct, expectedProduct } = makeMalProduct()
    const materialTypes = makeFiberTypeArray()
    const materials = makeFiberArray()
    const { notionsPost, notionsGet } = makeNotionArray()
    const notionType = makeNotionType()
    const productsToFactories = makeProductToFactoriesArray()
    const productsToFibers = makeProductToFiberArray()
    const { productsGet, productsPost } = makeProductArray()
    const productsToCertifications = makeProductToCertificationArray()
    const size = makeSize()
    const sizeToProduct = makeSizeToProduct()
    const washInstructions = [ makeWash() ]      

    let db

    const insertFixtures = () => (
        Promise.all([
            db.into('brands').insert(brands),
            db.into('wash_instructions').insert(washInstructions),
            db.into('dry_instructions').insert(dryInstructions),
            db.into('categories').insert(categories)
            ])
            .then(
                () => db.into('products').insert(productsPost)
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

    const cleanUpTables = () => db.raw(
        `TRUNCATE table products, brands, categories, certifications, dry_instructions, fabric_types, fabrics, fabrics_to_products, 
        factories, fibers_and_materials, fiber_and_material_types, fibers_to_products, notion_types, notions, notions_to_products, 
        notions_to_fibers_and_materials, product_cmts_to_certifications, product_cmts_to_factories, 
        product_colors, sizes, sizes_to_products, wash_instructions RESTART IDENTITY CASCADE`
    )
    before('clean tables', () => db.raw('TRUNCATE table products, brands, categories, certifications, dry_instructions, fabric_types, fabrics, fabrics_to_products, factories, fibers_and_materials, fiber_and_material_types, fibers_to_products, notion_types, notions, notions_to_products, notions_to_fibers_and_materials, product_cmts_to_certifications, product_cmts_to_factories, product_colors, sizes, sizes_to_products, wash_instructions RESTART IDENTITY CASCADE'))
    afterEach('clean tables', () => db.raw('TRUNCATE table products, brands, categories, certifications, dry_instructions, fabric_types, fabrics, fabrics_to_products, factories, fibers_and_materials, fiber_and_material_types, fibers_to_products, notion_types, notions, notions_to_products, notions_to_fibers_and_materials, product_cmts_to_certifications, product_cmts_to_factories, product_colors, sizes, sizes_to_products, wash_instructions RESTART IDENTITY CASCADE'))

    describe('GET /api/products', () => {
        context('Given there are products in the database', () => {
            beforeEach(insertFixtures)

            it('GET /api/products responds with 200 and all of the products', () => {
                return supertest(app)
                    .get('/api/products')
                    .expect(200, productsGet)
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
            beforeEach(() =>  db.into('brands').insert(brands))
            beforeEach(() =>  db.into('wash_instructions').insert(washInstructions))
            beforeEach(() =>  db.into('dry_instructions').insert(dryInstructions))
            beforeEach(() =>  db.into('categories').insert(categories))
            beforeEach(() =>  db.into('products').insert(malProduct))

            it('removes XSS attack content', () => {
                return supertest(app)
                    .get('/api/products')
                    .expect(200)
                    .expect(res => {
                        expect(res.body[0].english_name).to.eql(expectedProduct.english_name)
                        expect(res.body[0].product_url).to.eql(expectedProduct.product_url)
                        expect(res.body[0].cmt_notes).to.eql(expectedProduct.cmt_notes)
                    })
            })
        })
    })

    describe('GET /api/products/:product_id', () => {
        context('Given there are products in the database', () => {
            beforeEach(insertFixtures)

            it('GET /api/products/:product_id responds with 200 and the specified product', () => {
                const productId = 2

                return supertest(app)
                    .get(`/api/products/${productId}`)
                    .expect(200)
                    .expect(res => {
                        expect(res.body.id).to.eql(productsGet[productId - 1].id)
                        expect(res.body.english_name).to.eql(productsGet[productId - 1].english_name)
                        expect(res.body.brand_id).to.eql(productsGet[productId - 1].brand_id)
                        expect(res.body.category_id).to.eql(productsGet[productId - 1].category_id)
                        expect(res.body.product_url).to.eql(productsGet[productId - 1].product_url)
                        expect(res.body.feature_image_url).to.eql(productsGet[productId - 1].feature_image_url)
                        expect(res.body.multiple_color_options).to.eql(productsGet[productId - 1].multiple_color_options)
                        expect(res.body.cost_in_home_currency).to.eql(productsGet[productId - 1].cost_in_home_currency)
                        expect(res.body.wash_id).to.eql(productsGet[productId - 1].wash_id)
                        expect(res.body.dry_id).to.eql(productsGet[productId - 1].dry_id)
                        expect(res.body.cmt_country).to.eql(productsGet[productId - 1].cmt_country)
                        expect(res.body.cmt_factory_notes).to.eql(productsGet[productId - 1].cmt_factory_notes)
                        expect(res.body.approved_by_admin).to.eql(productsGet[productId - 1].approved_by_admin)
                        expect(res.body.date_published).to.eql(productsGet[productId - 1].date_published)
                    })
            })
        })

        context(`Given an XSS attack product`, () => {
            beforeEach(insertFixtures)
            beforeEach(() =>  db.into('products').insert(malProduct))

            it(`Removes XSS attack content`, () => {
                return supertest(app)
                    .get(`/api/products/${malProduct.id}`)
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
            beforeEach(() =>  db.into('certifications').insert(certifications))
            beforeEach(() =>  db.into('product_cmts_to_certifications').insert(productsToCertifications))
            
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
            beforeEach(() =>  db.into('certifications').insert( malCertification))

            const pTC = [{ product_id: productId, certification_id: malCertification.id }]

            beforeEach(() =>  db.into('product_cmts_to_certifications').insert(pTC))

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
            beforeEach(() =>  db.into('fabric_types').insert(fabricTypes))
            beforeEach(() =>  db.into('fabrics').insert(fabrics))
        

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
            beforeEach(() =>  db.into('fabric_types').insert(fabricTypes))
            beforeEach(() =>  db.into('fabrics').insert(malFabric))

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
            beforeEach(() =>  db.into('factories').insert(factories))
            beforeEach(() =>  db.into('product_cmts_to_factories').insert(productsToFactories))

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
            beforeEach(() =>  db.into('factories').insert(malFactory))

            const pTF = [{ product_id: productId, factory_id: malFactory.id, stage: 'sew' }]

            beforeEach(() =>  db.into('product_cmts_to_factories').insert(pTF))

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
        const productId = 1

        context('when there are fibers in the database', () => {
            beforeEach(() =>  db.into('factories').insert(factories))
            beforeEach(() =>  db.into('fiber_and_material_types').insert(fiberTypes))
            beforeEach(() =>  db.into('fibers_and_materials').insert(fibersPost))
            beforeEach(() =>  db.into('fibers_to_products').insert(productsToFibers))

            it('returns all the fibers', () => {
                return supertest(app)
                    .get(`/api/products/${productId}/fibers`)
                    .expect(200, fibersGet)
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
            beforeEach(() =>  db.into('brands').insert(malBrand))
            beforeEach(() =>  db.into('factories').insert(factories))
            beforeEach(() =>  db.into('factories').insert(malFactory))
            beforeEach(() =>  db.into('fiber_and_material_types').insert(fiberTypes))
            beforeEach(() =>  db.into('fiber_and_material_types').insert(malFiberType))
            beforeEach(() =>  db.into('fibers_and_materials').insert(fibersPost))
            beforeEach(() =>  db.into('fibers_and_materials').insert(malFiber))
            const pTF = [{ product_id: productId, fiber_or_material_id: malFiber.id }]
            beforeEach(() =>  db.into('fibers_to_products').insert(pTF))

            it('removes the attack content', () => {
                return supertest(app)
                    .get(`/api/products/${productId}/fibers`)
                    .expect(200, [ expectedFiber ])
            })
        })
    })

    describe('GET /api/products/:product_id/images', () => {
        beforeEach(insertFixtures)

        const productId = 1

        context('when there are images in the database', () => {
            beforeEach(() =>  db.into('product_images').insert(image))
            
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
            beforeEach(() =>  db.into('product_images').insert(malImage))

            it('removes the attack content', () => {
                return supertest(app)
                    .get(`/api/products/${productId}/images`)
                    .expect(200, [ expectedImage ])
            })
        })
    })

    describe('GET /api/products/:product_id/notions', () => {
        beforeEach(insertFixtures)
        const productId = 1

        context('when there are notions in the database', () => {
            beforeEach(() => {
                Promise.all([
                    db.into('brands').insert(brands),
                    db.into('factories').insert(factories),
                    db.into('notion_types').insert(notionType),
                    db.into('fiber_and_material_types').insert(materialTypes),
                    db.into('categories').insert(categories),
                    ])
                    .then(() =>
                        Promise.all([
                            db.into('notions').insert(notionsPost),
                            db.into('fibers_and_materials').insert(materials)
                    ]))
                    .then(
                        Promise.all([
                            db.into('notions_to_products').insert(productsToNotions),
                            // db.into('notions_to_fibers_and_materials').insert(notionsToMaterials)
                    ]))
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
            const pTN = { product_id: productId, notion_id: malNotion.id }
            beforeEach(() =>  db.into('brands').insert(malBrand))
            beforeEach(() =>  db.into('factories').insert(factories))
            beforeEach(() =>  db.into('notion_types').insert(malNotionType))
            beforeEach(() =>  db.into('fiber_and_material_types').insert(malFiberType))
            beforeEach(() =>  db.into('notions').insert(malNotion))
            beforeEach(() =>  db.into('notions_to_products').insert(pTN))

            it('removes the attack content', () => {
                return supertest(app)
                    .get(`/api/products/${productId}/notions`)
                    .expect(200)
                    .expect(res => {
                        expect(res.body[0].notion_type).to.eql(malNotionType.english_name)
                        expect(res.body[0].manufacturer_notes).to.eql(expectedNotion.manufacturer_notes)
                        expect(res.body[0].material_notes).to.eql(expectedNotion.material_notes)
                    })
            })
        })            
    })

    describe('GET /api/products/:product_id/sizes', () => {
        beforeEach(insertFixtures)
        const productId = 1

        context('when there are sizes in the database', () => {
            beforeEach(() =>  db.into('sizes').insert(size))
            beforeEach(() =>  db.into('sizes_to_products').insert(sizeToProduct))

            it('returns all the sizes', () => {
                return supertest(app)
                    .get(`/api/products/${productId}/sizes`)
                    .expect(200)
                    .expect(res => {
                        expect(res.body[0].id).to.eql(size.id)
                        expect(res.body[0].us_size).to.eql(size.us_size)
                    })
            })
        })

        context('when there are no sizes in the database', () => {
            it('responds with 200 and an empty list', () => {
                return supertest(app)
                    .get(`/api/products/${productId}/sizes`)
                    .expect(200, [])
            })
        })
    })

    describe('POST /api/products', () => {
        beforeEach(() =>  db.into('brands').insert(brands))
        beforeEach(() =>  db.into('wash_instructions').insert(washInstructions))
        beforeEach(() =>  db.into('dry_instructions').insert(dryInstructions))
        beforeEach(() =>  db.into('categories').insert(categories))

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
                cmt_notes: '100 employees',
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
                    expect(res.body.cmt_notes).to.eql(newProduct.cmt_notes)
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
            return supertest(app)
                .post('/api/products')
                .send(malProduct)
                .expect(201)
                .expect(res => {
                    expect(res.body.english_name).to.eql(expectedProduct.english_name)
                    expect(res.body.product_url).to.eql(expectedProduct.product_url)
                    expect(res.body.cmt_factory_notes).to.eql(expectedProduct.cmt_factory_notes)
                })
        })
    })

    describe('POST /api/products/product-form', () => {
        beforeEach(() =>  db.into('brands').insert(brands))
        beforeEach(() =>  db.into('categories').insert(categories))
        beforeEach(() =>  db.into('certifications').insert(certifications))
        beforeEach(() =>  db.into('dry_instructions').insert(dryInstructions))
        beforeEach(() =>  db.into('factories').insert(factories))
        beforeEach(() =>  db.into('fiber_and_material_types').insert(fiberTypes))
        beforeEach(() =>  db.into('fibers_and_materials').insert(fibersPost))
        beforeEach(() =>  db.into('notion_types').insert(notionType))
        beforeEach(() =>  db.into('sizes').insert(size))
        beforeEach(() =>  db.into('wash_instructions').insert(washInstructions))

        it(`Creates a product, responding with 201 and the new product`, () => {
            const newProduct = {
                english_name: 'Yellow Shirt',
                brand_id: 1,
                category_id: 1,
                product_url: 'https://canopyandunderstory.com',
                feature_image_url: "http://test-url-feature-image.com",
                multiple_color_options: true,
                cost_in_home_currency: 60,
                wash_id: 1,
                dry_id: 1,
                color_fieldsets: [
                    {
                        name: 'Daffodil',
                        descriptionId: 14,
                        swatchUrl: 'www.swatch.com',
                        imageUrls: ['image-1.com', 'image-2.com']
                    }
                ],
                sew_fact: {
                    countryId: 1,
                    factoryId: 1
                },
                cut_fact: {
                    countryId: 1,
                    factoryId: 1
                },
                man_cert_checks: [1],
                cmt_notes: '100 employees',
                selected_sizes: [1],
                fabrics: [
                    {
                        certs: [1],
                        fabric_details: {
                            dyeFinCountryId: 1,
                            dyeFinId: 1,
                            dyeFinNotes: 'Notes',
                            wovKnitCountryId: 1,
                            wovKnitId: 1,
                            wovKnitNotes: 'Notes'
                        },
                        fiber_array: [
                            {
                               
                                    fiberTypeId: 1,
                                    percentage: 100,
                                    originId: 1,
                                    producerId: 1,
                                    producerNotes: 'Notes',
                                    certIds: [1]
                            }
                        ],
                        relationship: 'primary'
                    }
                ],
                notions: [
                    {
                        typeId: 1,
                        countryId: 1,
                        factoryId: 1,
                        notes: null,
                        materialTypeId: 1,
                        materialOriginId: 1,
                        materialProducerId: 1,
                        certIds: [1]
                    }
                ],
                approved_by_admin: true
            }

            return supertest(app)
                .post('/api/products/product-form')
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
                    expect(res.body.cmt_notes).to.eql(newProduct.cmt_notes)
                    expect(res.body.approved_by_admin).to.eql(newProduct.approved_by_admin)
                    expect(res.body).to.have.property('id')
                    // expect(res.headers.location).to.have.eql(`/api/products/${res.body.id}`)
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
            return supertest(app)
                .post('/api/products')
                .send(malProduct)
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
        beforeEach(() =>  db.into('certifications').insert(certifications[0]))

        const productId = 1

        const prodCert = {
            certification_id: 1
        }

        it('creates a product-certification pair, responding with 201 and the new product-certification pair', () => {            
            return supertest(app)
                .post(`/api/products/${productId}/certifications`)
                .send(prodCert)
                .expect(201, {
                    product_id: productId,
                    certification_id: prodCert.certification_id
                })
        })
        
        it(`responds with 400 and an error message when the 'certification_id' is missing`, () => {
            return supertest(app)
                .post(`/api/products/${productId}/certifications`)
                    .send({})
                    .expect(400, {
                        error: { message: `Missing 'certification_id' in request body`}
                    })
        })
    })

    describe('POST /api/products/:product_id/colors', () => {
        beforeEach(insertFixtures)

        const productId = 1

        const newColor = {
            product_id: productId,
            color_english_name: 'Lemon',
            color_description_id: 1,
            swatch_image_url: 'www.lemon-swatch.com'
        }

        it('creates a color, responding with 201 and the new color', () => {           

            return supertest(app)
                .post(`/api/products/${productId}/colors`)
                .send(newColor)
                .expect(201, {
                    ...newColor,
                    id: 1
                })
        })

        const requiredFields = [
            'color_description_id',
            'color_english_name',
            'swatch_image_url'
        ]
        
        requiredFields.forEach(field => {
            const color = {
                ...newColor
            }

            delete color[field]

            it(`responds with 400 and an error message when the '${field}' is missing`, () => {
                return supertest(app)
                    .post(`/api/products/${productId}/colors`)
                        .send(color)
                        .expect(400, {
                            error: { message: `Missing '${field}' in request body`}
                        })
            })
        })
    })

    describe('POST /api/products/:product_id/fabrics', () => {
        beforeEach(insertFixtures)
        beforeEach(() =>  db.into('fabric_types').insert(fabricTypes))
        beforeEach(() =>  db.into('fabrics').insert(fabrics))
    
        const productId = 1

        const newProductFabricSet = {
            fabric_id: 1,
            relationship: 'primary'
        }

        const requiredFields = [
            'fabric_id',
            'relationship'
        ]

        // it('creates a product-fabric pair, responding with 201 and the new product-fabric pair', () => {
        //     return supertest(app)
        //         .post(`/api/products/${productId}/fabrics`)
        //         .send(newProductFabricSet)
        //         .expect(201)
        //         .expect(res => {
        //             expect(res.body.product_id).to.eql(productId)
        //             expect(res.body.fabric_id).to.eql(newProductFabricSet.fabric_id)
        //             expect(res.body.relationship).to.eql(newProductFabricSet.relationship)
        //         })
        // })

        requiredFields.forEach(field => {
            const prodFab = {
                ...newProductFabricSet
            }

            delete prodFab[field]

            it(`responds with 400 and an error message when the 'fabric_id' is missing`, () => {
                return supertest(app)
                    .post(`/api/products/${productId}/fabrics`)
                    .send(prodFab)
                    .expect(400, {
                        error: { message: `Missing '${field}' in request body`}
                    })
            })
        })   
    })

    describe('POST /api/products/:product_id/factories', () => {
            beforeEach(insertFixtures)
            beforeEach(() =>  db.into('factories').insert(factories))

            const productId = 1

            const newProdFactSet = {
                factory_id: 1,
                stage: 'sew'
            }

        it('creates a product-factory set, responding with 201 and the new product-factory set', () => {
            return supertest(app)
                .post(`/api/products/${productId}/factories`)
                .send(newProdFactSet)
                .expect(201, {
                    ...newProdFactSet,
                    product_id: productId
                })
        })

        const requiredFields = [
            'factory_id',
            'stage'
        ]
        
        requiredFields.forEach(field => {
            const prodFact = {
                ...newProdFactSet
            }

            delete prodFact[field]

            it(`responds with 400 and an error message when the '${field}' is missing`, () => {
                return supertest(app)
                    .post(`/api/products/${productId}/factories`)
                    .send(prodFact)
                    .expect(400, {
                        error: { message: `Missing '${field}' in request body`}
                    })  
            })
        })
    })

    describe('POST /api/products/:product_id/fibers', () => {
        beforeEach(insertFixtures)
        beforeEach(() =>  db.into('factories').insert(factories))
        beforeEach(() =>  db.into('fiber_and_material_types').insert(fiberTypes))
        beforeEach(() =>  db.into('fibers_and_materials').insert(fibersPost))
    
        const productId = 1

        const newProductFiberPair = {
            product_id: productId,
            fiber_or_material_id: 1
        }

        it('creates a product-fiber pair, responding with 201 and the new product-fiber pair', () => {
            return supertest(app)
                .post(`/api/products/${productId}/fibers`)
                .send(newProductFiberPair)
                .expect(201, newProductFiberPair)
        })

        it(`responds with 400 and an error message when the 'fiber_or_material_id' is missing`, () => {
            return supertest(app)
                .post(`/api/products/${productId}/fibers`)
                .send({})
                .expect(400, {
                    error: { message: `Missing 'fiber_or_material_id' in request body`}
            })  
        })
    })

    describe('POST /api/products/:product_id/notions', () => {
        beforeEach(insertFixtures)
        beforeEach(() =>  db.into('factories').insert(factories))
        beforeEach(() =>  db.into('notion_types').insert(notionType))
        beforeEach(() =>  db.into('fiber_and_material_types').insert(fiberTypes))
        beforeEach(() =>  db.into('fibers_and_materials').insert(fibersPost))
        beforeEach(() =>  db.into('notions').insert(notionsPost))

        const productId = 1

        const newProductNotionPair = {
            product_id: productId,
            notion_id: 1
        }

        it('creates a product-notion pair, responding with 201 and the new product-notion pair', () => {
            return supertest(app)
                .post(`/api/products/${productId}/notions`)
                .send(newProductNotionPair)
                .expect(201, newProductNotionPair)
        })

        it(`responds with 400 and an error message when the 'notion_id' is missing`, () => {
            return supertest(app)
                .post(`/api/products/${productId}/notions`)
                .send({})
                .expect(400, {
                    error: { message: `Missing 'notion_id' in request body`}
                })  
        })
    })

    describe('POST /api/products/:product_id/sizes', () => {
        beforeEach(insertFixtures)
        beforeEach(() =>  db.into('sizes').insert(size))

        const productId = 1

        const newProductSizePair = {
            product_id: productId,
            size_id: 1
        }

        it('creates a product-size pair, responding with 201 and the new product-size pair', () => {
            return supertest(app)
                .post(`/api/products/${productId}/sizes`)
                .send(newProductSizePair)
                .expect(201, newProductSizePair)
        })
        
        it(`responds with 400 and an error message when the 'size_id' is missing`, () => {
            return supertest(app)
                .post(`/api/products/${productId}/sizes`)
                .send({})
                .expect(400, {
                    error: { message: `Missing 'size_id' in request body`}
                }) 
        })
    })

    describe('PATCH /api/products/:product_id', () => {
        context('Given there are products in the database', () => {
            beforeEach(insertFixtures)
            const idToUpdate = 1

            it('responds with 204 and updates the product', () => {
                const updateProduct = {
                    english_name: 'Updated Product Name',
                    brand_id: 1,
                    category_id: 1,
                    product_url: 'https://canopyandunderstory.com',
                    feature_image_url: 'https://canopyandunderstory.com',
                    multiple_color_options: false,
                    cost_in_home_currency: 60,
                    wash_id: 1,
                    dry_id: 1,
                    cmt_notes: 'Updated Notes',
                    approved_by_admin: true
                }
                const expectedProduct = {
                    ...productsGet[idToUpdate - 1],
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
                return supertest(app)
                    .patch(`/api/products/${idToUpdate}`)
                    .send({ irrelevantField: 'foo' })
                    .expect(400, {
                        error: { message: `Request body must contain 'english_name', 'brand_id', 'category_id', 'product_url', 'feature_image_url', 'multiple_color_options', 'cost_in_home_currency', 'wash_id', 'dry_id', 'cmt_notes', or 'approved_by_admin'`}
                    })
            })

            it(`responds with 204 when updating only a subset of fields`, () => {
                const updateProduct = {
                    english_name: 'Updated Product Name'
                }
                const expectedProduct = {
                    ...productsPost[idToUpdate - 1],
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
            beforeEach(insertFixtures)

            it('responds with 204 and removes the product', () => {
                const idToRemove = 1
                const expectedProducts = productsGet.filter(product => product.id !== idToRemove)

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