exports.seed = async function(knex) {
    // Deletes ALL existing entries
    await knex('users_to_products').del()
    await knex('users_to_products').insert([
        {user_id: 1, product_id: 1, relationship_id: 1}
    ])
}