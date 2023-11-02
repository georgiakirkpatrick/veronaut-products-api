exports.seed = async function(knex) {
    // Deletes ALL existing entries
    await knex('fabrics').del()
    await knex('fabrics').insert([
        {
            brand_id: 1, 
            fabric_mill_country: 1, 
            fabric_mill_id: 1, 
            fabric_mill_notes: 'Sample notes', 
            dye_print_finish_country: 1, 
            dye_print_finish_id: 1, 
            dye_print_finish_notes: 'Sample notes', 
            approved_by_admin: true
        }
    ])
}