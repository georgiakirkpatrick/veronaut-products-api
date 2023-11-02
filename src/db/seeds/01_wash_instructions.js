exports.seed = async function(knex) {
    // Deletes ALL existing entries
    await knex('wash_instructions').del()
    await knex('wash_instructions').insert([
        {english_name: 'Not disclosed', approved_by_admin:  true},
        {english_name: 'Do not wash', approved_by_admin:  true},
        {english_name: 'Machine wash cold {english_name: ≤85°F/≤30°C)', approved_by_admin:  true},
        {english_name: 'Machine wash warm {english_name: ≤105°F/≤40°C)', approved_by_admin:  true},
        {english_name: 'Machine wash hot {english_name: ≥140°F/≥60°C)', approved_by_admin:  true},
        {english_name: 'Hand wash', approved_by_admin:  true},
        {english_name: 'Dry clean only', approved_by_admin:  true},
        {english_name: 'Do not dry clean', approved_by_admin:  true},
        {english_name: 'Do not wash', approved_by_admin:  true},
        {english_name: 'Machine wash normal cycle', approved_by_admin:  true},
        {english_name: 'Machine wash permanent press', approved_by_admin:  true},
        {english_name: 'Machine wash delicate', approved_by_admin:  true}
    ])
}
