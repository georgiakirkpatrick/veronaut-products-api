exports.up = function(knex) {
    return knex.schema.createTable('fabrics_to_fibers_and_materials', table => {
        table.integer('fabric_id').unsigned().notNullable()
        table.foreign('fabric_id').references('id').inTable('fabrics').onDelete('CASCADE')
        table.integer('fiber_or_material_id').unsigned().notNullable()
        table.foreign('fiber_or_material_id').references('id').inTable('fibers_and_materials').onDelete('CASCADE')
        table.smallint('percent_of_fabric').defaultTo(404)
        table.boolean('approved_by_admin').defaultTo(false)
        table.timestamps(true, true)
    })
}

exports.down = function(knex) {
    return knex.schema.dropTable('fabrics_to_fibers_and_materials')
}