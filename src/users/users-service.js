const UsersService = {
    deleteUser(knex, id) {
        return knex('users')
            .where({ id })
            .delete()
    },

    deleteUserProd(knex, userProduct) {
        return knex('users_to_products')
            .where({ user_id: userProduct.user_id })
            .andWhere({ product_id: userProduct.product_id })
            .andWhere({ relationship_id: userProduct.relationship_id })
            .delete()
    },

    getAllUsers(knex) {
        return knex('users')
            .select('*')
    },

    getProductsForUser(knex, userId) {
        return knex('users')
            .join('users_to_products', {'users.id': 'users_to_products.user_id'})
            .join('products', {'users_to_products.product_id': 'products.id'})
            .join('brands', {'products.brand_id': 'brands.id'})
            .select(
                'users_to_products.relationship_id',
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
                'products.cmt_sew_country',
                'products.cmt_cut_country',
                'products.cmt_notes',
                'products.featured',
                'products.approved_by_admin',
                'products.date_published',
            )
            .where('users_to_products.user_id', userId)
    },

    getUserById(knex, id) {
        return knex('users')
            .select(
                'users.id',
                'users.email',
                'users.handle',
                'users.name',
                'users.website',
                'users.profile_pic',
                'users.bio',
                'users.public',
                'users.admin',
                'users.editor',
                'users.can_submit',
                'users.org_affiliation',
                'users.account_created'
            )
            .where({ id })
            .first()
    },

    insertUser(knex, newUser) {
        return knex
            .insert(newUser)
            .into('users')
            .returning('*')
            .then(response => {
                return response[0]
            })
    },

    insertUserProduct(knex, userProduct) {
        return knex
            .insert(userProduct)
            .into('users_to_products')
            .returning('*')
            .then(response => {
                return response[0]
            })
    },

    preventRepeat(knex, email) {
        return knex('users')
            .where({ email })
            .first()
    },

    updateUser(knex, id, newUserFields) {
        return knex('users')
            .where({ id })
            .update(newUserFields)
    }
}

module.exports = UsersService