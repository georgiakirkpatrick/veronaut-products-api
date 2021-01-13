const UsersService = {
    deleteUser(knex, id) {
        return knex('users')
            .where({ id })
            .delete()
    },

    getAllUsers(knex) {
        return knex('users')
            .select('*')
    },

    getUserById(knex, id) {
        return knex('users')
            .select('*')
            .where({ id })
            .first()
    },

    getUserByUsername(knex, username) {
        return knex('users')
            .select('*')
            .where({ username })
            .first()
        },

    insertUser(knex, newUser) {
        return knex
            .insert(newUser)
            .into('users')
            .returning('*')
            .then(response => {
                return response[0]
            })
        },

    updateUser(knex, id, newUserFields) {
        return knex('users')
            .where({ id })
            .update(newUserFields)
    }
}

module.exports = UsersService