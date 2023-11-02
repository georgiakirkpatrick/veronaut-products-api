exports.seed = async function(knex) {
    // Deletes ALL existing entries
    await knex('factories').del()
    await knex('factories').insert([
        {
            english_name: 'Not disclosed', 
            country: 1, 
            website: '', 
            notes: '', 
            approved_by_admin: true
        }
    ])
}