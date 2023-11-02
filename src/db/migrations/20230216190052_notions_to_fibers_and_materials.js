exports.up = function(knex) {
    return knex.schema.createTable('notions_to_fibers_and_materials', table => {
        table.integer('notion_id').unsigned().notNullable()
        table.foreign('notion_id').references('id').inTable('notions').onDelete('CASCADE')
        table.integer('fiber_or_material_id').unsigned().notNullable()
        table.foreign('fiber_or_material_id').references('id').inTable('fibers_and_materials').onDelete('CASCADE') 
        table.boolean('approved_by_admin').defaultTo(false)
        table.timestamps(true, true)
    })
}

exports.down = function(knex) {
    return knex.schema.dropTable('notions_to_fibers_and_materials')
}

// CREATE TABLE notions_to_fibers_and_materials (
//     notion_id INTEGER REFERENCES notions(id) ON DELETE CASCADE NOT NULL,
//     fiber_or_material_id INTEGER REFERENCES fibers_and_materials(id) ON DELETE CASCADE NOT NULL
// ); 