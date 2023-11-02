exports.up = function(knex) {
    return knex.schema.createTable('fibers_to_certifications', table => {
        table.integer('fiber_or_material_id').unsigned().notNullable()
        table.foreign('fiber_or_material_id').references('id').inTable('fibers_and_materials').onDelete('CASCADE')
        table.integer('certification_id').unsigned().notNullable()
        table.foreign('certification_id').references('id').inTable('certifications').onDelete('CASCADE')
        table.boolean('approved_by_admin').defaultTo(false)
        table.timestamps(true, true)
    })
}

exports.down = function(knex) {
    return knex.schema.dropTable('fibers_to_certifications')
}

// CREATE TABLE fibers_to_certifications (
//     fiber_or_material_id INTEGER REFERENCES fibers_and_materials(id) ON DELETE CASCADE NOT NULL,
//     certification_id INTEGER REFERENCES certifications(id) ON DELETE CASCADE NOT NULL
// );