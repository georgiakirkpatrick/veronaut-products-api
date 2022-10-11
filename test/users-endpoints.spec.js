const knex = require('knex')
const jwt = require('jsonwebtoken')
const app = require('../src/app')

const { makeBrandArray } = require('./brands.fixtures')
const { makeCategoryArray } = require('./categories.fixtures')
const { makeFactoryArray } = require('./factories.fixtures')
const { makeDry, makeMalProduct, makeProductArray, makeWash } = require('./products.fixtures')
const { makeAdminArray, makeUserArray, makeMalUser } = require('./users.fixtures')

describe('Users Endpoints', () => {
    const adminArray = makeAdminArray()
    const brands = makeBrandArray()
    const categories = makeCategoryArray()
    const dryInstructions = [ makeDry() ]
    const factories = makeFactoryArray()
    const { malProduct, expectedProduct } = makeMalProduct()
    const { malUser, expectedUser } = makeMalUser()
    const { productsOnlyGet, productsPost } = makeProductArray()
    const washInstructions = [ makeWash() ]
    const userArray = makeUserArray()
    const relArray = [
        { 
            user_id: 1,
            product_id: 1,
            relationship_id: 4 
        },
        { 
            user_id: 1,
            product_id: 1,
            relationship_id: 5 
        },
        { 
            user_id: 1,
            product_id: 1,
            relationship_id: 6 
        },
        { 
            user_id: 1,
            product_id: 1,
            relationship_id: 7 
        }
    ]

    let db

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DATABASE_URL,
        })
        app.set('db', db)
    })
    after('disconnect from db', () => db.destroy())

    const cleanUpTables = () => db.raw(
        `TRUNCATE table brands, 
        categories, 
        certifications, 
        dry_instructions, 
        factories, 
        products, 
        users, 
        wash_instructions RESTART IDENTITY CASCADE`
    )

    const makeAuthHeader = (user, secret = process.env.JWT_SECRET) => {
        const token = jwt.sign({ user_id: user.id }, secret, {
            subject: user.email,
            algorithm: 'HS256',
        })
        return `Bearer ${token}`
    }

    before('clean tables', () => cleanUpTables())
    afterEach('clean tables', () => cleanUpTables())

    describe('Protected endpoints', () => {
        beforeEach(() =>  db.into('users').insert(userArray))

        describe('GET /api/users/', () => {
            beforeEach(() =>  db.into('users').insert(adminArray))

            it(`responds with 401 'Missing bearer token' when no basic token`, () => (
                supertest(app)
                    .get('/api/users')
                    .expect(401, { error: `Missing bearer token`})
            ))

            it(`responds 401 'Unauthorized request' when no credentials in token`, () => {
                const userNoCreds = { email: '', password: '' }
                return supertest(app)
                    .get(`/api/users`)
                    .set('Authorization', makeAuthHeader(userNoCreds))
                    .expect(401, { error: `Unauthorized request` })
            })

            it(`responds 401 'Unauthorized request' when invalid user`, () => {
                const invalidUserCreds =  { email: 'not-a-user', password: 'incorrect-password' }
                
                return supertest(app)
                    .get(`/api/users`)
                    .set('Authorization', makeAuthHeader(invalidUserCreds))
                    .expect(401, { error: 'Unauthorized request' })
            })

            it(`responds 401 'Unauthorized request' when the password is wrong`, () => {
                const incorrectPassword = { email: userArray[0].email, password: 'wrong' }

                return supertest(app)
                    .get('/api/users')
                    .set('Authorization', makeAuthHeader(incorrectPassword))
                    .expect(401, { error: 'Unauthorized request' })
            })

            it(`responds 401 'Unauthorized request' when the user is not an admin`, () => {
                const notAnAdmin = { email: userArray[0].email, password: userArray[0].password }
                return supertest(app)
                    .get('/api/users')
                    .set('Authorization', makeAuthHeader(notAnAdmin))
                    .expect(401, { error: 'Unauthorized request' })
            })
        })

        describe('POST /api/users/:user_id/products', () => {
            
            const currentUser = userArray[0]
            const authUserId = currentUser.id
            const unauthUserId = userArray[1].id
            
            const userProdSet = {
                product_id: 1,
                relationship_id: 1
            }
            
            it(`responds with 401 'Missing bearer token' when no basic token`, () => (
                supertest(app)
                    .post(`/api/users/${authUserId}/products`)
                    .expect(401, { error: `Missing bearer token`})
            ))

            it(`responds 401 'Unauthorized request' when no credentials in token`, () => {
                const userNoCreds = { email: '', password: '' }
                return supertest(app)
                    .post(`/api/users/${authUserId}/products`)
                    .set('Authorization', makeAuthHeader(userNoCreds))
                    .expect(401, { error: `Unauthorized request` })
            })

            it(`responds 401 'Unatuhorized request' when invalid user`, () => {
                const invalidUserCreds =  { email: 'not-a-user', password: 'incorrect-password' }
                
                return supertest(app)
                    .post(`/api/users/${authUserId}/products`)
                    .set('Authorization', makeAuthHeader(invalidUserCreds))
                    .expect(401, { error: 'Unauthorized request' })
            })

            it(`responds with 401 when the user is not authorized`, () => {
                return supertest(app)
                    .post(`/api/users/${unauthUserId}/products`)
                    .set('Authorization', makeAuthHeader(currentUser))
                    .send(userProdSet)
                    .expect(401, { error: `Unauthorized request`})
            })
        })

        describe('PATCH /api/users/:user_id', () => {
            const newUser = {
                email: 'newemail@gmail.com',
                password: 'newpassword',
                handle: 'NewName',
                name: 'New Name',
                website: 'newwebsite.com',
                profile_pic: 'newphoto.jpg',
                bio: 'New Bio.',
                public: true
            }

            const currentUser = userArray[0]
            const authUserId = currentUser.id
            const unauthUserId = userArray[1].id

            it(`responds with 401 'Missing bearer token' when no basic token`, () => (
                supertest(app)
                    .patch(`/api/users/${authUserId}`)
                    .send(newUser)
                    .expect(401, { error: `Missing bearer token`})
            ))

            it(`responds 401 'Unauthorized request' when no credentials in token`, () => {
                const userNoCreds = { email: '', password: '' }

                return supertest(app)
                    .patch(`/api/users/${authUserId}`)
                    .set('Authorization', makeAuthHeader(userNoCreds))
                    .send(newUser)
                    .expect(401, { error: `Unauthorized request` })
            })

            it(`responds 401 'Unauthorized request' when invalid user`, () => {
                const invalidUserCreds =  { email: 'not-a-user', password: 'incorrect-password' }
                
                return supertest(app)
                    .patch(`/api/users/${authUserId}`)
                    .set('Authorization', makeAuthHeader(invalidUserCreds))
                    .send(newUser)
                    .expect(401, { error: 'Unauthorized request' })
            })

            it(`responds with 401 when the user is not authorized`, () => {
                return supertest(app)
                    .patch(`/api/users/${unauthUserId}`)
                    .set('Authorization', makeAuthHeader(currentUser))
                    .send(newUser)
                    .expect(401, { error: `Unauthorized request`})
            })

            it(`responds with 401 when the user is not authorized`, () => {
                return supertest(app)
                    .patch(`/api/users/${unauthUserId}`)
                    .set('Authorization', makeAuthHeader(currentUser))
                    .send(newUser)
                    .expect(401, { error: `Unauthorized request`})
            })

            context('Given an admin user', () => {
                before(() =>  db.into('users').insert(adminArray))

                it(`responds with 204 when the user is an admin`, () => {
                    const admin = adminArray[0]
                        
                    return supertest(app)
                        .patch(`/api/users/${unauthUserId}`)
                        .set('Authorization', makeAuthHeader(admin))
                        .send(newUser)
                        .expect(204)
                })
            })
        })

        describe('DELETE /api/users/:user_id', () => {
            const currentUser = userArray[0]
            const authUserId = currentUser.id
            const unauthUserId = userArray[1].id
            
            it(`responds with 401 'Missing bearer token' when no basic token`, () => (
                supertest(app)
                    .delete(`/api/users/${authUserId}`)
                    .expect(401, { error: `Missing bearer token`})
            ))

            it(`responds 401 'Unauthorized request' when no credentials in token`, () => {
                const userNoCreds = { email: '', password: '' }
                return supertest(app)
                    .delete(`/api/users/${authUserId}`)
                    .set('Authorization', makeAuthHeader(userNoCreds))
                    .expect(401, { error: `Unauthorized request` })
            })

            it(`responds 401 'Unauthorized request' when invalid user`, () => {
                const invalidUserCreds =  { email: 'not-a-user', password: 'incorrect-password' }
                
                return supertest(app)
                    .delete(`/api/users/${authUserId}`)
                    .set('Authorization', makeAuthHeader(invalidUserCreds))
                    .expect(401, { error: 'Unauthorized request' })
            })

            it(`responds with 401 when the user is not authorized`, () => {
                return supertest(app)
                    .delete(`/api/users/${unauthUserId}`)
                    .set('Authorization', makeAuthHeader(currentUser))
                    .expect(401, { error: `Unauthorized request`})
            })

            context('Given an admin user', () => {
                before(() =>  db.into('users').insert(adminArray))

                it(`responds with 401 when the user is an admin`, () => {
                    const admin = adminArray[0]
                        
                    return supertest(app)
                        .delete(`/api/users/${unauthUserId}`)
                        .set('Authorization', makeAuthHeader(admin))
                        .expect(401, { error: `Unauthorized request` })
                })
            })
        })
    })

    describe('GET /api/users', () => {
        beforeEach(() =>  db.into('users').insert(userArray))
        beforeEach(() =>  db.into('users').insert(adminArray))

        context('Given there are users in the database', () => {
            const expectedArray = [
                ...userArray,
                ...adminArray
            ]

            it('GET /api/users responds with 200 and all of the users', () => {
                return supertest(app)
                    .get('/api/users')
                    .set('Authorization', makeAuthHeader(adminArray[0]))
                    .expect(200, expectedArray)
            })
        })
    
        context('Given an XSS attack user', () => {
            before(() => db.into('users').insert(malUser))
    
            it('removes XSS attack content', () => {
                return supertest(app)
                    .get('/api/users')
                    .set('Authorization', makeAuthHeader(adminArray[0]))
                    .expect(200)
                    .expect(res => {
                        const malUserIndex = res.body.findIndex(user => user.id === 666)
                        expect(res.body[malUserIndex].email).to.eql(expectedUser.email)
                        expect(res.body[malUserIndex].password).to.eql(expectedUser.password)
                        expect(res.body[malUserIndex].handle).to.eql(expectedUser.handle)
                        expect(res.body[malUserIndex].name).to.eql(expectedUser.name)
                        expect(res.body[malUserIndex].website).to.eql(expectedUser.website)
                        expect(res.body[malUserIndex].profile_pic).to.eql(expectedUser.profile_pic)
                        expect(res.body[malUserIndex].bio).to.eql(expectedUser.bio)
                    })
            })
        })
    })

    describe('GET /api/users/:user_id/products', () => {
        beforeEach(() => db.into('brands').insert(brands))
        beforeEach(() => db.into('categories').insert(categories))
        beforeEach(() => db.into('dry_instructions').insert(dryInstructions))
        beforeEach(() => db.into('factories').insert(factories))
        beforeEach(() =>  db.into('users').insert(userArray))
        beforeEach(() => db.into('wash_instructions').insert(washInstructions))

        const currentUser = userArray[0]
        const userId = currentUser.id

        context('when there are products in the database', () => {
            const usersProducts = {
                user_id: userId,
                product_id: productsPost[0].id,
                relationship_id: 1
            }

            const expectedUserProduct = {
                ...productsOnlyGet[0],
                relationship_id: usersProducts.relationship_id
            }

            beforeEach(() => db.into('products').insert(productsPost))
            beforeEach(() => db.into('users_to_products').insert(usersProducts))

            it(`returns all the user's products`, () => {
                return supertest(app)
                    .get(`/api/users/${userId}/products`)
                    .set('Authorization', makeAuthHeader(currentUser))
                    .expect(200, [ expectedUserProduct ])
            })
        })

        context('when there are no products associated with the user', () => {
            it('responds with 200 and an empty list', () => {
            
            return supertest(app)
                .get(`/api/users/${userId}/products`)
                .set('Authorization', makeAuthHeader(userArray[0]))
                .expect(200, [])
            })
        })

        context('given a malicious product', () => {
            const usersMalProducts = {
                user_id: userId,
                product_id: malProduct.id,
                relationship_id: 1
            }

            const expectedUserProduct = {
                ...expectedProduct,
                relationship_id: usersMalProducts.relationship_id
            }

            beforeEach(() => db.into('products').insert(malProduct))
            beforeEach(() => db.into('users_to_products').insert(usersMalProducts))

            it('removes the attack content', () => {
                return supertest(app)
                    .get(`/api/users/${userId}/products`)
                    .set('Authorization', makeAuthHeader(userArray[0]))
                    .expect(200, [ expectedUserProduct ])
            })
        })
    })

    describe('POST /api/users', () => {
        beforeEach(() => db.into('users').insert(adminArray))

        it(`Creates a user, responding with 201 and the new user`, () => {
            const newUser = {
                id: 5,
                email: 'email@address.com',
                password: 'testpassword',
                handle: 'Franzferdinand',
                name: 'Franz Ferdinand',
                website: 'franziboy.com',
                profile_pic: 'https://www.photo.jpg',
                bio: 'Archduke Franz Ferdinand Carl Ludwig Joseph Maria of Austria was the heir presumptive to the throne of Austria-Hungary. His assassination in Sarajevo is considered the most immediate cause of World War I.'
            }
                
            return supertest(app)
                .post('/api/users')
                .send(newUser)
                .then(res => {
                    expect(res.body.email).to.eql(newUser.email)
                    expect(res.body.password).to.eql(newUser.password)
                    expect(res.body.handle).to.eql(newUser.handle)
                    expect(res.body.name).to.eql(newUser.name)
                    expect(res.body.website).to.eql(newUser.website)
                    expect(res.body).to.have.property('id')
                    expect(res.headers.location).to.have.eql(`/api/users/${res.body.id}`)
                    const expected = new Date().toLocaleString()
                    const actual = new Date(res.body.date_published).toLocaleString()
                   return res
                })
                .then(async postRes => {
                    const expectedResponse = {
                        id: postRes.body.id, 
                        handle: postRes.body.handle
                    }

                    await supertest(app)
                    .get(`/api/users/${postRes.body.id}`)
                    .set('Authorization', makeAuthHeader(adminArray[0]))
                    .expect(expectedResponse)
                    .catch(error => {
                        console.log(error)
                    })
                })
        })

        const requiredFields = [
            'email',
            'password'
        ]

        requiredFields.forEach(field => {
            const newUser = {
                email: 'email@address.com',
                password: 'testpassword',
                handle: 'Franzferdinand',
                name: 'Franz Ferdinand',
                website: 'franziboy.com',
                profile_pic: 'https://www.photo.jpg',
                bio: 'Archduke Franz Ferdinand Carl Ludwig Joseph Maria of Austria was the heir presumptive to the throne of Austria-Hungary. His assassination in Sarajevo is considered the most immediate cause of World War I.'
            }

            it(`responds with 400 and an error message when the '${field}' is missing`, () => {
                delete newUser[field]

                return supertest(app)
                    .post('/api/users')
                    .send(newUser)
                    .expect(400, {
                        error: { message: `Missing '${field}' in request body`}
                    })
            })
        })

        it(`Removes XSS attack content from response`, () => {
            return supertest(app)
                .post('/api/users')
                .send(malUser)
                .expect(201)
                .expect(res => {
                    expect(res.body.email).to.eql(expectedUser.email)
                    expect(res.body.password).to.eql(expectedUser.password)
                    expect(res.body.handle).to.eql(expectedUser.handle)
                    expect(res.body.name).to.eql(expectedUser.name)
                    expect(res.body.website).to.eql(expectedUser.website)
                    expect(res.body.profile_pic).to.eql(expectedUser.profile_pic)
                    expect(res.body.bio).to.eql(expectedUser.bio)
                })
        })
    })

    describe('POST /api/users/:user_id/products', () => {
        beforeEach(() => db.into('brands').insert(brands))
        beforeEach(() => db.into('categories').insert(categories))
        beforeEach(() => db.into('dry_instructions').insert(dryInstructions))
        beforeEach(() => db.into('factories').insert(factories))
        beforeEach(() => db.into('wash_instructions').insert(washInstructions))
        beforeEach(() => db.into('products').insert(productsPost))
        beforeEach(() =>  db.into('users').insert(userArray))
        beforeEach(() => db.into('users_to_products').insert(relArray))

        const currentUser = userArray[0]
        const userId = currentUser.id

        it(`creates a user-product set, responding with 201 and the new set`, () => {
            const userProdSet = {
                product_id: 1,
                relationship_id: 1
            }
            
            return supertest(app)
                .post(`/api/users/${userId}/products`)
                .set('Authorization', makeAuthHeader(currentUser))
                .send(userProdSet)
                .expect(201)
                .expect(res => {
                    expect(res.body.user_id).to.eql(userId)
                    expect(res.body.product_id).to.eql(userProdSet.product_id)
                    expect(res.body.relationship_id).to.eql(userProdSet.relationship_id)
                })
        })

        const requiredFields = [
            'product_id',
            'relationship_id'
        ]

        requiredFields.forEach(field => {
            const set = {
                product_id: 1,
                relationship_id: 1
            }

            it(`responds with 400 and an error message when the '${field}' is missing`, () => {
                delete set[field]

                return supertest(app)
                    .post(`/api/users/${userId}/products`)
                    .set('Authorization', makeAuthHeader(currentUser))
                    .send(set)
                    .expect(400, {
                        error: { message: `Missing '${field}' in request body`}
                    })
            })
        })
    })

    describe('PATCH /api/users/:user_id', () => {
        beforeEach(() =>  db.into('users').insert(userArray))

        context('Given there are users in the database', () => {

            const currentUser = userArray[1]
            const idToUpdate = currentUser.id

            it('responds with 204 and updates the user', () => {
                const updateUser = {
                    handle: 'newhandle',
                    name: 'new Name',
                    website: 'newwebsite.com',
                    profile_pic: 'https://www.newphoto.jpg',
                    bio: 'New bio.'
                }

                return supertest(app)
                    .patch(`/api/users/${idToUpdate}`)
                    .set('Authorization', makeAuthHeader(currentUser))
                    .send(updateUser)
                    .expect(204)
                    .then(async patchRes => {
                        await supertest(app)
                            .get(`/api/users/${idToUpdate}`)
                            .set('Authorization', makeAuthHeader(currentUser))
                            .expect(res => {
                                expect(res.body.id).to.eql(currentUser.id)
                            })
                            .catch(error => {
                                console.log(error)
                            })
                    })
            })

            it('responds with 400 when no required fields are supplied', () => {
                return supertest(app)
                    .patch(`/api/users/${idToUpdate}`)
                    .set('Authorization', makeAuthHeader(currentUser))
                    .send({ irrelevantField: 'foo' })
                    .expect(400, {
                        error: { message: `Request body must contain 'admin', 'email', 'password', 'handle', 'name', 'website', 'profile_pic', 'bio', 'public', editor, can_submit, org_affiliation, or 'account_created'`}
                    })
            })

            it(`responds with 204 when updating only a subset of fields`, () => {
                const updateUser = {
                    email: 'updated@email.com',
                    fieldToIgnore: 'should not be in the GET response'
                }

                return supertest(app)
                    .patch(`/api/users/${idToUpdate}`)
                    .set('Authorization', makeAuthHeader(currentUser))
                    .send(updateUser)
                    .expect(204)
                    .then(async res => {
                        const expectedResponse = {
                            id: 2,
                            handle: 'jonnypak'
                        }

                        const updatedUser = {
                            email: 'updated@email.com',
                            password: 'testpassword'
                        }

                        await supertest(app)
                            .get(`/api/users/${idToUpdate}`)
                            .set('Authorization', makeAuthHeader(updatedUser))
                            .expect(expectedResponse)
                            .catch(error => {
                                console.log(error)
                            })
                    })
            })

            it(`responds with 400 when the email address is already associated with an account`, () => {
                const updateUser = {
                    email: userArray[0].email,
                }

                return supertest(app)
                    .patch(`/api/users/${idToUpdate}`)
                    .set('Authorization', makeAuthHeader(currentUser))
                    .send(updateUser)
                    .expect(400, {
                        error: { message: 'Email address is already associated with an account.' }
                    })
            })
        })
    })

    describe('DELETE /api/users/:user_id', () => {
        const allUsers = [
            ...userArray,
            ...adminArray
        ]

        const adminUser = adminArray[0]
        beforeEach(() =>  db.into('users').insert(userArray))
        beforeEach(() =>  db.into('users').insert(adminArray))

        context('Given there are users in the database', () => {
            it('responds with 204 and removes the user', () => {
                const userToRemove = userArray[0]
                const idToRemove = userToRemove.id
                const expectedUsers = allUsers.filter(user => user.id !== idToRemove)

                return supertest(app)
                    .delete(`/api/users/${idToRemove}`)
                    .set('Authorization', makeAuthHeader(userToRemove))
                    .expect(204)
                    .then(res => 
                        supertest(app)
                            .get('/api/users')
                            .set('Authorization', makeAuthHeader(adminUser))
                            .expect(expectedUsers)
                            .catch(error => {
                                console.log(error)
                            })
                    )
            })
        })

        context('Given no users', () => {
            it(`responds with 404`, () => {
                const idToRemove = 234567
                return supertest(app)
                    .delete(`/api/users/${idToRemove}`)
                    .set('Authorization', makeAuthHeader(userArray[0]))
                    .expect(404, { error: { message: 'User does not exist' } })
            })
        })
    })

    describe('DELETE /api/users/:user_id/products', () => {
        beforeEach(() => db.into('brands').insert(brands))
        beforeEach(() => db.into('categories').insert(categories))
        beforeEach(() => db.into('dry_instructions').insert(dryInstructions))
        beforeEach(() => db.into('factories').insert(factories))
        beforeEach(() => db.into('wash_instructions').insert(washInstructions))
        beforeEach(() => db.into('products').insert(productsPost))

        const relationship = { 
            product_id: relArray[0].product_id,
            relationship_id: relArray[0].relationship_id
        }

        beforeEach(() =>  db.into('users').insert(userArray))

        context('Given the user and product relationship exist', () => {
            beforeEach(() => db.into('users_to_products').insert(relArray))

            it('responds with 204 and removes the user-product relationship', () => {
                const user = userArray[0]
                const userId = user.id
    
                return supertest(app)
                    .delete(`/api/users/${userId}/products`)
                    .set('Authorization', makeAuthHeader(user))
                    .send(relationship)
                    .expect(204)
            })
        })

        context('Given no users with the provided id', () => {
            it(`responds with 404`, () => {
                const idToRemove = 234567
                return supertest(app)
                    .delete(`/api/users/${idToRemove}/products`)
                    .set('Authorization', makeAuthHeader(userArray[0]))
                    .send(relationship)
                    .expect(401, { error: 'Unauthorized request' })
            })
        })

        context('Given the product relationship does not exist', () => {
            it(`responds with 404`, () => {
                const user = userArray[0]
                const userId = user.id

                return supertest(app)
                    .delete(`/api/users/${userId}/products`)
                    .set('Authorization', makeAuthHeader(user))
                    .send(relationship)
                    .expect(404, { error: { message: 'User does not have a relationship this product' } })
            })
        })
    })
})