function makeBrandsArray() {
    return [
        {
            id: 1,
            english_name: 'Sezane',
            home_currency: 2,
            website: 'www.sezane.com',
            size_system: 1,
            approved_by_admin: true,
            date_published: '2020-09-13T07:30:51.564Z'
        },
        {
            id: 2,
            english_name: 'Silvania',
            home_currency: 1,
            website: 'www.silvania.com',
            size_system: 1,
            approved_by_admin: true,
            date_published: '2020-09-13T07:30:51.564Z'
        }
    ]
}

function makeFiberArrayGet() {
    return [
        {
            id: 1,
            fiber_type_id: 1,
            fiber_type: 'Merino wool',
            class: 'protein fiber',
            brand_id: 1,
            producer_country: 'US',
            producer_id: 1,
            producer: 'The Orange Concept',
            factory_notes: 'family-owned',
            producer_notes: 'Notes',
            producer_website: "www.orange.com",
            approved_by_admin: true,
            date_published: '2020-10-05T18:32:57.458Z'

        },
        {
            id: 2,
            fiber_type_id: 1,
            fiber_type: 'Merino wool',
            class: 'protein fiber',
            brand_id: 1,
            producer_country: 'US',
            producer_id: 1,
            producer: 'The Orange Concept',
            factory_notes: 'family-owned',
            producer_notes: 'Notes',
            producer_website: "www.orange.com",
            approved_by_admin: false,
            date_published: '2020-10-05T18:32:57.458Z'
        }
    ]
}    

function makeFiberArrayPost() {
    return [
        {
            id: 1,
            fiber_or_material_type_id: 1,
            brand_id: 1,
            producer_country: 'US',
            producer_id: 1,
            producer_notes: 'Notes',
            approved_by_admin: true,
            date_published: '2020-10-05T18:32:57.458Z'
        },
        {
            id: 2,
            fiber_or_material_type_id: 1,
            brand_id: 1,
            producer_country: 'US',
            producer_id: 1,
            producer_notes: 'Notes',
            approved_by_admin: false,
            date_published: '2020-10-05T18:32:57.458Z'
        }
    ]
}

function makeFiberTypeArray() {
    return [
        {
            id: 1,
            english_name: 'Cotton',
            fiber_type_class: 'naturally occuring cellulosic fiber',
            approved_by_admin: true,
            date_published: '2020-10-05T18:32:57.458Z'
        }
    ]
}

module.exports = {
    makeBrandsArray,
    makeFiberArrayGet,
    makeFiberArrayPost,
    makeFiberTypeArray
}