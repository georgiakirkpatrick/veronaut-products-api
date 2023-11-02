const NotionsService = {
    // Notions
        getAllNotions(knex) {
            return knex('notions')
                .join('notion_types', {'notions.notion_type_id': 'notion_types.id'})
                .select(
                    'notions.id',
                    'notions.notion_type_id',
                    'notion_types.english_name as type',
                    'notions.brand_id',
                    'notions.manufacturer_country',
                    'notions.manufacturer_id',
                    'notions.manufacturer_notes',
                    'notions.material_type_id',
                    'notions.material_origin_id',
                    'notions.material_producer_id',
                    'notions.material_notes',
                    'notions.approved_by_admin',
                    'notions.created_at',
                    'notions.updated_at'
                )
        },        
        
        getNotionById(knex, notionId) {
            return knex('notions')
                .join('notion_types', {'notions.notion_type_id': 'notion_types.id'})
                .select(
                    'notions.id',
                    'notions.notion_type_id',
                    'notion_types.english_name as type',
                    'notions.brand_id',
                    'notions.manufacturer_country',
                    'notions.manufacturer_id',
                    'notions.manufacturer_notes',
                    'notions.material_type_id',
                    'notions.material_origin_id',
                    'notions.material_producer_id',
                    'notions.material_notes',
                    'notions.approved_by_admin',
                    'notions.created_at',
                    'notions.updated_at'
                )
                .where('notions.id', notionId)
                .first()
        },

        insertNotion(knex, notionDetails) {
            return knex
                .insert(notionDetails)
                .into('notions')
                .returning('*')
                .then(response => response[0])
        },

        updateNotion(knex, notionId, fieldsToUpdate) {
            return knex('notions')
                .where({ id: notionId })
                .update(fieldsToUpdate)
        },

        deleteNotion(knex, notionId) {
            return knex('notions')
                .where({ id: notionId })
                .delete()
        },

    // Certifications
        getCertsForNot(knex, notionId) {
            return knex('notions')
                .join('notions_to_certifications', {'notions.id': 'notions_to_certifications.notion_id'})
                .join('certifications', {'notions_to_certifications.certification_id': 'certifications.id'})
                .select(
                    'certifications.id',
                    'certifications.english_name',
                    'certifications.website',
                    'certifications.approved_by_admin',
                    'certifications.created_at',
                    'certifications.updated_at'
                )
                .where('notions.id', notionId)

        },

        insertNotCert(knex, notCertPair) {
            return knex
                .insert(notCertPair)
                .into('notions_to_certifications')
                .returning('*')
                .then(response => response[0])
        },

    // Materials
        insertNotMat(knex, notMatPair) {
            return knex
                .insert(notMatPair)
                .into('notions_to_fibers_and_materials')
                .returning('*')
                .then(response => response[0])
        },

    // Notion Types
        getAllNotTypes(knex) {
            return knex('notion_types').select('*')
        },

        insertNotType(knex, newNotType) {
            return knex
                .insert(newNotType)
                .into('notion_types')
                .returning('*')
                .then(response => response[0])
        }
}

module.exports = NotionsService