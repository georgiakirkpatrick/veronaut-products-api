const AuthService = require('../authentication/auth-service')

const authUserAdmin = (req, res, next) => {
    const authToken = req.get('Authorization') || ''

    let basicToken

    if (!authToken.toLowerCase().startsWith('basic ')) {
        return res.status(401).json({ error: 'Missing basic token' })
    } else {
        basicToken = authToken.slice('basic '.length, authToken.length)
    }

    const [tokenUserEmail, tokenPassword] = Buffer
        .from(basicToken, 'base64')
        .toString()
        .split(':')

    if (!tokenUserEmail || !tokenPassword) {
        return res.status(401).json({ error: 'Unauthorized request'})
    }

    req.app.get('db')('users')
        .where({ email: tokenUserEmail })
        .first()
        .then(tokenUser => {
            if (!tokenUser) {
                return res.status(401).json({ error: 'Unauthorized request' })
            } else if ( res.user.id !== tokenUser.id && tokenUser.admin === false ) {
                return res.status(401).json({ error: 'Unauthorized request' })
            }
            
            return AuthService.comparePasswords(tokenPassword, tokenUser.password)
                .then(passwordsMatch => {
                    if (!passwordsMatch) {
                        return res.status(401).json({ error: 'Unauthorized request' })
                    }

                    res.tokenUser = tokenUser
                    next()
                })
        })
        .catch(error => {
            console.log(error)
            next()
        })
}

const confirmUser = (req, res, next) => {
    const authToken = req.get('Authorization') || ''

    let basicToken

    if (!authToken.toLowerCase().startsWith('basic ')) {
        return res.status(401).json({ error: 'Missing basic token' })
    } else {
        basicToken = authToken.slice('basic '.length, authToken.length)
    }

    const [tokenUserEmail, tokenPassword] = Buffer
        .from(basicToken, 'base64')
        .toString()
        .split(':')

    if (!tokenUserEmail || !tokenPassword) {
        return res.status(401).json({ error: 'Unauthorized request'})
    }

    req.app.get('db')('users')
        .where({ email: tokenUserEmail })
        .first()
        .then(tokenUser => {
            const userId = Number(req.params.user_id)

            if (!tokenUser) {
                return res.status(401).json({ error: 'Unauthorized request' })
            } else if (userId !== tokenUser.id) {
                return res.status(401).json({ error: 'Unauthorized request' })
            }

            return AuthService.comparePasswords(tokenPassword, tokenUser.password)
                .then(passwordsMatch => {
                    if (!passwordsMatch) {
                        return res.status(401).json({ error: 'Unauthorized request' })
                    }

                    res.tokenUser = tokenUser
                    next()
                })
        })
        .catch(error => {
            console.log(error)
            next()
        })
}

const requireAdmin = (req, res, next) => {
    const authToken = req.get('Authorization') || ''

    let basicToken

    if (!authToken.toLowerCase().startsWith('basic ')) {
        return res.status(401).json({ error: 'Missing basic token' })
    } else {
        basicToken = authToken.slice('basic '.length, authToken.length)
    }

    const [tokenUserEmail, tokenPassword] = Buffer
        .from(basicToken, 'base64')
        .toString()
        .split(':')

    if (!tokenUserEmail || !tokenPassword) {
        return res.status(401).json({ error: 'Unauthorized request'})
    }

    req.app.get('db')('users')
        .where({ email: tokenUserEmail })
        .first()
        .then(tokenUser => {
            if (!tokenUser || tokenUser === undefined) {
                return res.status(401).json({ error: 'Unauthorized request' })
            } else if (tokenUser.admin === false) {
                return res.status(401).json({ error: 'Unauthorized request' })
            }

            return AuthService.comparePasswords(tokenPassword, tokenUser.password)
                .then(passwordsMatch => {
                    if (!passwordsMatch) {
                        return res.status(401).json({ error: 'Unauthorized request' })
                    }

                    res.tokenUser = tokenUser
                    next()
                })
        })
        .catch(error => {
            console.log(error)
            next()
        })
}        

const requireAuth = (req, res, next) => {
    const authToken = req.get('Authorization') || ''

    let basicToken

    if (!authToken.toLowerCase().startsWith('basic ')) {
        return res.status(401).json({ error: 'Missing basic token' })
    } else {
        basicToken = authToken.slice('basic '.length, authToken.length)
    }

    const [tokenUserEmail, tokenPassword] = Buffer
        .from(basicToken, 'base64')
        .toString()
        .split(':')


    if (!tokenUserEmail || !tokenPassword) {
        return res.status(401).json({ error: 'Unauthorized request'})
    }

    req.app.get('db')('users')
        .where({ email: tokenUserEmail })
        .first()
        .then(tokenUser => {
            if (!tokenUser || tokenUser === undefined) {
                return res.status(401).json({ error: 'Unauthorized request' })
            }

            return AuthService.comparePasswords(tokenPassword, tokenUser.password)
                .then(passwordsMatch => {
                    if (!passwordsMatch) {
                        return res.status(401).json({ error: 'Unauthorized request' })
                    }

                    res.tokenUser = tokenUser
                    next()
                })
        })
        .catch(error => {
            console.log(error)
            next()
        })
}

module.exports = {
    authUserAdmin,
    confirmUser,
    requireAdmin,
    requireAuth
}