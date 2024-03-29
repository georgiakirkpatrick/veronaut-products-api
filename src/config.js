module.exports = {
    PORT: process.env.PORT || 8000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    DATABASE_URL: (process.env.NODE_ENV === 'test') ? process.env.TEST_DATABASE_URL : process.env.DATABASE_URL,
    JWT_SECRET: process.env.JWT_SECRET || 'tilikum-crossing',
}