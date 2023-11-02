exports.seed = async function(knex) {
    // Deletes ALL existing entries
    await knex('product_images').del()
    await knex('product_images').insert([
        {
            product_id: 1, 
            product_image_url: 'https://test-product-image-url', 
            color_id: 1, 
            primary_image_for_color: true
        }
    ])
}