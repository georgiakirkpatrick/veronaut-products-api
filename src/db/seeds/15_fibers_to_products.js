exports.seed = async function(knex) {
    // Deletes ALL existing entries
    await knex('fibers_to_products').del()
    await knex('fibers_to_products').insert([
        {
            fiber_or_material_id: 1,
            product_id: 1
        }
    ])
}