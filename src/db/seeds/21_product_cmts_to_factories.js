exports.seed = async function(knex) {
    // Deletes ALL existing entries
    await knex('product_cmts_to_factories').del()
    await knex('product_cmts_to_factories').insert([
        {product_id: 1, factory_id: 1, stage: 'sew'},
        {product_id: 1, factory_id: 1, stage: 'cut'}

    ])
}