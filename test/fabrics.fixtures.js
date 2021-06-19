const makeFabricArray = () => (
    [
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
)

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

// const makeFibersArray = () => (
//     [
//         {
//             id: 1,
//             fiber_or_material_type_id: 1,
//             brand_id: 1,
//             producer_country: 1,
//             producer_id: 1,
//             production_notes: 'Notes',
//             approved_by_admin: true
//         },
//         {
//             id: 2,
//             fiber_or_material_type_id: 1,
//             brand_id: 1,
//             producer_country: 1,
//             producer_id: 1,
//             production_notes: 'Notes',
//             approved_by_admin: true
//         }
//     ]
// )

const makeFibersToFactories = () => (
    {
        fiber_or_material_id: 1,
        factory_id: 1
    }  
)

// const makeFiberTypesArray = () => (
//     [
//         {
//             id: 1,
//             english_name: 'cotton',
//             fiber_type_class: 'naturally occuring cellulosic fiber',
//             approved_by_admin: true,
//             date_published: '2020-09-13T07:30:51.564Z'

            
//         },
//         {
//             id: 2,
//             english_name: 'linen',
//             fiber_type_class: 'naturally occuring cellulosic fiber',
//             approved_by_admin: true,
//             date_published: '2020-09-13T07:30:51.564Z'
//         },
//         {
//             id: 3,
//             english_name: 'silk',
//             fiber_type_class: 'protein fiber',
//             approved_by_admin: true,
//             date_published: '2020-09-13T07:30:51.564Z'
//         }
//     ]
// }

// const makeCertificationArray = () => (
//     [
//         {
//             id: 1,
//             english_name: 'Organic',
//             website: 'www.organic.com',
//             approved_by_admin: true,
//             date_published: '2020-09-13T07:30:51.564Z'
//         },
//         {
//             id: 2,
//             english_name: 'Fair Trade',
//             website: 'www.fairtrade.com',
//             approved_by_admin: true,
//             date_published: '2020-09-13T07:30:51.564Z'
//         },
//         {
//             id: 3,
//             english_name: 'Green',
//             website: 'www.green.com',
//             approved_by_admin: true,
//             date_published: '2020-09-13T07:30:51.564Z'
//         }
//     ]
// }

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

// const makeMalCertification = () => (
//     const malCertification = {
//         id: 666,
//         english_name: '<a href="www.certification.com">Certification</a>',
//         website: '<a href="www.certification.com">www.certification.com</a>',
//         approved_by_admin: true,
//         date_published: '2020-09-13T07:30:51.564Z'
//     } 

//     const expectedCertification = {
//         ...malCertification,
//         english_name: '&lt;a href="www.certification.com"&gt;Certification&lt;/a&gt;',
//         website: '&lt;a href="www.certification.com"&gt;www.certification.com&lt;/a&gt;'
//     }

//     return {
//         malCertification,
//         expectedCertification
//     }
// }

const makeMalFabric = () => {
    const malFabric = {
        id: 666,
        // fabric_type_id: 1,
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

const makeMalFabricType = () => {
    const malFabricType = {
        id: 1,
        english_name: '<a href="www.fabric.com">Fabric</a>',
        fabric_type_class: 'woven',
        approved_by_admin: true,
        date_published: '2020-09-13T07:30:51.564Z'
    }

    const expectedFabricType = {
        ...malFabricType,
        english_name: '&lt;a href="www.fabric.com"&gt;Fabric&lt;/a&gt;',
    }

    return {
        malFabricType,
        expectedFabricType
    }
}

// const makeMalFiber = () => (
//     const malFiber = {
//         id: 666,
//         fiber_or_material_type_id: 666,
//         brand_id: 1,
//         producer_country: 1,
//         producer_id: 666,
//         production_notes: '<a href="www.notes.com">Notes</a>',
//         approved_by_admin: false,
//         date_published: '2020-09-13T07:30:51.564Z'
//     }

//     const expectedFiber = {
//         id: 666,
//         fiber_type_id: 666,
//         brand_id: 1,
//         producer_country: 1,
//         producer_id: 666,
//         fiber_type: '&lt;a href="www.fiber.com"&gt;Fiber&lt;/a&gt;',
//         class: 'naturally occuring cellulosic fiber',
//         production_notes: '&lt;a href="www.notes.com"&gt;Notes&lt;/a&gt;',
//         producer: '&lt;a href="www.evil.com"&gt;Evil&lt;/a&gt;',
//         producer_country: 1,
//         producer_website: '&lt;a href="www.evil.com"&gt;www.evil.com&lt;/a&gt;',
//         producer_notes: '&lt;a href="www.evil.com"&gt;Evil&lt;/a&gt;',
//         approved_by_admin: false,
//         date_published: '2020-09-13T07:30:51.564Z'
//     }

//     return {
//         malFiber,
//         expectedFiber
//     }
// }

const makeMalFibersToFactories = () => (
    {
        fiber_or_material_id: 666,
        factory_id: 666
    }
)  

// const makeMalFiberType = () => (
//     const malFiberType = {
//         id: 666,
//         english_name: '<a href="www.fiber.com">Fiber</a>',
//         fiber_type_class: 'naturally occuring cellulosic fiber',
//         approved_by_admin: true,
//         date_published: '2020-09-13T07:30:51.564Z'
//     }

//     const expectedFiberType = {
//         ...malFiberType,
//         english_name: '&lt;a href="www.fiber.com"&gt;Fiber&lt;/a&gt;',
//     }

//     return {
//         malFiberType,
//         expectedFiberType
//     }
// }

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
    makeMalFabricType,
    makeMalNotionType,
    makeMalNotion,
    makeMalFibersToFactories,
    makeFabricsTomalFibers,
    makeFabricsTomalCertifications,
    makeFabricsTomalFactories
}