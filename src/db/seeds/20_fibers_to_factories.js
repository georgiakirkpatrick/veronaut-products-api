exports.seed = async function(knex) {
    // Deletes ALL existing entries
    await knex('fibers_to_factories').del()
    await knex('fibers_to_factories').insert([
        {fiber_or_material_id: 1, factory_id: 1}
    ])
}