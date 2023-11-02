exports.seed = async function(knex) {
    // Deletes ALL existing entries
    await knex('fabrics_to_products').del()
    await knex('fabrics_to_products').insert([
        {fabric_id: 1, product_id: 1}
    ])
}