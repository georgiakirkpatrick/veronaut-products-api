exports.up = function(knex) {
    return knex.schema.createTable('users_to_products', table => {
        table.integer('user_id').unsigned().notNullable()
        table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE')
        table.integer('product_id').unsigned().notNullable()
        table.foreign('product_id').references('id').inTable('products').onDelete('CASCADE')
        table.smallint('relationship_id').notNullable()
        table.timestamps(true, true)
    })
}

exports.down = function(knex) {
    return knex.schema.dropTable('users_to_products')
}

// CREATE TABLE users_to_products (
//     user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
//     product_id INTEGER REFERENCES products(id) ON DELETE CASCADE NOT NULL,
//     relationship_id INTEGER NOT NULL
// );