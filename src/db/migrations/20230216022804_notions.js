exports.up = function(knex) {
    return knex.schema.createTable('notions', table => {
        table.increments('id').primary()
        table.integer('notion_type_id').unsigned().notNullable()
        table.foreign('notion_type_id').references('id').inTable('notion_types').onDelete('CASCADE')
        table.integer('brand_id').unsigned().notNullable()
        table.foreign('brand_id').references('id').inTable('brands').onDelete('CASCADE')
        table.smallint('manufacturer_country').defaultTo(1)
        table.smallint('manufacturer_id').notNullable()
        table.text('manufacturer_notes').defaultTo('')
        table.integer('material_type_id').unsigned().notNullable()
        table.foreign('material_type_id').references('id').inTable('fiber_and_material_types').onDelete('CASCADE')
        table.smallint('material_origin_id').defaultTo(1)
        table.smallint('material_producer_id').notNullable()
        table.text('material_notes').defaultTo('')
        table.boolean('approved_by_admin').defaultTo(false)
        table.timestamps(true, true)
    })
}

exports.down = function(knex) {
    return knex.schema.dropTable('notions')
}

// CREATE TABLE notions (
//     id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
//     notion_type_id INTEGER REFERENCES notion_types(id) ON DELETE CASCADE NOT NULL,
//     brand_id INTEGER REFERENCES brands(id) ON DELETE CASCADE NOT NULL,
//     manufacturer_country INTEGER DEFAULT 1,
//     manufacturer_id INTEGER REFERENCES factories(id) ON DELETE CASCADE NOT NULL,
//     manufacturer_notes TEXT,
//     material_type_id INTEGER REFERENCES fiber_and_material_types(id) ON DELETE CASCADE NOT NULL,
//     material_origin_id INTEGER DEFAULT 1,
//     material_producer_id INTEGER REFERENCES factories(id) ON DELETE CASCADE NOT NULL,
//     material_notes TEXT,
//     approved_by_admin BOOLEAN DEFAULT false,
//     date_published TIMESTAMPTZ DEFAULT now() NOT NULL
// );