const FabricsService = {
    // Fabrics
        getAllFabrics(knex) {
            return knex('fabrics')
                .join('fabric_types', {'fabrics.fabric_type_id': 'fabric_types.id'})
                .select(
                    'fabrics.id',
                    'fabrics.fabric_type_id',
                    'fabric_types.english_name as fabric_type',
                    'fabrics.fabric_mill_country',
                    'fabrics.fabric_mill_notes',
                    'fabrics.dye_print_finish_country',
                    'fabrics.dye_print_finish_notes',
                    'fabrics.approved_by_admin',
                    'fabrics.date_published'
                )
        },

        getFabricById(knex, fabricId) {
            return knex('fabrics').select('*').where('id', fabricId).first()
        },

        insertFabric(knex, newFabric) {
            return knex
                .insert(newFabric)
                .into('fabrics')
                .returning('*')
                .then(response => response[0])
        },

        updateFabric(knex, id, newFabricFields) {
            return knex('fabrics')
                .where({ id })
                .update(newFabricFields)
        },

        deleteFabric(knex, id) {
            return knex('fabrics')
                .where({ id })
                .delete()
        },

    // Fabric Types
        getAllFabricTypes(knex) {
            return knex('fabric_types').select('*')
        },

        insertFabricType(knex, newFabricType) {
            return knex
                .insert(newFabricType)
                .into('fabric_types')
                .returning('*')
                .then(response => response[0])
        },

    // Factories
        getFactoriesForFabric(knex, fabricId) {
            console.log('getFactoriesForFabric ran')
            return knex('fabrics_to_factories')
                .join('factories', {'fabrics_to_factories.factory_id': 'factories.id'})
                .select(
                    'factories.id',
                    'factories.english_name as factory_name',
                    'factories.country',
                    'factories.website',
                    'factories.notes',
                )
                .where('fabric_id', fabricId)
        },

        insertFabricFactory(knex, newPair) {
            return knex
                .insert(newPair)
                .into('fabrics_to_factories')
                .returning('*')
                .then(response => response[0])
        },

    // Fibers
        getFibersForFabric(knex, fabricId) {
            return knex('fabrics_to_fibers_and_materials')
                .join('fibers_and_materials', {'fabrics_to_fibers_and_materials.fiber_or_material_id': 'fibers_and_materials.id'})
                .join('fiber_and_material_types', {'fibers_and_materials.fiber_or_material_type_id': 'fiber_and_material_types.id'})
                .join('fibers_to_factories', {'fibers_and_materials.producer_id': 'fibers_to_factories.factory_id'})
                .join('factories', {'fibers_to_factories.factory_id': 'factories.id'})
                .select(
                    'fibers_and_materials.id',
                    'fibers_and_materials.fiber_or_material_type_id',
                    'fiber_and_material_types.english_name as fiber_type',
                    'fiber_and_material_types.fiber_type_class',
                    'fibers_and_materials.producer_country',
                    'fibers_and_materials.producer_id',
                    'factories.english_name as factory',
                    'factories.country as factory_country',
                    'factories.website as factory_website',
                    'factories.notes as factory_notes',
                    'fibers_and_materials.producer_notes',
                    'fibers_and_materials.approved_by_admin',
                    'fibers_and_materials.date_published'
                )
                .where('fabric_id', fabricId)
        },
        
        insertFabricFiber(knex, newPair) {
            return knex
                .insert(newPair)
                .into('fabrics_to_fibers_and_materials')
                .returning('*')
                .then(response => response[0])
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
        getCertificationsForFabric(knex, fabricId) {
            return knex('fabrics_to_certifications')
                .join('certifications', {'fabrics_to_certifications.certification_id': 'certifications.id'})
                .select(
                    'certifications.id',
                    'certifications.english_name as certification_name',
                    'certifications.website',
                )
                .where('fabric_id', fabricId)
        },

        insertFabricFactory(knex, newPair) {
            return knex
                .insert(newPair)
                .into('fabrics_to_factories')
                .returning('*')
                .then(response => response[0])
        },

    // Notion Types
        getAllNotionTypes(knex) {
            return knex('notion_types').select('*')
        },

        insertNotionType(knex, notionType) {
            return knex
            .insert(notionType)
            .into('notion_types')
            .returning('*')
            .then(response => response[0])
        }
}

module.exports = FabricsService