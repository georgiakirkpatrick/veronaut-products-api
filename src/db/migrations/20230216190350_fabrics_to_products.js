exports.up = function(knex) {
    return knex.schema.createTable('fabrics_to_products', table => {
        table.integer('fabric_id').unsigned().notNullable()
        table.foreign('fabric_id').references('id').inTable('fabrics').onDelete('CASCADE')
        table.integer('product_id').unsigned().notNullable()
        table.foreign('product_id').references('id').inTable('products').onDelete('CASCADE')
        table.enu('relationship', ['primary', 'secondary', 'lining']).defaultTo('primary')
        table.boolean('approved_by_admin').defaultTo(false)
        table.timestamps(true, true) 
    })
}

exports.down = function(knex) {
    return knex.schema.dropTable('fabrics_to_products')
}