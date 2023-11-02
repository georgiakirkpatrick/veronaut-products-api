exports.seed = async function(knex) {
    // Deletes ALL existing entries
    await knex('products').del()
    await knex('products').insert([
        {
            english_name: 'Léon Jumper', 
            brand_id: 1, 
            category_id: 14, 
            product_url: 'https://www.sezane.com/us/product/preco-automne-30-08/leon-sweaters/heather-rose', 
            feature_image_url: 'http://test-url-feature-image',
            multiple_color_options: true,
            cost_in_home_currency: 100.00,
            wash_id: 1,
            dry_id: 1,
            approved_by_admin: true
        }
    ])
}
