const UsersService = require('../users/users-service')

function generateToken(user) {
    return String(user.id)
}
  
function decryptToken(token) {
    return { userId: Number(token) }
}
  
function requireLogin(req, res, next) {
    const authHeader = req.get('Authorization') // gets the header you've sent in the frontend
  
    if (!authHeader)
        return res.status(401).json({ message: 'Missing auth token' })
   
    const token = authHeader.slice('Bearer '.length)
  
    const error = { message: 'Invalid token' }
   
    if (!token)
        return res.status(401).json(error)
  
    const data = decryptToken(token) // { userId: userId }
  
    UsersService.getById(req.app.get('db'), data.userId).then(
        (user) => {
            if (!user)
            return res.status(401).json(error)
  
            res.user = user;
            next()
        }
    )
}

module.exports = {
    generateToken,
    decryptToken,
    requireLogin
}