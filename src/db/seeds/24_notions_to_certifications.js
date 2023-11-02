exports.seed = async function(knex) {
    // Deletes ALL existing entries
    await knex('notions_to_certifications').del()
    await knex('notions_to_certifications').insert([
        {notion_id: 1, certification_id: 1}
    ])
}