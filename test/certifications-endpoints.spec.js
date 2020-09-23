const knex = require('knex')
const app = require('../src/app')
const { makeCertificationsArray, makeMaliciousCertification } = require('./certifications.fixtures')
const supertest = require('supertest')
const { expect } = require('chai')

describe('Certifications Endpoints', function() {
    let db

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL,
        })
        app.set('db', db)
    })

    after('disconnect from db', () => db.destroy())

    before('clean the table', () => db.raw('TRUNCATE table certifications RESTART IDENTITY CASCADE'))
    
    afterEach('cleanup', () => db.raw('TRUNCATE table certifications RESTART IDENTITY CASCADE'))
})