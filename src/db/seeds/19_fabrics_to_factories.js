exports.seed = async function(knex) {
    // Deletes ALL existing entries
    await knex('fabrics_to_factories').del()
    await knex('fabrics_to_factories').insert([
        {fabric_id: 1, factory_id: 1}
    ])
}