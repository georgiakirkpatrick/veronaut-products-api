const CategoriesService = {
    getAllCategories(knex) {
        return knex.select('*').from('categories')
    }
}    

module.exports = CategoriesService