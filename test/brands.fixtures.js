function makeBrandsArray() {
    return [
        {
            id: 1,
            english_name: 'Sezane',
            website: 'www.sezane.com',
            home_currency: 'EUR',
            size_system: 'FR',
            approved_by_admin: true,
            date_published: '2020-09-13T07:30:51.564Z'
        },
        {
            id: 2,
            english_name: 'Amour Vert',
            website: 'www.amourvert.com',
            home_currency: 'USD',
            size_system: 'US',
            approved_by_admin: true,
            date_published: '2020-09-13T07:30:51.564Z'
        },
        {
            id: 3,
            english_name: 'Stella McCartney',
            website: 'www.stellamccartney.com',
            home_currency: 'USD',
            size_system: 'IT',
            approved_by_admin: true,
            date_published: '2020-09-13T07:30:51.564Z'
        }
    ]
}

function makeFiberTypesArray() {
    return [
        {
            id: 1,
            english_name: 'Merino wool',
            fiber_type_class: 'protein fiber',
            approved_by_admin: true,
            date_published: '2020-09-13T07:30:51.564Z'
        },
        {
            id: 2,
            english_name: 'Cotton',
            fiber_type_class: 'naturally occuring cellulosic fiber',
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

function makeNotionType() {
    return [
        {
            id: 1,
            english_name: "button",
            approved_by_admin: true,
            date_published: "2020-10-01T23:47:20.381Z"
        }
    ]
}        

function makeNotionsArrayGet() {
    return [
        {
            id: 1,
            notion_type_id: 1,
            notion_type: 'button',
            brand_id: 1,
            notion_factory_country: 'US',
            notion_factory_id: 1,
            notion_factory_notes: 'These are the notes',
            approved_by_admin: true,
            date_published: "2020-10-01T23:47:20.387Z"
        },
        {
            id: 2,
            notion_type_id: 1,
            notion_type: 'button',
            brand_id: 1,
            notion_factory_country: 'US',
            notion_factory_id: 1,
            notion_factory_notes: 'These are the notes for the second notions',
            approved_by_admin: true,
            date_published: '2020-10-01T23:47:20.387Z'
        }
    ]
}

function makeNotionsArrayPost() {
    return [
        {
            id: 1,
            notion_type_id: 1,
            brand_id: 1,
            notion_factory_country: 'US',
            notion_factory_id: 1,
            notion_factory_notes: 'These are the notes',
            approved_by_admin: true,
            date_published: "2020-10-01T23:47:20.387Z"
        },
        {
            id: 2,
            notion_type_id: 1,
            brand_id: 1,
            notion_factory_country: 'US',
            notion_factory_id: 1,
            notion_factory_notes: 'These are the notes for the second notions',
            approved_by_admin: true,
            date_published: "2020-10-01T23:47:20.387Z"
        }
    ]
}

function makeFactoryArray() {
    return [
        {
            id: 1,
            english_name: 'Factory 1',
            country: 'US',
            website: 'www.factory1.com',
            notes: 'This is a note',
            approved_by_admin: true,
            date_published: '2020-09-13T07:30:51.564Z'
        },
        {
            id: 2,
            english_name: 'Factory 2',
            country: 'CA',
            website: 'www.factory2.com',
            notes: 'This is a note',
            approved_by_admin: true,
            date_published: '2020-09-13T07:30:51.564Z'
        }
    ]
}

function makeMaliciousBrand() {
    const maliciousBrand = {
        id: 567,
        english_name: '<a src="www.sezane.com">Sezane</a>',
        website: '<a src="www.sezane.com">www.sezane.com</a>',
        home_currency: 'EUR',
        size_system: 'FR',
        approved_by_admin: true,
        date_published: '2020-09-13T07:30:51.564Z'
    }

    const expectedBrand = {
        ...maliciousBrand,
        english_name: '&lt;a src="www.sezane.com"&gt;Sezane&lt;/a&gt;',
        website: '&lt;a src="www.sezane.com"&gt;www.sezane.com&lt;/a&gt;',
    }

    return {
        maliciousBrand,
        expectedBrand
    }
}

function makeMaliciousFiber() {
    const maliciousFiber = {
        id: 666,
        fiber_or_material_type_id: 1,
        brand_id: 2,
        producer_country: 'US',
        producer_id: 1,
        producer_notes: 'This is a note about fiber <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">.',
        approved_by_admin: true
    }

    const expectedFiber = {
        ...maliciousFiber,
        producer_notes: 'This is a note about fiber &lt;img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);"&gt;.'
    }

    return {
        maliciousFiber,
        expectedFiber
    }
}

function makeMaliciousNotion() {
    const maliciousNotion = {
        id: 678,
        notion_type_id: 1,
        brand_id: 1,
        notion_factory_country: 'US',
        notion_factory_id: 1,
        notion_factory_notes: 'These are the <a href="www.notes.com">notes</a>',
        approved_by_admin: true
    }

    const expectedNotion = {
        ...maliciousNotion,
        notion_factory_notes: 'These are the &lt;a href="www.notes.com"&gt;notes&lt;/a&gt;'
    }

    return {
        maliciousNotion,
        expectedNotion
    }
}

function makeMaliciousNotionType() {
    const maliciousNotion = {
        id: 1,
        english_name: "<a>button</a>",
        approved_by_admin: true,
        date_published: "2020-10-01T23:47:20.381Z"
    }

    const expectedNotion = {
        ...maliciousNotion,
        english_name: '&lt;a&gt;button&lt;/a&gt;'
    }

    return {
        maliciousNotion,
        expectedNotion
    }
}

module.exports = {
    makeBrandsArray,
    makeFiberTypesArray,
    makeFiberArrayGet,
    makeFiberArrayPost,
    makeFactoryArray,
    makeMaliciousBrand,
    makeMaliciousFiber,
    makeMaliciousNotion,
    makeMaliciousNotionType,
    makeNotionsArrayGet,
    makeNotionsArrayPost,
    makeNotionType
}