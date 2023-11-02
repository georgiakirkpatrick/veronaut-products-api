exports.up = function(knex) {
    return knex.schema.createTable('fabrics_to_certifications', table => {
        table.integer('fabric_id').unsigned().notNullable()
        table.foreign('fabric_id').references('id').inTable('fabrics').onDelete('CASCADE')
        table.integer('certification_id').unsigned().notNullable()
        table.foreign('certification_id').references('id').inTable('certifications').onDelete('CASCADE')
        table.boolean('approved_by_admin').defaultTo(false)
        table.timestamps(true, true)
    })
}

exports.down = function(knex) {
    return knex.schema.dropTable('fabrics_to_certifications')
}

// CREATE TABLE fabrics_to_certifications (
//     fabric_id INTEGER REFERENCES fabrics(id) ON DELETE CASCADE NOT NULL,
//     certification_id INTEGER REFERENCES certifications(id) ON DELETE CASCADE NOT NULL
// );