exports.up = function(knex) {
    return knex.schema.createTable('product_cmts_to_certifications', table => {
        table.integer('product_id').unsigned().notNullable()
        table.foreign('product_id').references('id').inTable('products').onDelete('CASCADE')
        table.integer('certification_id').unsigned().notNullable()
        table.foreign('certification_id').references('id').inTable('certifications').onDelete('CASCADE')
        table.boolean('approved_by_admin').defaultTo(false)
        table.timestamps(true, true) 
    })
}

exports.down = function(knex) {
    return knex.schema.dropTable('product_cmts_to_certifications')
}

// CREATE TABLE product_cmts_to_certifications (
//     product_id INTEGER REFERENCES products(id) ON DELETE CASCADE NOT NULL,
//     certification_id INTEGER REFERENCES certifications(id) ON DELETE CASCADE NOT NULL
// );