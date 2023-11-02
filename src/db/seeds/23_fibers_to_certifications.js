exports.seed = async function(knex) {
    // Deletes ALL existing entries
    await knex('fibers_to_certifications').del()
    await knex('fibers_to_certifications').insert([
        {fiber_or_material_id: 1, certification_id: 1}
    ])
}