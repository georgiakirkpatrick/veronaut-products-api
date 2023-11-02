exports.up = function(knex) {
    return knex.schema.createTable('sizes_to_products', table => {
        table.integer('size_id').unsigned().notNullable()
        table.foreign('size_id').references('id').inTable('sizes').onDelete('CASCADE')
        table.integer('product_id').unsigned().notNullable()
        table.foreign('product_id').references('id').inTable('products').onDelete('CASCADE')
        table.boolean('approved_by_admin').defaultTo(false)
        table.timestamps(true, true)
    })
}

exports.down = function(knex) {
    return knex.schema.dropTable('sizes_to_products')
}

// CREATE TABLE sizes_to_products (
//     size_id INTEGER REFERENCES sizes(id) ON DELETE CASCADE NOT NULL,
//     product_id INTEGER REFERENCES products(id) ON DELETE CASCADE NOT NULL
// );