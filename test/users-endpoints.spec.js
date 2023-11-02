describe('Users Endpoints', () => {
    const app = require('../src/app')
    const { expect } = require('chai')
    const knex = require('knex')
    const jwt = require('jsonwebtoken')
    const supertest = require('supertest')
    const { hashedAdminArray, hashedUserArray } = require('./users.fixtures')
    const { makeBrand, makeMalBrand } = require('./brands.fixtures')
    const { makeCategoryArray } = require('./categories.fixtures')
    const { makeFactory } = require('./factories.fixtures')
    const { makeDry, makeMalProduct, makeProduct, makeWash } = require('./products.fixtures')
    const { makeAdminArray, makeUserArray, makeMalUser } = require('./users.fixtures')
    const { brandInsert } = makeBrand()
    const { malBrandInsert } = makeMalBrand()
    const { categoriesInsert } = makeCategoryArray()
    const { malProdPost, malProdInsert, malProdGet } = makeMalProduct()
    const { malUser, expectedUser } = makeMalUser()
    const { prodOnlyGet, productPost } = makeProduct()
    const admin = makeAdminArray()[0]
    const currentUser = makeUserArray()[0]
    const dryInstructions = [ makeDry() ]
    const factory = makeFactory()
    const hashAdminArray = hashedAdminArray()
    const hashUserArray = hashedUserArray()
    const washInstructions = [ makeWash() ]
    const user = makeUserArray()[0]

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

    const cleanAllTables = () => db.raw(
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

    before('clean all tables', () => cleanAllTables())
    afterEach('clean all tables', () => cleanAllTables())

    describe('Protected endpoints', () => {
        describe('GET /api/users/', () => {
            it(`responds with 401 'Missing bearer token' when no bearer token is provided`, () => (
                supertest(app)
                    .get('/api/users')
                    .expect(401, { error: 'Missing bearer token'})
            ))

            it(`responds with 401 and 'Unauthorized request' when no credentials are in the token`, () => {
                const userNoCreds = { email: '', password: '' }
                return supertest(app)
                    .get(`/api/users`)
                    .set('Authorization', makeAuthHeader(userNoCreds))
                    .expect(401, { error: 'Unauthorized request' })
            })

            it(`responds with 401 and 'Unauthorized request' when the JWT secret is invalid`, () => {
                const invalidUserCreds =  { email: 'not-a-user', password: 'incorrect-password' }
                
                return supertest(app)
                    .get(`/api/users`)
                    .set('Authorization', makeAuthHeader(invalidUserCreds))
                    .expect(401, { error: 'Unauthorized request' })
            })

            it(`responds with 401 and 'Unauthorized request' when the user is not an admin`, () => {
                const notAnAdmin = { email: user.email, password: user.password }

                before(() =>  db.into('users').insert(hashAdminArray))

                return supertest(app)
                    .get('/api/users')
                    .set('Authorization', makeAuthHeader(notAnAdmin))
                    .expect(401, { error: 'Unauthorized request' })
            })
        })

        describe('PATCH /api/users/:user_id', () => {
            const userModification = {
                email: 'modified@gmail.com',
                password: 'modified',
                handle: 'ModifiedName',
                first_name: 'Modified Name',
                website: 'modifiedwebsite.com',
                profile_pic: 'modifiedphoto.jpg',
                bio: 'Modified Bio.',
                public: false
            }

            const authUserId = currentUser.id
            const unauthUserId = makeUserArray()[1].id

            beforeEach(() =>  db.into('users').insert(hashUserArray))

            it(`responds with 401 'Missing bearer token' when no bearer token is provided`, () => (
                supertest(app)
                    .patch(`/api/users/${authUserId}`)
                    .send(userModification)
                    .expect(401, { error: 'Missing bearer token'})
            ))

            it(`responds with 401 and 'Unauthorized request' when no credentials are in the token`, () => {
                const userNoCreds = { email: '', password: '' }

                return supertest(app)
                    .patch(`/api/users/${authUserId}`)
                    .set('Authorization', makeAuthHeader(userNoCreds))
                    .send(userModification)
                    .expect(401, { error: 'Unauthorized request' })
            })

            it(`responds with 401 and 'Unauthorized request' when the JWT secret is invalid`, () => {
                const invalidUserCreds =  { email: 'not-a-user', password: 'incorrect-password' }
                
                return supertest(app)
                    .patch(`/api/users/${authUserId}`)
                    .set('Authorization', makeAuthHeader(invalidUserCreds))
                    .send(userModification)
                    .expect(401, { error: 'Unauthorized request' })
            })

            it(`responds with 401 when the user is not authorized`, () => {
                return supertest(app)
                    .patch(`/api/users/${unauthUserId}`)
                    .set('Authorization', makeAuthHeader(currentUser))
                    .send(userModification)
                    .expect(401, { error: 'Unauthorized request'})
            })
        })

        describe('DELETE /api/users/:user_id', () => {
            beforeEach(() =>  db.into('users').insert(hashUserArray))
            
            const authUserId = currentUser.id
            const unauthUserId = makeUserArray()[1].id

            it(`responds with 401 'Missing bearer token' when no bearer token is provided`, () => (
                supertest(app)
                    .delete(`/api/users/${authUserId}`)
                    .expect(401, { error: 'Missing bearer token'})
            ))

            it(`responds with 401 and 'Unauthorized request' when no credentials are in the token`, () => {
                const userNoCreds = { email: '', password: '' }
                return supertest(app)
                    .delete(`/api/users/${authUserId}`)
                    .set('Authorization', makeAuthHeader(userNoCreds))
                    .expect(401, { error: 'Unauthorized request' })
            })

            it(`responds with 401 and 'Unauthorized request' when the JWT secret is invalid`, () => {
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
                    .expect(401, { error: 'Unauthorized request'})
            })

            context('Given an admin user', () => {
                before(() =>  db.into('users').insert(hashAdminArray))

                it(`responds with 401 when the user is not an admin`, () => {                        
                    return supertest(app)
                        .delete(`/api/users/${unauthUserId}`)
                        .set('Authorization', makeAuthHeader(user))
                        .expect(401, { error: 'Unauthorized request' })
                })
            })
        })
    })

    describe('GET /api/users', () => {
        beforeEach(() =>  db.into('users').insert(hashUserArray))
        beforeEach(() =>  db.into('users').insert(hashAdminArray))

        context('Given there are users in the database', () => {
            const expectedArray = [
                ...hashUserArray,
                ...hashAdminArray
            ]

            it('GET /api/users responds with 200 and all of the users', () => {
                return supertest(app)
                    .get('/api/users')
                    .set('Authorization', makeAuthHeader(admin))
                    .expect(200, expectedArray)
            })
        })
    
        context('Given an XSS attack user', () => {
            before(() => db.into('users').insert(malUser))
    
            it('removes the attack content', () => {
                return supertest(app)
                    .get('/api/users')
                    .set('Authorization', makeAuthHeader(admin))
                    .expect(200)
                    .expect(res => {
                        const malUserIndex = res.body.findIndex(user => user.id === 666)
                        expect(res.body[malUserIndex].email).to.eql(expectedUser.email)
                        expect(res.body[malUserIndex].password).to.eql(expectedUser.password)
                        expect(res.body[malUserIndex].handle).to.eql(expectedUser.handle)
                        expect(res.body[malUserIndex].first_name).to.eql(expectedUser.first_name)
                        expect(res.body[malUserIndex].website).to.eql(expectedUser.website)
                        expect(res.body[malUserIndex].profile_pic).to.eql(expectedUser.profile_pic)
                        expect(res.body[malUserIndex].bio).to.eql(expectedUser.bio)
                    })
            })
        })
    })

    describe('GET /api/users/:user_id/products', () => {
        beforeEach(() => db.into('brands').insert(brandInsert))
        beforeEach(() => db.into('categories').insert(categoriesInsert))
        beforeEach(() => db.into('dry_instructions').insert(dryInstructions))
        beforeEach(() => db.into('factories').insert(factoryInsert))
        beforeEach(() =>  db.into('users').insert(hashUserArray))
        beforeEach(() => db.into('wash_instructions').insert(washInstructions))

        const userId = currentUser.id

        context('when there are products in the database', () => {
            const usersProducts = {
                user_id: userId,
                product_id: productPost.id,
                relationship_id: 1
            }

            const expectedUserProduct = {
                ...prodOnlyGet[0],
                relationship_id: usersProducts.relationship_id
            }

            beforeEach(() => db.into('products').insert(productInsert))
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
                .set('Authorization', makeAuthHeader(user))
                .expect(200)
                .expect([])
            })
        })

        context('given a malicious product', () => {
            const usersMalProducts = {
                user_id: userId,
                product_id: malProdInsert.id,
                relationship_id: 1
            }

            const expectedUserProduct = {
                ...malProdGet,
                relationship_id: usersMalProducts.relationship_id
            }
            beforeEach(() => db.into('brands').insert(malBrandInsert))
            beforeEach(() => db.into('products').insert(malProdInsert))
            beforeEach(() => db.into('users_to_products').insert(usersMalProducts))

            it('removes the attack content', () => {
                return supertest(app)
                    .get(`/api/users/${userId}/products`)
                    .set('Authorization', makeAuthHeader(user))
                    .expect(200, [ expectedUserProduct ])
            })
        })
    })

    describe('POST /api/users', () => {
        beforeEach(() => db.into('users').insert(hashAdminArray))

        context(`User Validation`, () => {
            const requiredFields = [
                'email',
                'password'
            ]

            requiredFields.forEach(field => {
                const newUser = {
                    email: 'email@address.com',
                    password: 'testpassword',
                    handle: 'Franzferdinand',
                    first_name: 'Franz',
                    last_name: 'Ferdinand',
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
        })

        it(`Creates a user, responding with 201 and the new user`, () => {
            const newUser = {
                // id: 5,
                email: 'email@address.com',
                password: 'testpassword',
                handle: 'Franzferdinand',
                first_name: 'Franz',
                last_name: 'Ferdinand',
                website: 'franziboy.com',
                profile_pic: 'https://www.photo.jpg',
                bio: 'Archduke Franz Ferdinand Carl Ludwig Joseph Maria of Austria was the heir presumptive to the throne of Austria-Hungary. His assassination in Sarajevo is considered the most immediate cause of World War I.',
                org_affliation: 'Control Union'
            }
                
            return supertest(app)
                .post('/api/users')
                .send(newUser)
                .then(res => {
                    expect(res.body.email).to.eql(newUser.email)
                    expect(res.body.password).to.eql(newUser.password)
                    expect(res.body.handle).to.eql(newUser.handle)
                    expect(res.body.first_name).to.eql(newUser.first_name)
                    expect(res.body.last_name).to.eql(newUser.last_name)
                    expect(res.body.website).to.eql(newUser.website)
                    expect(res.body).to.have.property('id')
                    expect(res.headers.location).to.have.eql(`/api/users/${res.body.id}`)
                    const expected = new Date().toLocaleString()
                    const actual = new Date(res.body.created_at).toLocaleString()
                    expect(expected).to.eql(actual)
                    return res
                })
                .then(async postRes => {
                    const expectedResponse = {
                        id: postRes.body.id, 
                        handle: postRes.body.handle
                    }

                    await supertest(app)
                    .get(`/api/users/${postRes.body.id}`)
                    .set('Authorization', makeAuthHeader(admin))
                    .expect(expectedResponse)
                    .catch(error => {
                        console.log(error)
                    })
                })
        })
        
        it(`removes the attack content from the response`, () => {
            return supertest(app)
                .post('/api/users')
                .send(malUser)
                .expect(201)
                .expect(res => {
                    expect(res.body.email).to.eql(expectedUser.email)
                    expect(res.body.password).to.eql(expectedUser.password)
                    expect(res.body.handle).to.eql(expectedUser.handle)
                    expect(res.body.first_name).to.eql(expectedUser.first_name)
                    expect(res.body.last_name).to.eql(expectedUser.last_name)
                    expect(res.body.website).to.eql(expectedUser.website)
                    expect(res.body.profile_pic).to.eql(expectedUser.profile_pic)
                    expect(res.body.bio).to.eql(expectedUser.bio)
                })
        })
    })

    describe('POST /api/users/:user_id/products', () => {
        beforeEach(() => db.into('brands').insert(brandInsert))
        beforeEach(() => db.into('categories').insert(categoriesInsert))
        beforeEach(() => db.into('dry_instructions').insert(dryInstructions))
        beforeEach(() => db.into('factories').insert(factoryInsert))
        beforeEach(() => db.into('wash_instructions').insert(washInstructions))
        beforeEach(() => db.into('products').insert(productInsert))
        beforeEach(() =>  db.into('users').insert(hashUserArray))
        beforeEach(() => db.into('users_to_products').insert(relArray))

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
        beforeEach(() => db.into('brands').insert(brandInsert))
        beforeEach(() => db.into('categories').insert(categoriesInsert))
        beforeEach(() => db.into('dry_instructions').insert(dryInstructions))
        beforeEach(() => db.into('factories').insert(factoryInsert))
        beforeEach(() => db.into('wash_instructions').insert(washInstructions))
        beforeEach(() => db.into('products').insert(productInsert))
        beforeEach(() =>  db.into('users').insert(hashUserArray))
        beforeEach(() => db.into('users_to_products').insert(relArray))

        context('Given there are users in the database', () => {
            const idToUpdate = currentUser.id

            it('responds with 204 and updates the user', () => {
                const updateUser = {
                    handle: 'newhandle',
                    first_name: 'new Name',
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
                        error: { message: `Request body must contain 'admin', 'email', 'password', 'handle', 'first_name', 'last_name', 'website', 'profile_pic', 'bio', 'public', editor, can_submit, org_affiliation, 'created_at', or 'updated_at'`}
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
                    email: user.email,
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
            ...hashUserArray,
            ...hashAdminArray
        ]

        beforeEach(() =>  db.into('users').insert(hashUserArray))
        beforeEach(() =>  db.into('users').insert(hashAdminArray))

        context('Given there are users in the database', () => {
            it('responds with 204 and removes the user', () => {
                const userToRemove = user
                const idToRemove = userToRemove.id
                const expectedUsers = allUsers.filter(user => user.id !== idToRemove)

                return supertest(app)
                    .delete(`/api/users/${idToRemove}`)
                    .set('Authorization', makeAuthHeader(userToRemove))
                    .expect(204)
                    .then(res => 
                        supertest(app)
                            .get('/api/users')
                            .set('Authorization', makeAuthHeader(admin))
                            .expect(expectedUsers)
                            .catch(error => {
                                console.log(error)
                            })
                    )
            })
        })

        context('Given no users', () => {
            it(`responds with 404 and an error message`, () => {
                const idToRemove = 234567
                return supertest(app)
                    .delete(`/api/users/${idToRemove}`)
                    .set('Authorization', makeAuthHeader(user))
                    .expect(404, { error: { message: 'User does not exist.' } })
            })
        })
    })

    describe('DELETE /api/users/:user_id/products', () => {
        beforeEach(() => db.into('brands').insert(brandInsert))
        beforeEach(() => db.into('categories').insert(categoriesInsert))
        beforeEach(() => db.into('dry_instructions').insert(dryInstructions))
        beforeEach(() => db.into('factories').insert(factoryInsert))
        beforeEach(() => db.into('wash_instructions').insert(washInstructions))
        beforeEach(() => db.into('products').insert(productInsert))

        const relationship = { 
            product_id: relArray[0].product_id,
            relationship_id: relArray[0].relationship_id
        }

        beforeEach(() =>  db.into('users').insert(hashUserArray))

        context('Given the user and product relationship exist', () => {
            beforeEach(() => db.into('users_to_products').insert(relArray))

            it('responds with 204 and removes the user-product relationship', () => {
                const userId = user.id
    
                return supertest(app)
                    .delete(`/api/users/${userId}/products`)
                    .set('Authorization', makeAuthHeader(user))
                    .send(relationship)
                    .expect(204)
            })
        })

        context('Given no users with the provided id', () => {
            it(`responds with 404 and an error message`, () => {
                const idToRemove = 234567
                return supertest(app)
                    .delete(`/api/users/${idToRemove}/products`)
                    .set('Authorization', makeAuthHeader(user))
                    .send(relationship)
                    .expect(401, { error: 'Unauthorized request' })
            })
        })

        context('Given the product relationship does not exist.', () => {
            it(`responds with 404 and an error message`, () => {
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