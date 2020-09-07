const ProductsService = {
    getAllProducts(knex) {
        return knex.select('*').from('products')
    },

    insertProduct(knex, newProduct) {
        return knex
            .insert(newProduct)
            .into('products')
            .returning('*')
            .then(rows => {
                console.log('rows', rows)
                console.log('rows[0]', rows[0])
                return rows[0]
            })
    },

    getById(knex, id) {
        return knex
            .from('products').select('*').where('id', id).first()
    },

    deleteProduct(knex, id) {
        return knex('products')
            .where({ id })
            .delete()
    },

    updateProduct(knex, id, newProductFields) {
        return knex('products')
            .where({ id })
            .update(newProductFields)
    }
}    

module.exports = ProductsService