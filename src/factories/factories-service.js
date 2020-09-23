const FactoriesService = {
    getAllFactories(knex) {
        return knex('factories')
            .select('*')
    },

    insertFactory(knex, newFactory) {
        return knex
        .into('factories')
        .insert(newCertification)
        .returning('*')
        .then(response => response[0])
    },

    getFactoryById(knex, id) {
        return knex('factories')
            .select('*')
            .where('id', id)
            .first()
    },

    updatefactory(knex, id, factoryToUpdate) {
        return knex('factories')
        .where({ id })
        .update(fieldsToUpdate)
    },

    deleteFactory(knex, id) {
        return knex('factories')
        .where({ id })
        .delete()
    }
}

module.exports = FactoriesService