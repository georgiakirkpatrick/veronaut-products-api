exports.seed = async function(knex) {
    // Deletes ALL existing entries
    await knex('fabrics_to_certifications').del()
    await knex('fabrics_to_certifications').insert([
        {fabric_id: 1, certification_id: 1}
    ])
}