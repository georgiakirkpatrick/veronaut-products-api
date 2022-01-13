const FactoriesService = {
    getAllFactories(knex) {
        return knex('factories')
            .select('*')
    },

    insertFactory(knex, newFactory) {
        return knex
        .into('factories')
        .insert(newFactory)
        .returning('*')
        .then(response => {
            return response[0]
        })
    },

    getFactoryById(knex, id) {
        return knex('factories')
            .select('*')
            .where('id', id)
            .first()
    },

    updatefactory(knex, id, fieldsToUpdate) {
        return knex('factories')
        .where({ id })
        .update(fieldsToUpdate)
        .then(response => {
            return response[0]
        })
        .catch(error => {
            console.log(error)
        })
    },

    deleteFactory(knex, id) {
        return knex('factories')
        .where({ id })
        .delete()
    }
}

module.exports = FactoriesService