const { makeFactory } = require('./factories.fixtures')
const { makeCertArray, makeMalCert } = require('./certifications.fixtures')

const factory = makeFactory()['factoryInsert']
const { certArrayGet } = makeCertArray()
const { malCertGet } = makeMalCert()

const makeFiber = () => {
    const fiberPost = {
        fiber_or_material_type_id: 1,
        brand_id: 1,
        producer_country: 1,
        producer_id: 1,
        production_notes: 'Notes',
    }

    const fiberInsert = {
        id: 1,
        ...fiberPost,
        approved_by_admin: true,
        created_at: '2020-10-05T18:32:57.458Z',
        updated_at: '2020-10-05T18:32:57.458Z'
    }

    const fiberGet = [
        {
            ...fiberInsert,
            producer_country: factory.country,
            producer_id: factory.id,
            fiber_type: 'Cotton',
            class: 'naturally occuring cellulosic fiber',
            producer: factory.english_name,
            producer_website: factory.website
        }
    ]

    return { fiberPost, fiberInsert, fiberGet }
}

const makeFibToCert = () => {
    const fibToCertArray = [
        {
            fiber_or_material_id: 1,
            certification_id: 1
        },
        {
            fiber_or_material_id: 1,
            certification_id: 2
        },
        {
            fiber_or_material_id: 1,
            certification_id: 3
        }
    ]

    const fibCertGet = [
        {
            ...certArrayGet[0],
            certification_id: fibToCertArray[0].certification_id,
            fiber_id: fibToCertArray[0].fiber_or_material_id
        },
        {
            ...certArrayGet[1],
            certification_id: fibToCertArray[1].certification_id,
            fiber_id: fibToCertArray[1].fiber_or_material_id
        },
        {
            ...certArrayGet[2],
            certification_id: fibToCertArray[2].certification_id,
            fiber_id: fibToCertArray[2].fiber_or_material_id
        }
    ]

    delete fibCertGet[0].id
    delete fibCertGet[1].id
    delete fibCertGet[2].id

    return { fibToCertArray, fibCertGet }
}
    
const makeMalFibToMalCert = () => {
    const malFibToMalCert = {
        fiber_or_material_id: 666,
        certification_id: 666
    }

    const malFibCertGet = {
        ...malCertGet,
        certification_id: malFibToMalCert.certification_id,
        fiber_id: malFibToMalCert.fiber_or_material_id
    }

    delete malFibCertGet.id

    return { malFibToMalCert, malFibCertGet }
}

const makeFiberType = () => {
    const ftPost = {
        english_name: 'Cotton',
        fiber_type_class: 'undetermined'
    }
    
    const ftInsert = {
        id: 1,
        ...ftPost,
        fiber_type_class: 'naturally occuring cellulosic fiber',
        approved_by_admin: true,
        created_at: '2020-10-05T18:32:57.458Z',
        updated_at: '2020-10-05T18:32:57.458Z'
    }

    const ftGet = [
        {
            ...ftInsert
        }
    ]

    return { ftPost, ftInsert, ftGet }
}

const makeMalFiberType = () => {
    const malFtPost = {
        english_name: '<a>Bad fiber type</a>',
    }

    const malFtInsert = {
        id: 666,
        ...malFtPost,
        fiber_type_class: 'undetermined',
        approved_by_admin: true,
        created_at: '2020-10-05T18:32:57.458Z',
        updated_at: '2020-10-05T18:32:57.458Z'
    }

    const malFtGet = [
        {
            ...malFtInsert,
            english_name: '&lt;a&gt;Bad fiber type&lt;/a&gt;'
        }
    ]

    return { malFtPost, malFtInsert, malFtGet }
}

const makeMalFiber = () => {
    const malFiberPost = {
        fiber_or_material_type_id: 666,
        brand_id: 666,
        producer_country: 1,
        producer_id: 666,
        production_notes: '<a>Notes</a>'
    }

    const malFiberInsert = {
        id: 666,
        ...malFiberPost,
        approved_by_admin: true,
        created_at: '2020-10-05T18:32:57.458Z',
        updated_at: '2020-10-05T18:32:57.458Z'
    }

    const malFiberGet = [
        {
            ...malFiberInsert,
            fiber_type: '&lt;a&gt;Bad fiber type&lt;/a&gt;',
            class: 'undetermined',
            producer: '&lt;a href="www.evil.com"&gt;Evil&lt;/a&gt;',
            producer_website: '&lt;a href="www.evil.com"&gt;www.evil.com&lt;/a&gt;',
            production_notes: '&lt;a&gt;Notes&lt;/a&gt;'
        }
    ]

    return { malFiberPost, malFiberInsert, malFiberGet }
}

module.exports = {
    makeFiber,
    makeFibToCert,
    makeMalFibToMalCert,
    makeFiberType,
    makeMalFiberType,
    makeMalFiber
}