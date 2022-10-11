const makeFabricArray = () => {
    const fabricArray = [
        {
            id: 1,
            brand_id: 1,
            fabric_mill_country: 1,
            fabric_mill_id: 1,
            fabric_mill_notes: 'This is a fabric mill',
            dye_print_finish_country: 2,
            dye_print_finish_id: 1,
            dye_print_finish_notes: 'This is a dye plant',
            approved_by_admin: true,
            date_published: '2020-09-13T07:30:51.564Z'
        },
        {
            id: 2,
            brand_id: 1,
            fabric_mill_country: 2,
            fabric_mill_id: 1,
            fabric_mill_notes: 'This is a fabric mill',
            dye_print_finish_country: 1,
            dye_print_finish_id: 1,
            dye_print_finish_notes: 'This is a dye plant',
            approved_by_admin: true,
            date_published: '2020-09-13T07:30:51.564Z'
        }
    ]

    const expectedFabricArray = [
        {
            id: 1,
            brand_id: 1,
            fabric_mill_country: 1,
            fabric_mill_id: 1,
            fabric_mill_notes: 'This is a fabric mill',
            dye_print_finish_country: 2,
            dye_print_finish_id: 1,
            dye_print_finish_notes: 'This is a dye plant',
            certification_ids: [],
            fibers: [],
            approved_by_admin: true,
            date_published: '2020-09-13T07:30:51.564Z'
        },
        {
            id: 2,
            brand_id: 1,
            fabric_mill_country: 2,
            fabric_mill_id: 1,
            fabric_mill_notes: 'This is a fabric mill',
            dye_print_finish_country: 1,
            dye_print_finish_id: 1,
            dye_print_finish_notes: 'This is a dye plant',
            certification_ids: [],
            fibers: [],
            approved_by_admin: true,
            date_published: '2020-09-13T07:30:51.564Z'
        }
    ]

    return { fabricArray, expectedFabricArray }
}

const makeFabricsToCertifications = () => (
    [
        {
            fabric_id: 1,
            certification_id: 1
        },
        {
            fabric_id: 1,
            certification_id: 2
        },
        {
            fabric_id: 1,
            certification_id: 3
        }
    ]    
)

const makeFabricsToFactories = () => (
    [
        {
            fabric_id: 1,
            factory_id: 1
        }
    ]    
)

const makeFabricsToFibers = () => (
    [
        {
            fabric_id: 1,
            fiber_or_material_id: 1,
            percent_of_fabric: 50
        }
    ]    
)

const makeFabricTypeArray = () => (
    [
        {
            id: 1,
            english_name: 'poplin',
            fabric_type_class: 'woven',
            approved_by_admin: true,
            date_published: '2020-09-13T07:30:51.564Z'
        },
        {
            id: 2,
            english_name: 'interlock',
            fabric_type_class: 'knit',
            approved_by_admin: true,
            date_published: '2020-09-13T07:30:51.564Z'
        }
    ]
)

const makeFibersToFactories = () => (
    {
        fiber_or_material_id: 1,
        factory_id: 1
    }  
)

const makeFabricsTomalFibers = () => (
    {
        fabric_id: 1,
        fiber_or_material_id: 666
    }
)

const makeFabricsTomalCertifications = () => (
    {
        fabric_id: 1,
        certification_id: 666
    }
)

const makeFabricsTomalFactories = () => (
    {
        fabric_id: 1,
        factory_id: 666
    }
)

const makeMalFabric = () => {
    const malFabric = {
        id: 666,
        brand_id: 1,
        fabric_mill_country: 2,
        fabric_mill_id: 2,
        fabric_mill_notes: '<a href="www.notes.com">Notes</a>',
        dye_print_finish_country: 1,
        dye_print_finish_id: 2,
        dye_print_finish_notes: '<a href="www.notes.com">Notes</a>',
        approved_by_admin: true,
        date_published: '2020-09-13T07:30:51.564Z'
    }

    const expectedFabric = {
        ...malFabric,
        fabric_mill_notes: '&lt;a href="www.notes.com"&gt;Notes&lt;/a&gt;',
        dye_print_finish_notes: '&lt;a href="www.notes.com"&gt;Notes&lt;/a&gt;'
    }

    return {
        malFabric,
        expectedFabric
    }
}

const makeMalFibersToFactories = () => (
    {
        fiber_or_material_id: 666,
        factory_id: 666
    }
)

const makeMalNotion = () => {
    const malNotion = {
        id: 666,
        notion_type_id: 1,
        brand_id: 1,
        notion_factory_country: 1,
        manufacturer_id: 1,
        notion_factory_notes: '<a href="www.notes.com">Notes</a>',
        approved_by_admin: true,
        date_published: '2020-09-13T07:30:51.564Z'
    }

    const expectedNotion = {
        ...malNotion,
        notion_factory_notes: '&lt;a href="www.notes.com"&gt;Notes&lt;/a&gt;'
    }

    return {
        malNotion,
        expectedNotion
    }
}

const makeMalNotionType = () => {
    const malNotionType = {
        id: 666,
        english_name: '<a href="www.notion.com">Notion</a>',
        approved_by_admin: true,
        date_published: '2020-09-13T07:30:51.564Z'
    }

    const expectedNotionType = {
        ...malNotionType,
        english_name: '&lt;a href="www.notion.com"&gt;Notion&lt;/a&gt;',
    }

    return {
        malNotionType,
        expectedNotionType
    }
}

const makeNotionTypesArray = () => (
    [
        {
            id: 1,
            english_name: 'button',
            approved_by_admin: true,
            date_published: '2020-09-13T07:30:51.564Z'
        },
        {
            id: 2,
            english_name: 'zipper',
            approved_by_admin: true,
            date_published: '2020-09-13T07:30:51.564Z'
        }
    ]
)

module.exports = {
    makeFabricTypeArray,
    makeNotionTypesArray,
    makeFabricArray,
    makeFabricsToFibers,
    makeFabricsToCertifications,
    makeFibersToFactories,
    makeFabricsToFactories,
    makeMalFabric,
    makeMalNotionType,
    makeMalNotion,
    makeMalFibersToFactories,
    makeFabricsTomalFibers,
    makeFabricsTomalCertifications,
    makeFabricsTomalFactories
}