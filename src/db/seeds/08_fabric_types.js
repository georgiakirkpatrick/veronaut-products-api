exports.seed = async function(knex) {
    // Deletes ALL existing entries
    await knex('fabric_types').del()
    await knex('fabric_types').insert([
        {english_name: 'Poplin', fabric_type_class: 'woven', approved_by_admin: true}
    ])
}