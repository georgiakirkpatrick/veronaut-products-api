const brandsRouter = require("./brands-router")
const { getFibersForFabric } = require("../fabrics/fabrics-service")

const BrandsService = {
    getAllBrands(knex) {
        return knex.select('*').from('brands')
    },

    getBrandById(knex, brandId) {
        return knex('brands').select('*').where('id', brandId).first()
    },

    insertBrand(knex, newBrand) {
        console.log('insertBrand ran')
        return knex
            .insert(newBrand)
            .into('brands')
            .returning('*')
            .then(response => response[0])
    },

    updateBrand(knex, brandId, newBrandFields) {
        return knex('brands')
            .where({ brandId })
            .update(newBrandFields)
    },

    deleteBrand(knex, brandId) {
        return knex('brands')
            .where({ brandId })
            .delete()
    },

    // Fibers
    getFibersForBrand(knex, brandId) {
        knex('fibers_and_materials')
            .join('fiber_and_material_types', {'fibers_and_materials.fiber_or_material_type_id': 'fiber_and_material_types:id'})
            .select(
                'fibers_and_materials.id as id',
                'fibers_and_materials.fiber_or_material_type_id',
                'fiber_and_material_types.english_name',
                'fiber_and_material_types.fiber_type_class',
                'fibers_and_materials.brand_id',
                'fibers_and_materials.producer_country',
                'fibers_and_materials.producer_id',
                'fibers_and_materials.producer_notes',
                'fibers_and_materials.approved_by_admin',
                'fibers_and_materials.date_published'
            )
            .where('brand_id', brandId)
    },

    insertFiber(knex, newFiber) {
        knex
            .insert(newFiber)
            .into('fibers_and_materials')
            .returning('*')
            .then(response => response[0])
    },

    // Notions
    getNotionsForBrands(knex, brandId) {
        knex('notions')
            .join('notion_types', {'notions.notion_type_id': 'notion_types.id'})
            .select(
                'notions.id',
                'notions.notion_type_id',
                'notion_types.english_name',
                'notions.brand_id',
                'notions.notion_factory_country',
                'notions.notion_factory_id',
                'notions.notion_factory_notes',
                'notions.approved_by_admin',
                'notions.date_published'
            )
            .where('brand_id', brandId)
    },

    insertNotion(knex, newNotion) {

    }
}

module.exports = BrandsService