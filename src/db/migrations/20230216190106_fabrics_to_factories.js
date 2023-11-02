exports.up = function(knex) {
    return knex.schema.createTable('fabrics_to_factories', table => {
        table.integer('fabric_id').unsigned().notNullable()
        table.foreign('fabric_id').references('id').inTable('fabrics').onDelete('CASCADE')
        table.integer('factory_id').unsigned().notNullable()
        table.foreign('factory_id').references('id').inTable('factories').onDelete('CASCADE')
        table.boolean('approved_by_admin').defaultTo(false)
        table.timestamps(true, true)
    })
}

exports.down = function(knex) {
    return knex.schema.dropTable('fabrics_to_factories')
}

// CREATE TABLE fabrics_to_factories (
//     fabric_id INTEGER REFERENCES fabrics(id) ON DELETE CASCADE NOT NULL,
//     factory_id INTEGER REFERENCES factories(id) ON DELETE CASCADE NOT NULL
// );