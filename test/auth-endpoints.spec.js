const app = require('../src/app')
const { expect } = require('chai')
const knex = require('knex')
const jwt = require('jsonwebtoken')
const supertest = require('supertest')

const {hashedUserArray, makeUserArray} = require('./users.fixtures')

describe('Auth Endpoints', () => {
    const hashUserArray = hashedUserArray()
    const hashedUser = hashUserArray[0]
    const user = makeUserArray()[0]

    let db

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DATABASE_URL,
        })
        app.set('db', db)
    })

    after('disconnect from db', () => db.destroy())

    before('clean the table', () => db.raw(
        `TRUNCATE table users RESTART IDENTITY CASCADE`
    ))

    afterEach('clean the table', () => db.raw(
        `TRUNCATE table users RESTART IDENTITY CASCADE`
    ))

    describe('POST /api/auth/login', () => {
        beforeEach(() => db.into('users').insert(hashUserArray))

        const requiredFields = ['email', 'password']

        requiredFields.forEach(field => {
            const loginAttemptBody = {
                email: hashedUser.email,
                password: hashedUser.password
            }

            it(`responds with 400 required error when '${field}' is missing`, () => {
                delete loginAttemptBody[field]

                return supertest(app)
                    .post('/api/auth/login')
                    .send(loginAttemptBody)
                    .expect(400, {"error":`Missing '${field}' in request body`})
            })
        })

        it(`responds 400 'incorrect email or password' when the email is incorrect`, () => {
            const invalidUser = { email: 'not-a-user', password: user.password }

            return supertest(app)
                .post('/api/auth/login')
                .send(invalidUser)
                .expect(400, { error: `Incorrect email or password` })
        })

        it('responds with 200 and JWT auth token using secret when provided valid credentials', function () {
            this.retries(3)
            
            const userValidCreds = {
                email: hashedUser.email,
                password: hashedUser.password
            }

            const expectedToken = jwt.sign(
                { user_id: user.id },
                process.env.JWT_SECRET,
                {
                    subject: user.email,
                    algorithm: 'HS256'
                }
            )

            return supertest(app)
                .post('/api/auth/login')
                .send(userValidCreds)
                .expect({ authToken: expectedToken })
        })
    })
})