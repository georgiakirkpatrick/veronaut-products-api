exports.seed = async function(knex) {
    // Deletes ALL existing entries
    await knex('product_cmts_to_certifications').del()
    await knex('product_cmts_to_certifications').insert([
        {product_id: 1, certification_id: 1}
    ])
}