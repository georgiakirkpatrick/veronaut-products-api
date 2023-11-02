exports.seed = async function(knex) {
    // Deletes ALL existing entries
    await knex('notions').del()
    await knex('notions').insert([
        {   
            notion_type_id: 1, 
            brand_id: 1, 
            manufacturer_country: 1, 
            manufacturer_id: 1,
            material_type_id: 1,
            material_origin_id: 1,
            material_producer_id: 1
        }
    ])
}
