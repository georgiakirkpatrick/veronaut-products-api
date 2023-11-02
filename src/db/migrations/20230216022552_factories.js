exports.up = function(knex) {
    return knex.schema.createTable('factories', table => {
        table.increments('id').primary()
        table.string('english_name').notNullable()
        table.smallint('country').defaultTo(1)
        table.string('website').defaultTo('')
        table.text('notes').defaultTo('')
        table.boolean('approved_by_admin').defaultTo(false)
        table.timestamps(true, true)
    })
}

exports.down = function(knex) {
    return knex.schema.dropTable('factories')
}