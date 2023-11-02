exports.seed = async function(knex) {
    // Deletes ALL existing entries
    await knex('sizes_to_products').del()
    await knex('sizes_to_products').insert([
        {size_id: 1, product_id: 1}
    ])
}