exports.up = function(knex) {
    return knex.schema.createTable('notions_to_certifications', table => {
        table.integer('notion_id').unsigned().notNullable()
        table.foreign('notion_id').references('id').inTable('notions').onDelete('CASCADE')
        table.integer('certification_id').unsigned().notNullable()
        table.foreign('certification_id').references('id').inTable('certifications').onDelete('CASCADE')
        table.boolean('approved_by_admin').defaultTo(false)
        table.timestamps(true, true) 
    })
}

exports.down = function(knex) {
    return knex.schema.dropTable('notions_to_certifications')
}

// CREATE TABLE notions_to_certifications (
//     notion_id INTEGER REFERENCES notions(id) ON DELETE CASCADE NOT NULL,
//     certification_id INTEGER REFERENCES certifications(id) ON DELETE CASCADE NOT NULL
// );