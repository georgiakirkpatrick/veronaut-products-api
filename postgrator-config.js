require('dotenv').config()

module.exports = {
    'migrationsDirectory': 'migrations',
    'driver': 'pg',
    'ssl': (process.env.NODE_ENV === 'production' ? 
        { rejectUnauthorized: false } : false)
    ,
    'validateChecksums': false,
    'database': (process.env.NODE_ENV === 'test')
        ? process.env.TEST_DATABASE
        : process.env.DATABASE,
    "username": process.env.PGUSER
}