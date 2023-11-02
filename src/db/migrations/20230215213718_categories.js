exports.up = function(knex) {
    return knex.schema.createTable('categories', table => {
        table.increments('id').primary()
        table.string('english_name').notNullable()
        table.enu('category_class', ['clothing', 'accessories', 'shoes', 'undetermined']).defaultTo('undetermined')
        table.string('feature_image').defaultTo('')
    })
}

exports.down = function(knex) {
  return knex.schema.dropTable('categories')
}