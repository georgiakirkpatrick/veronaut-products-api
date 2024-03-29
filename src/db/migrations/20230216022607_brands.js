exports.up = function(knex) {
  return knex.schema.createTable('brands', table => {
    table.increments('id').primary()
    table.string('english_name').notNullable()
    table.string('website').notNullable()
    table.smallint('home_currency').defaultTo(1)
    table.smallint('size_system').defaultTo(1)
    table.boolean('approved_by_admin').defaultTo(false)
    table.timestamps(true, true)
})
}

exports.down = function(knex) {
  return knex.schema.dropTable('brands')
}

// CREATE TABLE brands (
//     id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
//     english_name TEXT NOT NULL,
//     website TEXT NOT NULL,
//     home_currency INTEGER DEFAULT 1,
//     size_system INTEGER DEFAULT 1,
//     approved_by_admin BOOLEAN DEFAULT false,
//     date_published TIMESTAMPTZ DEFAULT now() NOT NULL
//   );