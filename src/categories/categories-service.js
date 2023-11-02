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

    updateCategory(knex, id, fieldsToUpdate) {
        return knex('categories')
            .where({ id })
            .update(fieldsToUpdate)
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
                'products.feature_image_url',
                'products.multiple_color_options',
                'brands.home_currency',
                'products.cost_in_home_currency',
                'products.product_url',
                'products.wash_id',
                'products.dry_id',
                'products.cmt_sew_country',
                'products.cmt_cut_country',
                'products.cmt_notes',
                'products.featured',
                'products.approved_by_admin',
                'products.created_at',
                'products.updated_at'
            )
            .where('products.category_id', categoryId)
            .then(response => {

                return response
            })
    }
}

module.exports = CategoriesService