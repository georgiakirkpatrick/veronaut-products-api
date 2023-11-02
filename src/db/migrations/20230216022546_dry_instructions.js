exports.up = function(knex) {
    return knex.schema.createTable('dry_instructions', table => {
        table.increments('id').primary()
        table.string('english_name').notNullable()
        table.boolean('approved_by_admin').defaultTo(false)
        table.timestamps(true, true)
    })
}

exports.down = function(knex) {
    return knex.schema.dropTable('dry_instructions')
}