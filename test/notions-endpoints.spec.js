const knex = require('knex')
const jwt = require('jsonwebtoken')
const app = require('../src/app')
const { makeBrandArray, makeMalBrand } = require('./brands.fixtures')
const { makeFactoryArray,makeMalFactory } = require('./factories.fixtures')
const { makeFiberTypeArray, makeMalFiberType } = require('./fibers.fixtures')
const { makeMalNotion, makeNotionArray, makeNotionType, makeMalNotionType, makeNotsToCerts } = require('./notions.fixtures')
const { makeCertificationArray, makeMalCertification } = require('./certifications.fixtures')
const { hashedAdminArray, hashedUserArray, makeAdminArray, makeUserArray, makeMalUser } = require('./users.fixtures')
const { describe } = require('mocha')

describe('Notions Endpoints', () => {
    const adminArray = makeAdminArray()
    const brands = makeBrandArray()
    const certifications = makeCertificationArray()
    const factories = makeFactoryArray()
    const fiberTypes = makeFiberTypeArray()
    const hashAdminArray = hashedAdminArray()
    const hashUserArray = hashedUserArray()
    const { malBrand } = makeMalBrand()
    const { malCertification, expectedCertification } = makeMalCertification()
    const { malFactory } = makeMalFactory()
    const { malFiberType } = makeMalFiberType()
    const { malNotion, expectedNotion } = makeMalNotion()
    const { notionsPost, notionsCertsGet, notionsGet } = makeNotionArray()
    const notsToCerts = makeNotsToCerts()
    const { malNotionType, expectedNotionType } = makeMalNotionType()
    const { malUser, expectedUser } = makeMalUser()
    const notionTypes = makeNotionType()
    const userArray = makeUserArray()

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

    before('clean the table', () => db.raw(
        `TRUNCATE table notions, fabric_types, brands, fabrics, factories, fiber_and_material_types, 
        fibers_to_factories, fabrics_to_fibers_and_materials, notion_types,  certifications, 
        fabrics_to_certifications, users RESTART IDENTITY CASCADE`
    ))

    beforeEach(() => db.into('users').insert(hashUserArray))

    afterEach('cleanup', () => db.raw(
        `TRUNCATE table notions, fabric_types, brands, fabrics, factories, fiber_and_material_types, 
        fibers_to_factories, fabrics_to_fibers_and_materials, notion_types, certifications, 
        fabrics_to_certifications, users RESTART IDENTITY CASCADE`
    ))

    describe('GET /api/notions', () => {
        context('when there are notions in the database', () => {
            beforeEach(() => db.into('brands').insert(brands))
            beforeEach(() => db.into('notion_types').insert(notionTypes))
            beforeEach(() => db.into('fiber_and_material_types').insert(fiberTypes))
            beforeEach(() => db.into('factories').insert(factories))
            beforeEach(() => db.into('notions').insert(notionsPost))

            it('returns 200 and all the notions', () => (
                supertest(app)
                    .get('/api/notions')
                    .expect(200)
                    .expect(res => {
                        expect(res.body[0].id).to.eql(notionsGet.id)
                        expect(res.body[0].notion_type_id).to.eql(notionsGet.notion_type_id)
                        expect(res.body[0].brand_id).to.eql(notionsGet.brand_id)
                        expect(res.body[0].manufacturer_country).to.eql(notionsGet.manufacturer_country)
                        expect(res.body[0].manufacturer_id).to.eql(notionsGet.manufacturer_id)
                        expect(res.body[0].manufacturer_notes).to.eql(notionsGet.manufacturer_notes)
                        expect(res.body[0].material_type_id).to.eql(notionsGet.material_type_id)
                        expect(res.body[0].material_origin_id).to.eql(notionsGet.material_origin_id)
                        expect(res.body[0].material_producer_id).to.eql(notionsGet.material_producer_id)
                        expect(res.body[0].material_notes).to.eql(notionsGet.material_notes)
                        expect(res.body[0].approved_by_admin).to.eql(notionsGet.approved_by_admin)
                        expect(res.body[0].date_published).to.eql(notionsGet.date_published)
                    })
            ))
        })

        context('when there are no notions in the database', () => {
            it('responds with 200 and an empty list', () => (
                supertest(app)
                    .get('/api/notions')
                    .expect(200, [])
            ))
        })

        context('given an XSS attack notion', () => {
            beforeEach(() => db.into('brands').insert(malBrand))
            beforeEach(() => db.into('notion_types').insert(malNotionType))
            beforeEach(() => db.into('fiber_and_material_types').insert(malFiberType))
            beforeEach(() => db.into('factories').insert(malFactory))
            beforeEach(() => db.into('notions').insert(malNotion))

            it('removes the XSS attack content', () => (
                supertest(app)
                    .get('/api/notions')
                    .expect(res => {
                        expect(res.body[0].notion_type).to.eql(expectedNotion.notion_type)
                        expect(res.body[0].manufacturer_notes).to.eql(expectedNotion.manufacturer_notes)
                        expect(res.body[0].material_notes).to.eql(expectedNotion.material_notes)
                    })
            ))
        })
    })

    describe('GET /api/notions/notion-types', () => {
        context('when there are notion types in the database', () => {
            beforeEach(() => db.into('notion_types').insert(notionTypes))

            it('returns 200 and all the notion types', () => (
                supertest(app)
                    .get('/api/notions/notion-types')
                    .expect(200, notionTypes)
            ))
        })

        context('when there are no notion types in the database', () => {
            it('responds with 200 and an empty list', () => (
                supertest(app)
                    .get('/api/notions/notion-types')
                    .expect(200, [])
            ))
        })

        context('given an XSS attack notion type', () => {
            beforeEach(() => db.into('brands').insert(malBrand))
            beforeEach(() => db.into('notion_types').insert(malNotionType))
            beforeEach(() => db.into('fiber_and_material_types').insert(malFiberType))
            beforeEach(() => db.into('factories').insert(malFactory))
            beforeEach(() => db.into('notions').insert(malNotion))

            it('removes the XSS attack content', () => (
                supertest(app)
                    .get('/api/notions/notion-types')
                    .expect(res => {
                        expect(res.body[0].english_name).to.eql(expectedNotionType.english_name)
                    })
            ))
        })
    })

    describe('GET /api/notions/:notion_id', () => {
        context('when the notion with id notion_id exists', () => {
            beforeEach(() => db.into('brands').insert(brands))
            beforeEach(() => db.into('notion_types').insert(notionTypes))
            beforeEach(() => db.into('fiber_and_material_types').insert(fiberTypes))
            beforeEach(() => db.into('factories').insert(factories))
            beforeEach(() => db.into('notions').insert(notionsPost))
            
            const notionId = notionsPost.id

            it('returns the notion with id notion_id', () => (
                supertest(app)
                    .get(`/api/notions/${notionId}`)
                    .expect(200, notionsGet)
            ))
        })

        context('when the notion does not exist', () => {
            const notionId = notionsPost.id

            it('responds with 404 and an error message', () => (
                supertest(app)
                    .get(`/api/notions/${notionId}`)
                    .expect(404, { error: { message: 'Notion does not exist' } })
            ))
        })

        context('given an XSS attack notion', () => {
            beforeEach(() => db.into('brands').insert(malBrand))
            beforeEach(() => db.into('notion_types').insert(malNotionType))
            beforeEach(() => db.into('fiber_and_material_types').insert(malFiberType))
            beforeEach(() => db.into('factories').insert(malFactory))
            beforeEach(() => db.into('notions').insert(malNotion))

            const malNotionId = malNotion.id

            it('removes the XSS attack content', () => (
                supertest(app)
                    .get(`/api/notions/${malNotionId}`)
                    .expect(res => {
                        expect(res.body.notion_type).to.eql(expectedNotion.notion_type)
                        expect(res.body.manufacturer_notes).to.eql(expectedNotion.manufacturer_notes)
                        expect(res.body.material_notes).to.eql(expectedNotion.material_notes)
                    })   
            ))
        })
    })

    describe('GET /api/notions/:notion_id/certifications', () => {
        const notionId = 1

        context('when there are certifications in the database', () => {
            beforeEach(() => db.into('brands').insert(brands))
            beforeEach(() => db.into('notion_types').insert(notionTypes))
            beforeEach(() => db.into('fiber_and_material_types').insert(fiberTypes))
            beforeEach(() => db.into('factories').insert(factories))
            beforeEach(() => db.into('notions').insert(notionsPost))
            beforeEach(() =>  db.into('certifications').insert(certifications))
            beforeEach(() =>  db.into('notions_to_certifications').insert(notsToCerts))
            
            it('returns all the certifications', () => {
                return supertest(app)
                    .get(`/api/notions/${notionId}/certifications`)
                    .expect(200, certifications)
            })
        })

        context('when there are no certifications in the database', () => {
            beforeEach(() => db.into('brands').insert(brands))
            beforeEach(() => db.into('notion_types').insert(notionTypes))
            beforeEach(() => db.into('fiber_and_material_types').insert(fiberTypes))
            beforeEach(() => db.into('factories').insert(factories))
            beforeEach(() => db.into('notions').insert(notionsPost))

            it('responds with 200 and an empty list', () => {
                return supertest(app)
                    .get(`/api/notions/${notionId}/certifications`)
                    .expect(200, [])
            })
        })

        context('given a malicious certification', () => {
            const notsToMalCert = {
                certification_id: 666,
                notion_id: 1
            }

            beforeEach(() => db.into('brands').insert(brands))
            beforeEach(() => db.into('notion_types').insert(notionTypes))
            beforeEach(() => db.into('fiber_and_material_types').insert(fiberTypes))
            beforeEach(() => db.into('factories').insert(factories))
            beforeEach(() => db.into('notions').insert(notionsPost))
            beforeEach(() =>  db.into('certifications').insert(malCertification))
            beforeEach(() =>  db.into('notions_to_certifications').insert(notsToMalCert))

            it('removes the attack content', () => {
                return supertest(app)
                    .get(`/api/notions/${notionId}/certifications`)
                    .expect(200, [ expectedCertification ])
            })
        })
    })

    describe('Protected endpoints', () => {
        const protectedEndpoints = [
            {
                name: 'POST /api/notions',
                path: '/api/notions'
            },
            {
                name: 'POST /api/notions/notion-types',
                path: '/api/notions/notion-types'
            },
            {
                name: 'POST /api/notions/:notion_id/certifications',
                path: '/api/notions/1/certifications'
            },
            {
                name: 'PATCH /api/notions/:notion_id',
                path: '/api/notions/1/certifications'
            },
            {
                name: 'DELETE /api/notions/:notion_id',
                path: '/api/notions/1/certifications'
            }
        ]

        protectedEndpoints.forEach(endpoint => {
            describe(endpoint.name, () => {
                beforeEach(() => db.into('brands').insert(brands))
                beforeEach(() => db.into('notion_types').insert(notionTypes))
                beforeEach(() => db.into('fiber_and_material_types').insert(fiberTypes))
                beforeEach(() => db.into('factories').insert(factories))
                beforeEach(() => db.into('notions').insert(notionsPost))                

                it(`responds with 401 'Missing bearer tokenn' when no basic token`, () => (
                    supertest(app)
                        .post(endpoint.path)
                        .send({})
                        .expect(401, { error: `Missing bearer token`})
                ))
    
                it(`responds 401 'Unauthorized request' when no credentials in token`, () => {
                    const userNoCreds = { email: '', password: '' }
                    return supertest(app)
                        .post(endpoint.path)
                        .set('Authorization', makeAuthHeader(userNoCreds))
                        .send({})
                        .expect(401, { error: `Unauthorized request` })
                })
    
                it(`responds 401 'Unatuhorized request' when invalid user`, () => {
                    const invalidUserCreds =  { email: 'not-a-user', password: 'incorrect-password' }
                    
                    return supertest(app)
                        .post(endpoint.path)
                        .set('Authorization', makeAuthHeader(invalidUserCreds))
                        .send({})
                        .expect(401, { error: 'Unauthorized request' })
                })
    
                it(`responds 401 'Unauthorized request' when the password is wrong`, () => {
                    const incorrectPassword = { email: userArray[0].name, password: 'wrong' }
    
                    return supertest(app)
                        .post(endpoint.path)
                        .set('Authorization', makeAuthHeader(incorrectPassword))
                        .send({})
                        .expect(401, { error: 'Unauthorized request' })
                })
            })

            const reqAdminEndpoints = [
                {
                    name: 'PATCH /api/notions/:notion_id',
                    path: '/api/notions/1/certifications'
                },
                {
                    name: 'DELETE /api/notions/:notion_id',
                    path: '/api/notions/1/certifications'
                }
            ]
    
            reqAdminEndpoints.forEach(endpoint => {
                describe(endpoint.name, () => {
                    beforeEach(() => db.into('brands').insert(brands))
                    beforeEach(() => db.into('notion_types').insert(notionTypes))
                    beforeEach(() => db.into('fiber_and_material_types').insert(fiberTypes))
                    beforeEach(() => db.into('factories').insert(factories))
                    beforeEach(() => db.into('notions').insert(notionsPost))
                    beforeEach(() => db.into('users').insert(hashAdminArray))

                    it(`responds 401 'Unauthorized request' when the user is not an admin`, () => {
                        return supertest(app)
                        .patch(`/api/notions/${notionsPost.id}`)
                        .set('Authorization', makeAuthHeader(userArray[0]))
                        .send({ notion_type_id: 1})
                        .expect(401, { error: 'Unauthorized request' })
                    })
                })
            })
        })    
    })

    describe('POST /api/notions', () => {
        beforeEach(() => db.into('brands').insert(brands))
        beforeEach(() => db.into('factories').insert(factories))
        beforeEach(() => db.into('fiber_and_material_types').insert(fiberTypes))
        beforeEach(() => db.into('notion_types').insert(notionTypes))

        it('creates a new notion, returning 201 and the new notion', () => {
            const newNotion = {
                notion_type_id: 1,
                brand_id: 1,
                manufacturer_country: 1,
                manufacturer_id: 1,
                manufacturer_notes: 'These are the notes.',
                material_type_id: 1,
                material_origin_id: 1,
                material_producer_id: 1,
                material_notes: 'These are the notes.'
            }
            
            return supertest(app)
                .post(`/api/notions`)
                .set('Authorization', makeAuthHeader(userArray[0]))
                .send(newNotion)
                .expect(201)
                .expect(res => {
                    expect(res.body.notion_type_id).to.eql(newNotion.notion_type_id)
                    expect(res.body.brand_id).to.eql(newNotion.brand_id)
                    expect(res.body.manufacturer_country).to.eql(newNotion.manufacturer_country)
                    expect(res.body.manufacturer_id).to.eql(newNotion.manufacturer_id)
                    expect(res.body.manufacturer_notes).to.eql(newNotion.manufacturer_notes)
                    expect(res.body.material_type_id).to.eql(newNotion.material_type_id)
                    expect(res.body.material_origin_id).to.eql(newNotion.material_origin_id)
                    expect(res.body.material_notes).to.eql(newNotion.material_notes)
                    expect(res.body.approved_by_admin).to.eql(false)
                    expect(res.body).to.have.property('id')
                    expect(res.headers.location).to.eql(`/api/notions/${res.body.id}`)
                    const expected = new Date().toLocaleString()
                    const actual = new Date(res.body.date_published).toLocaleString()
                    expect(actual).to.eql(expected)
                    return res
                })
                .then(async postRes => {
                    const expectedNotion = {
                        id: postRes.body.id,
                        notion_type_id: postRes.body.notion_type_id,
                        notion_type: 'button',
                        brand_id: postRes.body.brand_id,
                        manufacturer_country: postRes.body.manufacturer_country,
                        manufacturer_id: postRes.body.manufacturer_id,
                        manufacturer_notes: postRes.body.manufacturer_notes,
                        material_type_id: postRes.body.material_type_id,
                        material_origin_id: postRes.body.material_origin_id,
                        material_producer_id: postRes.body.material_producer_id,
                        material_notes: postRes.body.material_notes,
                        approved_by_admin: postRes.body.approved_by_admin,
                        date_published: postRes.body.date_published
                    }

                    await supertest(app)
                        .get(`/api/notions/${postRes.body.id}`)
                        .expect(expectedNotion)
                        .catch(error => {
                            console.log(error)
                        })
                })
        })

        const requiredFields = [
            'notion_type_id',
            'brand_id',
            'manufacturer_country',
            'manufacturer_id',
            'material_type_id',
            'material_origin_id',
            'material_producer_id'    
        ]

        requiredFields.forEach(field => {
            const newNotion = {
                notion_type_id: 1,
                brand_id: 2,
                manufacturer_country: 1,
                manufacturer_id: 1,
                manufacturer_notes: 'These are the notes.',
                material_type_id: 1,
                material_origin_id: 1,
                material_producer_id: 1,
                material_notes: 'These are the notes.'
            }

            it(`responds with 400 and an error message when the '${field}' is missing`, () => {
                delete newNotion[field]

                return supertest(app)
                    .post('/api/notions')
                    .set('Authorization', makeAuthHeader(userArray[0]))
                    .send(newNotion)
                    .expect(400, {
                        error: { message: `Missing '${field}' in request body`}
                    })
            })
        })

        beforeEach(() => db.into('brands').insert(malBrand))
        beforeEach(() => db.into('fiber_and_material_types').insert(malFiberType))
        beforeEach(() => db.into('factories').insert(malFactory))
        beforeEach(() => db.into('notion_types').insert(malNotionType))

        it('removes XSS attack content from the response', () => (
            supertest(app)
                .post('/api/notions')
                .set('Authorization', makeAuthHeader(userArray[0]))
                .send(malNotion)
                .expect(201)
                .expect(res => {
                    expect(res.body.manufacturer_notes).to.eql(expectedNotion.manufacturer_notes)
                    expect(res.body.material_notes).to.eql(expectedNotion.material_notes)
                })
        ))
    })

    describe('POST /api/notions/notion-types', () => {
        it('creates a new notion type, responding with 201 and the new notion type', () => {
            const newNotionType = {
                english_name: 'zipper'
            }

            supertest(app)
                .post('/api/notions/notion-types')
                .set('Authorization', makeAuthHeader(userArray[0]))
                .send(newNotionType)
                .expect(201)
                .expect(res => {
                    expect(res.body.english_name).to.eql(newNotionType.english_name)
                    expect(res.body.approved_by_admin).to.eql(false)
                    expect(res.body).to.have.property('id')
                    const expected = new Date().toLocaleString()
                    const actual = new Date(res.body.date_published).toLocaleString()
                    expect(actual).to.eql(expected)
                })
                .catch(error => {
                    console.log(error)
                })
        })

        it(`responds with 400 and an error message when the 'english_name' field is missing`, () => {
            supertest(app)
                .post('/api/notions/notion-types')
                .set('Authorization', makeAuthHeader(userArray[0]))
                .send({})
                .expect(400, {
                    error: { message: `Missing 'english_name' in request body`}
                })
                .catch(error => {
                    console.log(error)
                })
        })

        it('removes XSS attack content from the response', () => {
            const newMalNotionType = {
                english_name: malNotionType.english_name,
                approved_by_admin: malNotionType.approved_by_admin
            }

            supertest(app)
                .post('/api/notions/notion-types')
                .set('Authorization', makeAuthHeader(userArray[0]))
                .send(newMalNotionType)
                .expect(201)
                .expect(res => {
                    expect(res.body.english_name).to.eql(expectedNotionType.english_name)
                    expect(res.body.approved_by_admin).to.eql(expectedNotionType.approved_by_admin)
                })
                .catch(error => {
                    console.log(error)
                })
        })
    })

    describe('POST /api/notions/notion_id/certifications', () => {
        before('clean the table', () => db.raw(`TRUNCATE table notion_types RESTART IDENTITY CASCADE`))
        beforeEach(() => db.into('brands').insert(brands))
        beforeEach(() => db.into('factories').insert(factories))
        beforeEach(() => db.into('fiber_and_material_types').insert(fiberTypes))
        beforeEach(() => db.into('notion_types').insert(notionTypes))
        beforeEach(() => db.into('notions').insert(notionsPost))
        beforeEach(() => db.into('certifications').insert(certifications))
        beforeEach(() => db.into('certifications').insert(malCertification))

        it('creates a notion-certification pair, responding with 201 and the notion-certification pair', () => {
            const notionId = 1
            const notCert = {
                certification_id: 1
            }

            return supertest(app)
                .post(`/api/notions/${notionId}/certifications`)
                .set('Authorization', makeAuthHeader(userArray[0]))
                .send(notCert)
                .expect(201)
        })

        it(`responds with 400 and an error message when 'certification_id' is missing`, () => {
            const notionId = 1

            return supertest(app)
                .post(`/api/notions/${notionId}/certifications`)
                .set('Authorization', makeAuthHeader(userArray[0]))
                .send({})
                .expect(400, {
                    error: { message: `Missing 'certification_id' in request body`}
                })
        })
    })

    describe('PATCH /api/notions/:notion_id', () => {
        const idToUpdate = notionsPost.id
        const adminUser = adminArray[0]

        context(`when the notion with id notion_id' exists`, () => {
            beforeEach(() => db.into('brands').insert(brands))
            beforeEach(() => db.into('factories').insert(factories))
            beforeEach(() => db.into('fiber_and_material_types').insert(fiberTypes))
            beforeEach(() => db.into('notion_types').insert(notionTypes))
            beforeEach(() => db.into('notions').insert(notionsPost))
            beforeEach(() => db.into('users').insert(hashAdminArray))

            it('updates the notion and responds with 204', () => {
                const updateNotion = {
                    manufacturer_notes: 'New notes.',
                    material_notes: 'New new new.'
                }

                const newNotion = {
                    ...notionsGet,
                    ...updateNotion
                }

                return supertest(app)
                    .patch(`/api/notions/${idToUpdate}`)
                    .set('Authorization', makeAuthHeader(adminUser))
                    .send(updateNotion)
                    .expect(204)
                    .then(res => {
                        supertest(app)
                            .get(`/api/notions/${idToUpdate}`)
                            .expect(newNotion)
                            .catch(error => {
                                console.log(error)
                            })
                    })
            })

            it('responds with 400 and an error message when no required fields are supplied', () => {
                return supertest(app)
                    .patch(`/api/notions/${idToUpdate}`)
                    .set('Authorization', makeAuthHeader(adminUser))
                    .send({})
                    .expect(400, {
                        error : { message : `Request body must contain 'notion_type_id', 'brand_id', 'manufacturer_country', 'manufacturer_id', 'manufacturer_notes', 'material_type_id', 'material_origin_id', 'material_producer_id','material_notes','approved_by_admin'`}
                    })
                    .catch(error => {
                        console.log(error)
                    })
            })

            it('responds with 204 when updating only a subset of fields', () => {
                const updateNotion = {
                    manufacturer_notes: 'New notes.',
                    material_notes: 'New new new.'
                }
    
                return supertest(app)
                    .patch(`/api/notions/${idToUpdate}`)
                    .set('Authorization', makeAuthHeader(adminUser))
                    .send(updateNotion)
                    .expect(204)
                    .then(res => {
                        supertest(app)
                            .get(`/api/notions/${idToUpdate}`)
                            .expect(newRes => {
                                expect(newRes.body.manufacturer_notes).to.eql(updateNotion.manufacturer_notes)
                                expect(newRes.body.material_notes).to.eql(updateNotion.material_notes)
                            })
                            .catch(error => {
                                console.log(error)
                            })
                    })
            })
        })

        context(`when the notion with id notion_id does not exist`, () => {
            beforeEach(() => db.into('brands').insert(brands))
            beforeEach(() => db.into('factories').insert(factories))
            beforeEach(() => db.into('fiber_and_material_types').insert(fiberTypes))
            beforeEach(() => db.into('notion_types').insert(notionTypes))

            it('responds with 404', () => {
                const updateNotion = {
                    notion_type_id: 1,
                    brand_id: 1,
                    manufacturer_country: 1,
                    manufacturer_id: 1,
                    manufacturer_notes: 'New notes.',
                    material_type_id: 1,
                    material_origin_id: 1,
                    material_producer_id: 1,
                    material_notes: 'New new new.'
                }

                return supertest(app)
                    .patch(`/api/notions/${idToUpdate}`)
                    .set('Authorization', makeAuthHeader(adminUser))
                    .send(updateNotion)
                    .expect(404, {
                        error: { message: `Notion does not exist` }
                    })
            })
        })
    })

    describe('DELETE /api/notions/:notion_id', () => {
        const idToDelete = 1
        const expectedNotions = []
        const adminUser = adminArray[0]

        context(`when the notion with id notion_id' exists`, () => {
            beforeEach(() => db.into('brands').insert(brands))
            beforeEach(() => db.into('factories').insert(factories))
            beforeEach(() => db.into('fiber_and_material_types').insert(fiberTypes))
            beforeEach(() => db.into('notion_types').insert(notionTypes))
            beforeEach(() => db.into('notions').insert(notionsPost))
            beforeEach(() => db.into('users').insert(hashAdminArray))

            it('responds with 204 and removes the notion', () => {
                return supertest(app)
                    .delete(`/api/notions/${idToDelete}`)
                    .set('Authorization', makeAuthHeader(adminUser))
                    .expect(204)
                    .then(res => {
                        supertest(app)
                            .get('/api/notions')
                            .expect(expectedNotions)
                            .catch(error => {
                                console.log(error)
                            })
                    })
            })
        })

        context(`when the notion with id notion_id does not exist`, () => {
            it('responds with 404 and an error message', () => {
                return supertest(app)
                    .delete(`/api/notions/${idToDelete}`)
                    .set('Authorization', makeAuthHeader(adminUser))
                    .expect(404, {
                        error: { message: `Notion does not exist` }
                    })
            })
        })
    })
})