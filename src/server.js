const knex = require('knex')
const app = require('./app')
const { PORT, DATABASE_URL } = require('./config')

const connection = (NODE_ENV !== 'production' ? DATABASE_URL :
  { 
      connectionString: DATABASE_URL,
      ssl: { rejectUnauthorized: false }
  });

const db = knex({
    client: 'pg',
    connection,
})

app.set('db', db)

app.listen(PORT, () => {
    console.log(`Server listening at http://localhost:${PORT}`)
})