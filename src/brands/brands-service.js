const BrandsService = {
    getAllBrands(knex) {
        return knex.select('*').from('brands')
    },

    getBrandById(knex, brandId) {
        return knex('brands').select('*').where('id', brandId).first()
    },

    insertBrand(knex, newBrand) {
        return knex
            .insert(newBrand)
            .into('brands')
            .returning('*')
            .then(response => response[0])
    },

    updateBrand(knex, id, newBrandFields) {
        return knex('brands')
            .where({ id })
            .update(newBrandFields)
    },

    deleteBrand(knex, id) {
        return knex('brands')
            .where({ id })
            .delete()
    },

    // Fibers
    getFibersForBrand(knex, brandId) {
        return knex('fibers_and_materials')
            .join('fiber_and_material_types', {'fibers_and_materials.fiber_or_material_type_id': 'fiber_and_material_types.id'})
            .select(
                'fibers_and_materials.id as id',
                'fibers_and_materials.fiber_or_material_type_id',
                'fiber_and_material_types.english_name as fiber_type',
                'fiber_and_material_types.fiber_type_class',
                'fibers_and_materials.brand_id',
                'fibers_and_materials.producer_country',
                'fibers_and_materials.producer_id',
                'fibers_and_materials.production_notes',
                'fibers_and_materials.approved_by_admin',
                'fibers_and_materials.date_published'
            )
            .where('brand_id', brandId)
    },

    // Notions
    getNotionsForBrands(knex, brandId) {
        return knex('notions')
            .join('notion_types', {'notions.notion_type_id': 'notion_types.id'})
            .select(
                'notions.id',
                'notions.notion_type_id',
                'notions.brand_id',
                'notion_types.english_name as notion_type',
                'notions.manufacturer_country',
                'notions.manufacturer_id',
                'notions.manufacturer_notes',
                'notions.material_type_id',
                'notions.material_origin_id',
                'notions.material_producer_id',
                'notions.material_notes',
                'notions.approved_by_admin',
                'notions.date_published'
            )
            .where('brand_id', brandId)
    },
}

module.exports = BrandsService