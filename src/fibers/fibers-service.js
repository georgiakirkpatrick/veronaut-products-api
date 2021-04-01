const FibersService = {
    // Fibers
        getAllFibers(knex) {
            return knex('fibers_and_materials')
                .join('fiber_and_material_types', {'fibers_and_materials.fiber_or_material_type_id': 'fiber_and_material_types.id'})
                .select(
                    'fibers_and_materials.id',
                    'fibers_and_materials.fiber_or_material_type_id as fiber_type_id',
                    'fiber_and_material_types.english_name as fiber_type',
                    'fiber_and_material_types.fiber_type_class as class',
                    'fibers_and_materials.brand_id',
                    'fibers_and_materials.producer_country',
                    'fibers_and_materials.producer_id',
                    'fibers_and_materials.production_notes',
                    'fibers_and_materials.approved_by_admin',
                    'fibers_and_materials.date_published'
                )
        },        
        
        getFiberById(knex, fiberId) {
            return knex('fibers_and_materials')
                .join('fiber_and_material_types', {'fibers_and_materials.fiber_or_material_type_id': 'fiber_and_material_types.id'})
                .join('factories', {'fibers_and_materials.producer_id': 'factories.id'})
                .select(
                    'fibers_and_materials.id',
                    'fibers_and_materials.fiber_or_material_type_id as fiber_type_id',
                    'fiber_and_material_types.english_name as fiber_type',
                    'fiber_and_material_types.fiber_type_class as class',
                    'fibers_and_materials.brand_id',
                    'fibers_and_materials.producer_country',
                    'fibers_and_materials.producer_id',
                    'fibers_and_materials.production_notes',
                    'factories.english_name as producer',
                    'factories.website as producer_website',
                    'factories.notes as producer_notes',
                    'fibers_and_materials.approved_by_admin',
                    'fibers_and_materials.date_published'
                )
                .where('fibers_and_materials.id', fiberId)
                .first()
        }
}        