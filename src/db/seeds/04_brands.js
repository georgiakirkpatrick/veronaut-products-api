exports.seed = async function(knex) {
    // Deletes ALL existing entries
    await knex('brands').del()
    await knex('brands').insert([
        {
            english_name: 'Sézane', 
            home_currency: 1, 
            website: 'https://www.sezane.com', 
            size_system: 1, 
            approved_by_admin: true
        }
    ])
}