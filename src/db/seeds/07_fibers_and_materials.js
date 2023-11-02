exports.seed = async function(knex) {
    // Deletes ALL existing entries
    await knex('fibers_and_materials').del()
    await knex('fibers_and_materials').insert([
        {
            fiber_or_material_type_id: 1,
            brand_id: 1,
            producer_country: 1,
            producer_id: 1,
            approved_by_admin: true
        }
    ]);
};
