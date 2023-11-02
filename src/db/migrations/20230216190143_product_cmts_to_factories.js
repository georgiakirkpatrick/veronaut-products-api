exports.up = function(knex) {
    return knex.schema.createTable('product_cmts_to_factories', table => {
        table.integer('product_id').unsigned().notNullable()
        table.foreign('product_id').references('id').inTable('products').onDelete('CASCADE')
        table.integer('factory_id').unsigned().notNullable()
        table.foreign('factory_id').references('id').inTable('factories').onDelete('CASCADE')  
        table.enu('stage', ['cut', 'sew', 'trim', 'undetermined']).defaultTo('undetermined')
        table.boolean('approved_by_admin').defaultTo(false)
        table.timestamps(true, true) 
    })
}

exports.down = function(knex) {
    return knex.schema.dropTable('product_cmts_to_factories')
}