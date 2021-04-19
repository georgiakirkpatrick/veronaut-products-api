const NotionsService = {
    // Notions
        getAllNotions(knex) {
            return knex('notions')
                .select('*')
        },        
        
        getNotionById(knex, notionId) {
            return knex('notions')
                .join('notion_types', {'notions.notion_type_id': 'notion_types.id'})
                .select(
                    'notions.id',
                    'notions.notion_type_id',
                    'notion_types.english_name as notion_type',
                    'notions.brand_id',
                    'notions.manufacturer_country',
                    'notions.manufacturer_id',
                    'notions.manufacturer_notes',
                    'notions.approved_by_admin',
                    'notions.date_published'
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
                .where({ notionId })
                .update(fieldsToUpdate)
        },

        deleteNotion(knex, notionId) {
            return knex('notions')
                .where({ notionId })
                .delete()
        },

    // Materials
        insertNotMat(knex, notMatPair) {
            return knex
                .insert(notMatPair)
                .into('notions_to_fibers_and_materials')
                .returning('*')
                .then(response => response[0])
        },

    // Certifications
        insertNotCert(knex, notCertPair) {
            return knex
                .insert(notCertPair)
                .into('notions_to_certifications')
                .returning('*')
                .then(response => response[0])
        }
}

module.exports = NotionsService