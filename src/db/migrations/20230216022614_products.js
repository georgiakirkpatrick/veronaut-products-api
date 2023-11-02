exports.up = function(knex) {
  return knex.schema.createTable('products', table => {
    table.increments('id').primary()
    table.string('english_name').notNullable()
    table.integer('brand_id').unsigned().notNullable()
    table.foreign('brand_id').references('id').inTable('brands').onDelete('CASCADE')
    table.integer('category_id').unsigned().notNullable()
    table.foreign('category_id').references('id').inTable('categories').onDelete('CASCADE')
    table.string('feature_image_url').notNullable()
    table.boolean('multiple_color_options').defaultTo(false)
    table.float('cost_in_home_currency').notNullable()
    table.string('product_url').notNullable()
    table.integer('wash_id').unsigned().notNullable()
    table.foreign('wash_id').references('id').inTable('wash_instructions').onDelete('CASCADE')
    table.integer('dry_id').unsigned().notNullable()
    table.foreign('dry_id').references('id').inTable('dry_instructions').onDelete('CASCADE')
    table.smallint('cmt_sew_country').defaultTo(1)
    table.smallint('cmt_cut_country').defaultTo(1)
    table.text('cmt_notes').defaultTo('')
    table.boolean('featured').defaultTo(false)
    table.boolean('approved_by_admin').defaultTo(false)
    table.timestamps(true, true)
  })
}

exports.down = function(knex) {
    return knex.schema.dropTable('products')
}