exports.seed = async function(knex) {
    // Deletes ALL existing entries
    await knex('fiber_and_material_types').del()
    await knex('fiber_and_material_types').insert([
        {
            english_name: 'Not disclosed',
            fiber_type_class: 'undetermined',
            approved_by_admin: true
        }
    ])
}
