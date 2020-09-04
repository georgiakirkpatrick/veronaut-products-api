const { expect } = require('chai')
const knex = require('knex')
const app = require('../src/app')
const supertest = require('supertest')
const { makeCategoriesArray } = require('./categories.fixtures')

describe('GET /categories', function() {
    let db

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL,
        })
        app.set('db', db)
    })

    after('disconnect from db', () => db.destroy())

    before('clean the table', () => db('categories').truncate())

    afterEach('cleanup', () => db('categories').truncate())

    context('Given there are categories in the database', () => {
        const testCategories = makeCategoriesArray()

        beforeEach('insert categories', () => {
            return db
                .into('categories')
                .insert(testCategories)
        })

        it('GET /categories responds with 200 and all of the categories'), () => {
            return supertest(app)
                .get('/categories')
                .expect(200, testCategories)
        }
    })

    context('Given no categories', () => {
        it('responds with 200 and an empty list', () => {
            return supertest(app)
                .get('/categories')
                .expect(200, [])
        })
    })
})