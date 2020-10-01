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
        .then(response => response[0])
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
        .then(response => response[0])
    },

    deleteFactory(knex, id) {
        return knex('factories')
        .where({ id })
        .delete()
    }
}

module.exports = FactoriesService