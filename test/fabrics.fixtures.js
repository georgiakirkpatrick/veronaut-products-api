const makeFabric = () => {
    const fabricPost = {
        brand_id: 1,
        fabric_mill_country: 1,
        fabric_mill_id: 1,
        fabric_mill_notes: 'This is a fabric mill',
        dye_print_finish_country: 2,
        dye_print_finish_id: 1,
        dye_print_finish_notes: 'This is a dye plant'
    }

    const fabricInsert = {
        id: 1,
        ...fabricPost,
        approved_by_admin: true,
        created_at: '2020-09-13T07:30:51.564Z',
        updated_at: '2023-03-09T18:49:14.819Z'
    }

    const fabricGetAll = [
        {
            ...fabricInsert
        }
    ]

    const fabricGetOne = {
        ...fabricInsert,
        certification_ids: [],
        fibers: []
    }


    const newDate = new Date().toISOString()
    
    const fullFabUpdate = {
        brand_id: 2,
        fabric_mill_country: 2,
        fabric_mill_id: 2,
        fabric_mill_notes: 'Updated note',
        dye_print_finish_country: 2,
        dye_print_finish_id: 2,
        dye_print_finish_notes: 'Updated note',
        approved_by_admin: false,
        updated_at: newDate
    }

    return { fabricPost, fabricInsert, fabricGetAll, fabricGetOne, fullFabUpdate  }
}

const makeFabToCert = () => (
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

const makeFabToFact = () => (
    [
        {
            fabric_id: 1,
            factory_id: 1
        }
    ]    
)

const makeFabToFib = () => (
    [
        {
            fabric_id: 1,
            fiber_or_material_id: 1,
            percent_of_fabric: 50
        }
    ]    
)

const makeFibToFact = () => (
    {
        fiber_or_material_id: 1,
        factory_id: 1
    }  
)

const makeMalFabToMalFib = () => (
    {
        fabric_id: 666,
        fiber_or_material_id: 666,
        percent_of_fabric: 50
    }
)

const makeFabToMalCert = () => (
    {
        fabric_id: 666,
        certification_id: 666
    }
)

const makeMalFabToMalFact = () => (
    {
        fabric_id: 666,
        factory_id: 666
    }
)

const makeMalFabric = () => {
    const malFabPost = {
        brand_id: 666,
        fabric_mill_country: 2,
        fabric_mill_id: 2,
        fabric_mill_notes: '<a href="www.notes.com">Notes</a>',
        dye_print_finish_country: 1,
        dye_print_finish_id: 2,
        dye_print_finish_notes: '<a href="www.notes.com">Notes</a>'
    }

    const malFabInsert = {
        id: 666,
        ...malFabPost,
        approved_by_admin: true,
        created_at: '2020-09-13T07:30:51.564Z',
        updated_at: '2023-03-09T18:49:14.819Z'
    }

    const malFabGetAll = [
        {
            ...malFabInsert,
            fabric_mill_notes: '&lt;a href="www.notes.com"&gt;Notes&lt;/a&gt;',
            dye_print_finish_notes: '&lt;a href="www.notes.com"&gt;Notes&lt;/a&gt;'
        }
    ]

    const malFabGetOne = {
        ...malFabGetAll[0],
        certification_ids: [],
        fibers: []
    }

    return { malFabPost, malFabInsert, malFabGetAll, malFabGetOne }
}

const makeMalFibToFact = () => (
    {
        fiber_or_material_id: 666,
        factory_id: 666
    }
)

module.exports = {
    makeFabric,
    makeFabToFib,
    makeFabToCert,
    makeFibToFact,
    makeFabToFact,
    makeMalFabric,
    makeMalFibToFact,
    makeMalFabToMalFib,
    makeFabToMalCert,
    makeMalFabToMalFact
}