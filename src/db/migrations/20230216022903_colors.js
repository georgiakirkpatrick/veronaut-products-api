exports.up = function(knex) {
    return knex.schema.createTable('colors', table => {
        table.increments('id').primary()
        table.integer('brand_id').unsigned()
        table.foreign('brand_id').references('id').inTable('brands').onDelete('CASCADE')
        table.smallint('color_description_id').notNullable()
        table.string('color_english_name').notNullable()
        table.string('swatch_image_url').defaultTo('')
        table.boolean('approved_by_admin').defaultTo(false)
        table.timestamps(true, true)
    })
}

exports.down = function(knex) {
    return knex.schema.dropTable('colors')
}