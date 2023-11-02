exports.seed = async function(knex) {
    // Deletes ALL existing entries
    await knex('notion_types').del()
    await knex('notion_types').insert([
        {
            english_name: 'Zipper'
        }
    ])
}
