exports.seed = async function(knex) {
    // Deletes ALL existing entries
    await knex('notions_to_fibers_and_materials').del()
    await knex('notions_to_fibers_and_materials').insert([
        {notion_id: 1, fiber_or_material_id: 1}

    ])
}