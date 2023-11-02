exports.up = function(knex) {
    return knex.schema.createTable('notions_to_products', table => {
        table.integer('notion_id').unsigned().notNullable()
        table.foreign('notion_id').references('id').inTable('notions').onDelete('CASCADE')
        table.integer('product_id').unsigned().notNullable()
        table.foreign('product_id').references('id').inTable('products').onDelete('CASCADE')  
        table.boolean('approved_by_admin').defaultTo(false)
        table.timestamps(true, true) 
    })
}

exports.down = function(knex) {
    return knex.schema.dropTable('notions_to_products')
}

// CREATE TABLE notions_to_products (
//     notion_id INTEGER REFERENCES notions(id) ON DELETE CASCADE NOT NULL,
//     product_id INTEGER REFERENCES products(id) ON DELETE CASCADE NOT NULL
// );