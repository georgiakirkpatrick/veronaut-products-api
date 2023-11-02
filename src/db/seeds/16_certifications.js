exports.seed = async function(knex) {
    // Deletes ALL existing entries
    await knex('certifications').del()
    await knex('certifications').insert([
        {english_name: 'Global Organic Textile Standard', website: 'https://www.global-standard.org/', approved_by_admin: true}
    ])
}