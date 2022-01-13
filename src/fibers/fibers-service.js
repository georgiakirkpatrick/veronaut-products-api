const FibersService = {
    // Fibers
        getAllFibers(knex) {
            return knex('fibers_and_materials')
                .join('fiber_and_material_types', {'fibers_and_materials.fiber_or_material_type_id': 'fiber_and_material_types.id'})
                .join('factories', {'fibers_and_materials.producer_id': 'factories.id'})
                .select(
                    'fibers_and_materials.id',
                    'fibers_and_materials.fiber_or_material_type_id',
                    'fiber_and_material_types.english_name as fiber_type',
                    'fiber_and_material_types.fiber_type_class as class',
                    'fibers_and_materials.brand_id',
                    'fibers_and_materials.producer_country',
                    'fibers_and_materials.producer_id',
                    'factories.english_name as producer',
                    'factories.website as producer_website',
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
                    'fibers_and_materials.fiber_or_material_type_id',
                    'fiber_and_material_types.english_name as fiber_type',
                    'fiber_and_material_types.fiber_type_class as class',
                    'fibers_and_materials.brand_id',
                    'fibers_and_materials.producer_country',
                    'fibers_and_materials.producer_id',
                    'fibers_and_materials.production_notes',
                    'factories.english_name as producer',
                    'factories.website as producer_website',
                    'fibers_and_materials.approved_by_admin',
                    'fibers_and_materials.date_published'
                )
                .where('fibers_and_materials.id', fiberId)
                .first()
        },

        insertFiber(knex, newFiber) {
            return knex
                .insert(newFiber)
                .into('fibers_and_materials')
                .returning('*')
                .then(response => response[0])
        },

        updateFiber(knex, fiberId, fieldsToUpdate) {
            return knex('fibers_and_materials')
                .where('fibers_and_materials.id', fiberId)
                .update(fieldsToUpdate)
        },

        deleteFiber(knex, fiberId) {
            return knex('fibers_and_materials')
                .where('fibers_and_materials.id', fiberId)
                .delete()
        },

    // Fiber Types
        getAllFiberTypes(knex) {
            return knex('fiber_and_material_types').select('*')
        },

        insertFiberType(knex, newFiberType) {
            return knex
                .insert(newFiberType)
                .into('fiber_and_material_types')
                .returning('*')
                .then(response => response[0])
        },

    // Certifications
        getFibCerts(knex, fiber_id) {
            return knex('fibers_to_certifications')
                .join('certifications', {'fibers_to_certifications.certification_id': 'certifications.id'})
                .select(
                    'fibers_to_certifications.fiber_or_material_id as fiber_id',
                    'certifications.id as certification_id',
                    'certifications.english_name',
                    'certifications.website',
                    'certifications.approved_by_admin',
                    'certifications.date_published'
                )
                .where('fibers_to_certifications.fiber_or_material_id', fiber_id)
        },

        insertFiberCert(knex, fibCertPair) {
            return knex
                .insert(fibCertPair)
                .into('fibers_to_certifications')
                .returning('*')
                .then(response => response[0])
        }
}

module.exports = FibersService