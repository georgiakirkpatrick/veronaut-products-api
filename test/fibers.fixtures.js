const makeFiberArray = () => {
    const fibersPost = [
        {
            id: 1,
            fiber_or_material_type_id: 1,
            brand_id: 1,
            producer_country: 1,
            producer_id: 1,
            production_notes: 'Notes',
            approved_by_admin: true,
            date_published: '2020-10-05T18:32:57.458Z'
        },
        {
            id: 2,
            fiber_or_material_type_id: 1,
            brand_id: 1,
            producer_country: 1,
            producer_id: 1,
            production_notes: 'Notes',
            approved_by_admin: false,
            date_published: '2020-10-05T18:32:57.458Z'
        }
    ]

    const fibersGet = [
        {
            id: 1,
            brand_id: 1,
            producer_country: 1,
            producer_id: 1,
            approved_by_admin: true,
            date_published: '2020-10-05T18:32:57.458Z',
            fiber_type_id: 1,
            fiber_type: 'Cotton',
            class: 'naturally occuring cellulosic fiber',
            producer: 'The Orange Concept',
            production_notes: 'Notes',
            producer_website: "www.orange.com"
        },
        {
            id: 2,
            brand_id: 1,
            producer_country: 1,
            producer_id: 1,
            production_notes: 'Notes',
            approved_by_admin: false,
            date_published: '2020-10-05T18:32:57.458Z',
            fiber_type_id: 1,
            fiber_type: 'Cotton',
            class: 'naturally occuring cellulosic fiber',
            producer: 'The Orange Concept',
            production_notes: 'Notes',
            producer_website: "www.orange.com"
        }
    ]

    return { fibersPost, fibersGet }
}

const makeFiberToCertArray = () => (
    [
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
)

const makeFiberToMalCertArray = () => (
    {
        fiber_or_material_id: 1,
        certification_id: 666
    }
)

const makeFiberTypeArray = () => (
    [
        {
            id: 1,
            english_name: 'Cotton',
            fiber_type_class: 'naturally occuring cellulosic fiber',
            approved_by_admin: true,
            date_published: '2020-10-05T18:32:57.458Z'
        },
        {
            id: 2,
            english_name: 'Wool',
            fiber_type_class: 'protein fiber',
            approved_by_admin: true,
            date_published: '2020-10-05T18:32:57.458Z'
        }
    ]
)

const makeMalFiberType = () => {
    const malFiberType = {
        id: 666,
        english_name: '<a>Bad fiber type</a>',
        fiber_type_class: 'undetermined',
        approved_by_admin: true,
        date_published: '2020-10-05T18:32:57.458Z'
    }

    const expectedFiberType = {
        ...malFiberType,
        english_name: '&lt;a&gt;Bad fiber type&lt;/a&gt;'
    }

    return {
        malFiberType,
        expectedFiberType
    }
}

const makeMalFiber = () => {
    const malFiber = {
        id: 666,
        fiber_or_material_type_id: 666,
        brand_id: 666,
        producer_country: 1,
        producer_id: 666,
        production_notes: '<a>Notes</a>',
        approved_by_admin: true,
        date_published: '2020-10-05T18:32:57.458Z'
    }

    const expectedFiber = {
        id: 666,
        fiber_type_id: 666,
        fiber_type: '&lt;a&gt;Bad fiber type&lt;/a&gt;',
        class: 'undetermined',
        brand_id: 666,
        producer_country: 1,
        producer_id: 666,
        producer: '&lt;a href="www.evil.com"&gt;Evil&lt;/a&gt;',
        producer_website: '&lt;a href="www.evil.com"&gt;www.evil.com&lt;/a&gt;',
        production_notes: '&lt;a&gt;Notes&lt;/a&gt;',
        approved_by_admin: true,
        date_published: '2020-10-05T18:32:57.458Z'
    }

    return {
        malFiber,
        expectedFiber
    }
}

module.exports = {
    makeFiberArray,
    makeFiberToCertArray,
    makeFiberToMalCertArray,
    makeFiberTypeArray,
    makeMalFiberType,
    makeMalFiber
}