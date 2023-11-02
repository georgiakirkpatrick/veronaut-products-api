const { makeBrand, makeMalBrand } = require('./brands.fixtures')
const { makeCategoryArray } = require('./categories.fixtures')
const { makeCertArray, makeMalCert } = require('./certifications.fixtures')
const { makeFabric, makeMalFabric } = require('./fabrics.fixtures')
const { makeFactory, makeMalFactory } = require('./factories.fixtures')
const { makeFiber, makeFiberType,makeMalFiber } = require('./fibers.fixtures')

const makeMalNotionType = () => {
    const malNtPost = {
        english_name: '<a>button</a>'
    }

    const malNtInsert = {
        id: 666,
        english_name: '&lt;a&gt;button&lt;/a&gt;',
        approved_by_admin: true,
        created_at: '2020-09-13T07:30:51.564Z',
        updated_at: '2020-09-13T07:30:51.564Z'
    }

    const malNtGet = [malNtInsert]

    return { malNtPost, malNtInsert, malNtGet }
}

const makeMalNotion = () => {
    const malNotionPost = {
        notion_type_id: 666,
        brand_id: makeBrand().brandInsert.id,
        manufacturer_country: 1,
        manufacturer_id: makeMalFactory().malFactInsert.id,
        manufacturer_notes: makeMalFactory().malFactInsert.notes,
        material_type_id: makeMalFiber().malFiberInsert.id,
        material_origin_id: makeMalFiber().malFiberInsert.producer_country,
        material_producer_id: makeMalFiber().malFiberInsert.producer_id,
        material_notes: makeMalFiber().malFiberInsert.production_notes
    }

    const malNotionInsert = {
        id: 666,
        ...malNotionPost,
        approved_by_admin: true,
        created_at: '2020-09-13T07:30:51.564Z',
        updated_at: '2020-09-13T07:30:51.564Z'
    }

    const malNotionGet = [
        {
            ...malNotionInsert,
            notion_type: makeMalNotionType().malNtGet[0].english_name,
            manufacturer_notes: makeMalFactory().malFactGet[0].notes,
            material_notes: makeMalFiber().malFiberGet[0].production_notes
        }
    ]

    return { malNotionPost, malNotionInsert, malNotionGet }
}

const makeNotionType = () => {
    const ntPost = {
        english_name: 'button'
    }

    const ntInsert = {
        ...ntPost,
        id: 1,
        approved_by_admin: false,
        created_at: '2020-10-01T23:47:20.381Z', 
        updated_at: '2023-03-07T23:04:54.568Z'
    }

    const ntGet = [ntInsert]

    return { ntPost, ntInsert, ntGet }
}

const makeNotion = () => {
    const notionPost = {
        notion_type_id: makeNotionType().ntInsert.id,
        brand_id: makeBrand().brandInsert.id,
        manufacturer_id: makeFactory().factoryInsert.id,
        material_type_id: makeFiber().fiberInsert.fiber_or_material_type_id,
        material_producer_id: makeFiber().fiberInsert.producer_id
    }

    const notionInsert = {
        ...notionPost,
        id: 1,
        manufacturer_country: makeFactory().factoryInsert.country,
        manufacturer_notes: makeFactory().factoryInsert.notes,
        material_origin_id: makeFiber().fiberInsert.producer_country,
        material_notes: makeFiber().fiberInsert.production_notes,
        approved_by_admin: true,
        created_at: '2020-09-13T07:30:51.564Z',
        updated_at: '2020-09-13T07:30:51.564Z'
    }

    const notionGet = [
        {
            ...notionInsert,
            notion_type: makeNotionType().ntGet[0].english_name,
            material_type: makeFiber().fiberGet[0].fiber_type
        }
    ]

    return { notionPost, notionInsert, notionGet }
}

const makeNotsToCerts = () => ([
    {
        certification_id: 1,
        notion_id: 1
    },
    {
        certification_id: 2,
        notion_id: 1
    },
    {
        certification_id: 3,
        notion_id: 1
    }
])

const makeMalNotToMalCert = () => ([
    {
        certification_id: 666,
        notion_id: 666
    }
])

module.exports = {
    makeMalNotionType,
    makeMalNotion,
    makeNotion,
    makeNotionType,
    makeNotsToCerts,
    makeMalNotToMalCert
}