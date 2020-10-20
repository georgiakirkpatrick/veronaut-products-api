const CertificationsService = {
    getAllCertifications(knex) {
        return knex('certifications').select('*')
    },

    insertCertification(knex, newCertification) {
        return knex
            .into('certifications')
            .insert(newCertification)
            .returning('*')
            .then(response => response[0])
    },

    getCertificationById(knex, id) {
        return knex('certifications')
            .select('*')
            .where('id', id)
            .first()
    },

    updateCertification(knex, id, fieldsToUpdate) {
        return knex('certifications')
            .where({ id })
            .update(fieldsToUpdate)
    },

    deleteCertification(knex, id) {
        return knex('certifications')
            .where({ id })
            .delete()
    }
}

module.exports = CertificationsService