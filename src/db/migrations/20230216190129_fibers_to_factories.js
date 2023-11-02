exports.up = function(knex) {
    return knex.schema.createTable('fibers_to_factories', table => {
        table.integer('fiber_or_material_id').unsigned().notNullable()
        table.foreign('fiber_or_material_id').references('id').inTable('fibers_and_materials').onDelete('CASCADE')
        table.integer('factory_id').unsigned().notNullable()
        table.foreign('factory_id').references('id').inTable('factories').onDelete('CASCADE')
        table.boolean('approved_by_admin').defaultTo(false)
        table.timestamps(true, true) 
    })
}

exports.down = function(knex) {
    return knex.schema.dropTable('fibers_to_factories')
}

// CREATE TABLE fibers_to_factories (
//     fiber_or_material_id INTEGER REFERENCES fibers_and_materials(id) ON DELETE CASCADE NOT NULL,
//     factory_id INTEGER REFERENCES factories(id) ON DELETE CASCADE NOT NULL
// );