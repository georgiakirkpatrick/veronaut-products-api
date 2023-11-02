require('dotenv').config()
const path = require('path')
const { DATABASE_URL, TEST_DATABASE_URL } = process.env

module.exports = {
    test: {
        client: "pg",
        connection: TEST_DATABASE_URL,
        migrations: {
            directory: path.join(__dirname, 'src', 'db', 'migrations')
        },
    },
    development: {
        client: 'pg',
        connection: DATABASE_URL,
        migrations: {
            directory: path.join(__dirname, 'src', 'db', 'migrations')
        },
        seeds: {
            directory: path.join(__dirname, "src", "db", "seeds")
        },
    },

//   staging: {
//     client: 'postgresql',
//     connection: {
//       database: 'my_db',
//       user:     'username',
//       password: 'password'
//     },
//     pool: {
//       min: 2,
//       max: 10
//     },
//     migrations: {
//       tableName: 'knex_migrations'
//     }
//   },

//   production: {
//     client: 'postgresql',
//     connection: {
//       database: 'my_db',
//       user:     'username',
//       password: 'password'
//     },
//     pool: {
//       min: 2,
//       max: 10
//     },
//     migrations: {
//       tableName: 'knex_migrations'
//     }
//   }

}
