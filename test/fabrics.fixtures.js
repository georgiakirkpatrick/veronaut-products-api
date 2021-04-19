function makeFabricTypesArray() {
    return [
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
}

function makeFiberTypesArray() {
    return [
        {
            id: 1,
            english_name: 'cotton',
            fiber_type_class: 'naturally occuring cellulosic fiber',
            approved_by_admin: true,
            date_published: '2020-09-13T07:30:51.564Z'
        },
        {
            id: 2,
            english_name: 'linen',
            fiber_type_class: 'naturally occuring cellulosic fiber',
            approved_by_admin: true,
            date_published: '2020-09-13T07:30:51.564Z'
        },
        {
            id: 3,
            english_name: 'silk',
            fiber_type_class: 'protein fiber',
            approved_by_admin: true,
            date_published: '2020-09-13T07:30:51.564Z'
        }
    ]
}

function makeNotionTypesArray() {
    return [
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
}

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

function makeFabricsArray() {
    return [
        {
            id: 1,
            // fabric_type_id: 1,
            brand_id: 1,
            fabric_mill_country: 1,
            fabric_mill_notes: 'This is a fabric mill',
            dye_print_finish_country: 2,
            dye_print_finish_notes: 'This is a dye plant',
            approved_by_admin: true,
            date_published: '2020-09-13T07:30:51.564Z'
        },
        {
            id: 2,
            // fabric_type_id: 1,
            brand_id: 1,
            fabric_mill_country: 2,
            fabric_mill_notes: 'This is a fabric mill',
            dye_print_finish_country: 1,
            dye_print_finish_notes: 'This is a dye plant',
            approved_by_admin: true,
            date_published: '2020-09-13T07:30:51.564Z'
        }
    ]
}

function makeFibersArray() {
    return [
        {
            id: 1,
            fiber_or_material_type_id: 1,
            brand_id: 1,
            producer_country: 1,
            producer_id: 1,
            production_notes: 'Notes',
            approved_by_admin: true
        },
        {
            id: 2,
            fiber_or_material_type_id: 1,
            brand_id: 1,
            producer_country: 1,
            producer_id: 1,
            production_notes: 'Notes',
            approved_by_admin: true
        }
    ]
}

function makeFabricsToCertifications() {
    return [
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
} 

function makeFabricsToFibers() {
    return [
        {
            fabric_id: 1,
            fiber_or_material_id: 1,
            percent_of_fabric: 50
        }
    ]    
}

function makeFibersToFactories() {
    return [
        {
            fiber_or_material_id: 1,
            factory_id: 1
        }
    ]    
}  

function makeFabricsToFactories() {
    return [
        {
            fabric_id: 1,
            factory_id: 1
        }
    ]    
}

function makeMaliciousFibersToFactories() {
    return [
        {
            fiber_or_material_id: 666,
            factory_id: 1
        }
    ]    
}  

function makeCertificationsArray() {
    return [
        {
            id: 1,
            english_name: 'Organic',
            website: 'www.organic.com',
            approved_by_admin: true,
            date_published: '2020-09-13T07:30:51.564Z'
        },
        {
            id: 2,
            english_name: 'Fair Trade',
            website: 'www.fairtrade.com',
            approved_by_admin: true,
            date_published: '2020-09-13T07:30:51.564Z'
        },
        {
            id: 3,
            english_name: 'Green',
            website: 'www.green.com',
            approved_by_admin: true,
            date_published: '2020-09-13T07:30:51.564Z'
        }
    ]
}

function makeFactoriesArray() {
    return [
        {
            id: 1,
            english_name: 'The Big Factory',
            country: 1,
            website: 'www.factory.com',
            notes: 'Factories',
            approved_by_admin: true,
            date_published: '2020-09-13T07:30:51.564Z'
        },
        {
            id: 2,
            english_name: 'The Small Factory',
            country: 2,
            website: 'www.factory.com',
            notes: 'Factories',
            approved_by_admin: true,
            date_published: '2020-09-13T07:30:51.564Z'
        }
    ]
}

function makeFabricsToMaliciousFibers() {
    return {
        fabric_id: 1,
        fiber_or_material_id: 666
    }
}

function makeFabricsToMaliciousCertifications() {
    return {
        fabric_id: 1,
        certification_id: 666
    }
}

function makeFabricsToMaliciousFactories() {
    return {
        fabric_id: 1,
        factory_id: 666
    }
}

function makeMaliciousFabricType() {
    const maliciousFabricType = {
        id: 1,
        english_name: '<a href="www.fabric.com">Fabric</a>',
        fabric_type_class: 'woven',
        approved_by_admin: true,
        date_published: '2020-09-13T07:30:51.564Z'
    }

    const expectedFabricType = {
        ...maliciousFabricType,
        english_name: '&lt;a href="www.fabric.com"&gt;Fabric&lt;/a&gt;',
    }

    return {
        maliciousFabricType,
        expectedFabricType
    }
}


function makeMaliciousFiberType() {
    const maliciousFiberType = {
        id: 666,
        english_name: '<a href="www.fiber.com">Fiber</a>',
        fiber_type_class: 'naturally occuring cellulosic fiber',
        approved_by_admin: true,
        date_published: '2020-09-13T07:30:51.564Z'
    }

    const expectedFiberType = {
        ...maliciousFiberType,
        english_name: '&lt;a href="www.fiber.com"&gt;Fiber&lt;/a&gt;',
    }

    return {
        maliciousFiberType,
        expectedFiberType
    }
}

function makeMaliciousNotionType() {
    const maliciousNotionType = {
        id: 666,
        english_name: '<a href="www.notion.com">Notion</a>',
        approved_by_admin: true,
        date_published: '2020-09-13T07:30:51.564Z'
    }

    const expectedNotionType = {
        ...maliciousNotionType,
        english_name: '&lt;a href="www.notion.com"&gt;Notion&lt;/a&gt;',
    }

    return {
        maliciousNotionType,
        expectedNotionType
    }
}

function makeMaliciousFabric() {
    const maliciousFabric = {
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
        ...maliciousFabric,
        fabric_mill_notes: '&lt;a href="www.notes.com"&gt;Notes&lt;/a&gt;',
        dye_print_finish_notes: '&lt;a href="www.notes.com"&gt;Notes&lt;/a&gt;'
    }

    return {
        maliciousFabric,
        expectedFabric
    }
}

function makeMaliciousFactoriesArray() {
    const maliciousFactory = {
        id: 666,
        english_name: '<a href="www.notes.com">Notes</a>',
        country: 1,
        website: '<a href="www.factory.com">www.factory.com</a>',
        notes: '<a href="www.factory.com">Factories</a>',
        approved_by_admin: true,
        date_published: '2020-09-13T07:30:51.564Z'
    }

    const expectedFactory = {
        ...maliciousFactory,
        english_name: '&lt;a href="www.notes.com"&gt;Notes&lt;/a&gt;',
        website: '&lt;a href="www.factory.com"&gt;www.factory.com&lt;/a&gt;',
        notes: '&lt;a href="www.factory.com"&gt;Factories&lt;/a&gt;'
    }

    return {
        maliciousFactory,
        expectedFactory
    }
}

function makeMaliciousFiber() {
    const maliciousFiber = {
        id: 666,
        fiber_or_material_type_id: 1,
        brand_id: 1,
        producer_country: 1,
        producer_id: 1,
        production_notes: '<a href="www.notes.com">Notes</a>',
        approved_by_admin: false,
        date_published: '2020-09-13T07:30:51.564Z'
    }

    const expectedFiber = {
        id: 666,
        brand_id: 1,
        producer_country: 1,
        producer_id: 1,
        production_notes: '&lt;a href="www.notes.com"&gt;Notes&lt;/a&gt;',
        fiber_type_id: 1,
        fiber_type: 'Merino wool',
        class: 'protein fiber',
        factory: 'The Orange Concept',
        factory_country: 1,
        factory_website: 'www.orange.com',
        factory_notes: 'family-owned',
        approved_by_admin: false,
        date_published: '2020-09-13T07:30:51.564Z'
    }

    return {
        maliciousFiber,
        expectedFiber
    }
}

function makeMaliciousCertification() {
    const maliciousCertification = {
        id: 666,
        english_name: '<a href="www.certification.com">Certification</a>',
        website: '<a href="www.certification.com">www.certification.com</a>',
        approved_by_admin: true,
        date_published: '2020-09-13T07:30:51.564Z'
    } 

    const expectedCertification = {
        ...maliciousCertification,
        english_name: '&lt;a href="www.certification.com"&gt;Certification&lt;/a&gt;',
        website: '&lt;a href="www.certification.com"&gt;www.certification.com&lt;/a&gt;'
    }

    return {
        maliciousCertification,
        expectedCertification
    }
}

function makeMaliciousNotion() {
    const maliciousNotion = {
        id: 666,
        notion_type_id: 1,
        brand_id: 1,
        notion_factory_country: 1,
        notion_factory_id: 1,
        notion_factory_notes: '<a href="www.notes.com">Notes</a>',
        approved_by_admin: true,
        date_published: '2020-09-13T07:30:51.564Z'
    }

    const expectedNotion = {
        ...maliciousNotion,
        notion_factory_notes: '&lt;a href="www.notes.com"&gt;Notes&lt;/a&gt;'
    }

    return {
        maliciousNotion,
        expectedNotion
    }
}

module.exports = {
    makeBrandsArray,
    makeFabricTypesArray,
    makeFiberTypesArray,
    makeNotionTypesArray,
    makeFibersArray,
    makeFabricsArray,
    makeCertificationsArray,
    makeFactoriesArray,
    makeFabricsToFibers,
    makeFabricsToCertifications,
    makeFibersToFactories,
    makeFabricsToFactories,
    makeMaliciousFabricType,
    makeMaliciousFactoriesArray,
    makeMaliciousFiberType,
    makeMaliciousNotionType,
    makeMaliciousNotion,
    makeMaliciousFabric,
    makeMaliciousFiber,
    makeMaliciousFibersToFactories,
    makeFabricsToMaliciousFibers,
    makeMaliciousCertification,
    makeFabricsToMaliciousCertifications,
    makeFabricsToMaliciousFactories
}