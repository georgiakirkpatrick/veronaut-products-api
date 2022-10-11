const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('../config')

const AuthService = {
    async comparePasswords(loginPassword, dbPassword) {
        const salt = bcrypt.genSaltSync(10)
        const hash = bcrypt.hashSync(dbPassword, salt)

        return bcrypt.compare(loginPassword, hash)
    },

    createJwt(subject, payload) {
        return jwt.sign(payload, config.JWT_SECRET, {
            subject,
            algorithm: 'HS256',
        })
    },

    getUserByEmail(knex, email) {
        return knex('users')
            .select('*')
            .where({ email })
            .first()
    },
    
    makeBasicAuthToken(email, password) {
        return window.btoa(`${email}:${password}`)
    },

    saveAuthToken(token) {
        window.localStorage.setItem(config.TOKEN_KEY, token)
    },
    verifyJwt(token) {
        return jwt.verify(token, config.JWT_SECRET, {
            algorithms: ['HS256']
        })
    }
}

module.exports = AuthService