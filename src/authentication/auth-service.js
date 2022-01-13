const AuthService = {
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
    }
}

module.exports = AuthService