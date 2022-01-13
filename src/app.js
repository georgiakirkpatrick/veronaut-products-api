require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const { NODE_ENV } = require('./config')
// const authRouter = require('./authentication/auth-router')
const brandsRouter = require('./brands/brands-router')
const categoriesRouter = require('./categories/categories-router')
const certificationsRouter = require('./certifications/certifications-router')
const fabricsRouter = require('./fabrics/fabrics-router')
const factoriesRouter = require('./factories/factories-router')
const fibersRouter = require('./fibers/fibers-router')
const notionsRouter = require('./notions/notions-router')
const productsRouter = require('./products/products-router')
const usersRouter = require('./users/users-router')
const app = express()

const morganOption = (NODE_ENV === 'production')
    ? 'tiny'
    : 'common'
 
app.use(morgan(morganOption))
app.use(helmet())
app.use(cors())

// app.use('/api/login', authRouter)
app.use('/api/brands', brandsRouter)
app.use('/api/categories', categoriesRouter)
app.use('/api/certifications', certificationsRouter)
app.use('/api/fabrics', fabricsRouter)
app.use('/api/factories', factoriesRouter)
app.use('/api/fibers', fibersRouter)
app.use('/api/notions', notionsRouter)
app.use('/api/products', productsRouter)
app.use('/api/users', usersRouter)

app.get('/', (req, res) => {
    res.send('Hello, world!')
})

app.use(function errorHandler(error, req, res, next) {
    let response
    if (process.env.NODE_ENV === 'production') {
        response = { error: { message: 'server error' } }
    } else {
        response = { error: { message: 'server error' } }
    }
    console.error(error)
    res.status(500).json(response)
})

module.exports = app