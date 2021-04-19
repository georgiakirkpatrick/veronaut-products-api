const CategoriesService = {
// Categories
    getAllCategories(knex) {
        return knex.select('*').from('categories')
    },

    insertCategory(knex, newCategory) {
        return knex
            .into('categories')
            .insert(newCategory)
            .returning('*')
            .then(response => response[0])
    },

    getCategoryById(knex, id) {
        return knex
            .from('categories').select('*').where('id', id).first()
    },

// Products
    getProductsForCategory(knex, categoryId) {
        return knex('products')
            .join('brands', {'products.brand_id': 'brands.id'})
            .select(
                'products.id',
                'products.english_name',
                'products.brand_id',
                'brands.english_name as brand_name',
                'brands.home_currency as brand_currency',
                'products.category_id',
                'products.product_url',
                'products.feature_image_url',
                'products.multiple_color_options',
                'products.cost_in_home_currency',
                'products.wash_id',
                'products.dry_id',
                'products.cmt_country',
                'products.cmt_factory_notes',
                'products.approved_by_admin',
                'products.date_published'
            )
            .where('products.category_id', categoryId)
            .then(response => {
                console.log('getProductsForCategory response', response)

                return response
            })
    }
}

module.exports = CategoriesService