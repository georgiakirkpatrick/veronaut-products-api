exports.seed = async function(knex) {
    // Deletes ALL existing entries
    await knex('notions_to_products').del()
    await knex('notions_to_products').insert([
        {notion_id: 1, product_id: 1}
    ])
}