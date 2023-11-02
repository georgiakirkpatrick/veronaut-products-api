exports.seed = async function(knex) {
    // Deletes ALL existing entries
    await knex('fabrics_to_fibers_and_materials').del()
    await knex('fabrics_to_fibers_and_materials').insert([
        {fabric_id: 1, fiber_or_material_id: 1}
    ])
}