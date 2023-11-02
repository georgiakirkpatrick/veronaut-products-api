exports.seed = async function(knex) {
    // Deletes ALL existing entries
    await knex('product_colors').del()
    await knex('product_colors').insert([
        {
            product_id: 1,
            color_description_id: 1, 
            color_english_name: 'test color',
            swatch_image_url: 'https://test-product-image-url'
        }
  ])
}
