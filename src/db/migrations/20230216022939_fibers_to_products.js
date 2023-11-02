exports.up = function(knex) {
    return knex.schema.createTable('fibers_to_products', table => {
        table.integer('fiber_or_material_id').unsigned().notNullable()
        table.foreign('fiber_or_material_id').references('id').inTable('fibers_and_materials').onDelete('CASCADE')
        table.integer('product_id').unsigned().notNullable()
        table.foreign('product_id').references('id').inTable('products').onDelete('CASCADE')
        table.boolean('approved_by_admin').defaultTo(false)
        table.timestamps(true, true) 
    })
}

exports.down = function(knex) {
    return knex.schema.dropTable('fibers_to_products')
}

// CREATE TABLE fibers_to_products (
//     fiber_or_material_id INTEGER REFERENCES fibers_and_materials(id) ON DELETE CASCADE NOT NULL,
//     product_id INTEGER REFERENCES products(id) ON DELETE CASCADE NOT NULL
// );