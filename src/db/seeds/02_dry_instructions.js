exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('dry_instructions').del()
  await knex('dry_instructions').insert([
    {english_name: 'Not disclosed', approved_by_admin: true},
    {english_name: 'Hang dry', approved_by_admin:  true},
    {english_name: 'Hang dry in the shade', approved_by_admin:  true},
    {english_name: 'Dry flat', approved_by_admin:  true},
    {english_name: 'Tumble dry', approved_by_admin:  true},
    {english_name: 'Tumble dry low heat', approved_by_admin:  true},
    {english_name: 'Tumble dry medium heat', approved_by_admin:  true},
    {english_name: 'Tumble dry high heat', approved_by_admin:  true},
    {english_name: 'Tumble dry normal cycle', approved_by_admin:  true},
    {english_name: 'Tumble dry permanent press', approved_by_admin:  true},
    {english_name: 'Tumble dry delicate', approved_by_admin:  true}
  ])
}
