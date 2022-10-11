const AuthService = require("../authentication/auth-service")

const authUserAdmin = (req, res, next) => {
    const authToken = req.get('Authorization') || ''

    let bearerToken

    if (!authToken.toLowerCase().startsWith('bearer ')) {
        return res.status(401).json({ error: 'Missing bearer token' })
    } else {
        bearerToken = authToken.slice(7, authToken.length)
    }

    try {
        const payload = AuthService.verifyJwt(bearerToken)

        AuthService.getUserByEmail(
            req.app.get('db'),
            payload.sub
        )
        .then(tokenUser => {
            if (!tokenUser) {
                return res.status(401).json({error: 'Unauthorized request'})
            } else if ( res.user.id !== tokenUser.id && tokenUser.admin === false ) {
                return res.status(401).json({ error: 'Unauthorized request' })
            }

            next()
        })    
    } catch(error) {
        res.status(401).json({ error: 'Unauthorized request'})
    }
}

const confirmUser = (req, res, next) => {
    const authToken = req.get('Authorization') || ''

    let bearerToken

    if (!authToken.toLowerCase().startsWith('bearer ')) {
        return res.status(401).json({ error: 'Missing bearer token' })
    } else {
        bearerToken = authToken.slice(7, authToken.length)
    }

    try {
        const payload = AuthService.verifyJwt(bearerToken)

        AuthService.getUserByEmail(
            req.app.get('db'),
            payload.sub
        )
        .then(tokenUser => {
            const userId = Number(req.params.user_id)

            if (!tokenUser) {
                return res.status(401).json({error: 'Unauthorized request'})
            } else if (userId !== tokenUser.id) {
                return res.status(401).json({ error: 'Unauthorized request' })
            }

            next()
        })    
    } catch(error) {
        res.status(401).json({ error: 'Unauthorized request'})
    }
}

const requireAdmin = (req, res, next) => {
    const authToken = req.get('Authorization') || ''

    let bearerToken

    if (!authToken.toLowerCase().startsWith('bearer ')) {
        return res.status(401).json({ error: 'Missing bearer token' })
    } else {
        bearerToken = authToken.slice(7, authToken.length)
    }

    try {
        const payload = AuthService.verifyJwt(bearerToken)

        AuthService.getUserByEmail(
            req.app.get('db'),
            payload.sub
        )
        .then(tokenUser => {
            if (!tokenUser) {
                return res.status(401).json({error: 'Unauthorized request'})
            } else if (tokenUser.admin === false) {
                return res.status(401).json({ error: 'Unauthorized request' })
            }

            next()
        })    
    } catch(error) {
        res.status(401).json({ error: 'Unauthorized request'})
    }
}

const requireAuth = (req, res, next) => {
    const authToken = req.get('Authorization') || ''

    let bearerToken

    if (!authToken.toLowerCase().startsWith('bearer ')) {
        return res.status(401).json({ error: 'Missing bearer token' })
    } else {
        bearerToken = authToken.slice(7, authToken.length)
    }

    try {
        const payload = AuthService.verifyJwt(bearerToken)

        AuthService.getUserByEmail(
            req.app.get('db'),
            payload.sub
        )
        .then(user => {
            if (!user) {
                return res.status(401).json({error: 'Unauthorized request'})
            }

            next()
        })    
    } catch(error) {
        res.status(401).json({ error: 'Unauthorized request'})
    }
}

module.exports = {
    authUserAdmin,
    confirmUser,
    requireAdmin,
    requireAuth
}