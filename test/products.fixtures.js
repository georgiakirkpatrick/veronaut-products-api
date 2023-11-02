const { makeBrand, makeMalBrand } = require('./brands.fixtures')
const { makeCategoryArray } = require('./categories.fixtures')
const { makeCertArray, makeMalCert } = require('./certifications.fixtures')
const { makeFabric, makeMalFabric } = require('./fabrics.fixtures')
const { makeFactory, makeMalFactory } = require('./factories.fixtures')
const { makeFiber, makeMalFiber } = require('./fibers.fixtures')
const { makeNotion, makeMalNotion } = require('./notions.fixtures')

const makeColor = () => {
    const colorPost = {
        color_description_id: 1,
        color_english_name: 'Lemon'
    }

    const colorInsert = {
        id: 1,
        product_id: 1,
        ...colorPost,
        approved_by_admin: true,
        created_at: "2020-09-13T07:30:51.564Z",
        updated_at: "2023-03-08T00:14:18.263Z"
    }

    const colorGet = [
        {
            ...colorInsert,
            swatch_image_url: ""
        }
    ]

    // const malColorPost = {
    //     color_description_id: 666,
    //     color_english_name: '<a href="www.bad-lemon.com">Lemon</a>',
    //     swatch_image_url: "<a href='www.bad-lemon.com'>Lemon</a>"
    // }

    // const malColorInsert = {
    //     id: 666,
    //     product_id: 1,
    //     ...colorPost,
    //     approved_by_admin: true,
    //     created_at: "2020-09-13T07:30:51.564Z",
    //     updated_at: "2023-03-08T00:14:18.263Z"
    // }

    // const malColorGet = [
    //     {
    //         ...colorInsert,
    //         color_english_name: '&lt;a href=\"www.bad-lemon.com\"&gt;Lemon&lt;/a&gt;',
    //         swatch_image_url: "&lt;a href=\"www.bad-lemon.com\"&gt;Lemon&lt;/a&gt;"
    //     }
    // ]
    
    return { colorPost, colorInsert, colorGet }
}

const makeDry = () => (
    { 
      id: 1,
      english_name: "Hang to dry"
    }
)

const makeImage = () => {
    const imagePost = {
        product_image_url: 'www.brand.com/product/image',
        color_id: makeColor().colorInsert.id,
        primary_image_for_color: true
    }

    const imageInsert = {
        id: 1,
        product_id: makeProduct().productInsert.id,
        ...imagePost,
        approved_by_admin: true,
        created_at: "2020-09-13T07:30:51.564Z",
        updated_at: "2023-03-08T00:14:18.263Z"
    }

    const imageGet = {
        ...imageInsert
    }

    return { imagePost, imageInsert, imageGet }
}

const makeMalColor = () => {
    const malColorPost = {
        color_english_name: 'mal color <script>alert("xss");</script>',
        color_description_id: 1,
        swatch_image_url: '<a href="www.lemon-swatch">Evil</a>',
        approved_by_admin: true
    }

    const malColorInsert = {
        id: 1,
        ...malColorPost,
        product_id: 1,
        created_at: "2020-09-13T07:30:51.564Z",
        updated_at: "2023-03-08T00:14:18.263Z"
    }

    const malColorGet = [
        {
            ...malColorInsert,
            color_english_name: 'mal color &lt;script&gt;alert("xss");&lt;/script&gt;',
            swatch_image_url: '&lt;a href="www.lemon-swatch"&gt;Evil&lt;/a&gt;'

        }
    ]    

    return { malColorPost, malColorInsert, malColorGet }
}

const makeMalImage = () => {
    const malImagePost = {
        product_id: makeProduct().productInsert.id,
        color_id: makeColor().colorInsert.id,
        product_image_url: '<a href="www.brand.com/product/image">Evil</a>',
        primary_image_for_color: true
    }

    const malImageInsert = {
        ...malImagePost,
        id: 666,
        product_image_url: '&lt;a href=\"www.brand.com/product/image\"&gt;Evil&lt;/a&gt;',
        approved_by_admin: true,
        created_at: "2020-09-13T07:30:51.564Z",
        updated_at: "2023-03-08T00:14:18.263Z"
    }

    const malImageGet = {
        ...malImageInsert
    }

    return { malImagePost, malImageInsert, malImageGet }
}

const makeMalProduct = () => {
    const malProdPost = {
        english_name: 'mal product <script>alert("xss");</script>',
        brand_id: makeMalBrand().malBrandInsert.id,
        category_id: makeCategoryArray().categoriesInsert[0].id,
        product_url: '<a href="https://google.com">google</a>',
        feature_image_url: '<a href="https://silvaniaperu.com/silvania-dress">https://silvaniaperu.com/silvania-dress</a>',
        multiple_color_options: true,
        cost_in_home_currency: 666,
        wash_id: 1,
        dry_id: 1,
        cmt_sew_country: 1,
        cmt_cut_country: 1,
        cmt_notes: 'This is a bad image for testing purposes <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">.',
        approved_by_admin: true,
        featured: true
    }

    const malProdInsert = {
        id: 1,
        ...malProdPost,
        created_at: "2020-09-13T07:30:51.564Z",
        updated_at: "2023-03-08T00:14:18.263Z"
    }

    const malProdGet = {
        ...malProdInsert,
        english_name: 'mal product &lt;script&gt;alert("xss");&lt;/script&gt;',
        product_url: '&lt;a href="https://google.com"&gt;google&lt;/a&gt;',
        cmt_notes: 'This is a bad image for testing purposes &lt;img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);"&gt;.',
        brand_currency: makeMalBrand().malBrandGet[0].home_currency,
        brand_name: makeMalBrand().malBrandGet[0].english_name,
        feature_image_url: '&lt;a href="https://silvaniaperu.com/silvania-dress"&gt;https://silvaniaperu.com/silvania-dress&lt;/a&gt;'
    }

    const extMalProdGet = {
        productObject: malProdGet,
        cmtFactArray: [],
        notCertArray: [],
        prodCertArray: [],
        prodColorArray: [],
        prodNotArray: []
    }

    return { malProdGet, malProdPost, malProdInsert, extMalProdGet }
}

const makeProdFab = () => {
    const prodToFabPost = {
        fabric_id: makeFabric().fabricInsert.id
    }
    
    const prodToFabInsert = {
        ...prodToFabPost,
        product_id: makeProduct().productInsert.id,
        relationship: 'primary',
        approved_by_admin: true,
        created_at: "2023-03-08T00:14:18.263Z",
        updated_at: "2023-03-08T00:14:18.263Z"
    }

    const prodToMalFabInsert = {
        ...prodToFabInsert,
        fabric_id: makeMalFabric().malFabInsert.id
    }

    const prodFabGet = () => {
        const getBody = [
            {
                ...makeFabric().fabricGetOne,
                relationship: prodToFabInsert.relationship,
                fab_approved_by_admin: makeFabric().fabricGetAll[0].approved_by_admin,
                pair_approved_by_admin: prodToFabInsert.approved_by_admin,
                pair_created_at: prodToFabInsert.created_at,
                pair_updated_at: prodToFabInsert.updated_at
            }
        ]

        delete getBody[0].approved_by_admin
        delete getBody[0].created_at
        delete getBody[0].updated_at

        return getBody
    }

    return { prodToFabPost, prodToFabInsert, prodToMalFabInsert, prodFabGet }
}

const makeProdFact = () => {
    const prodToFactPost = {
        factory_id: makeFactory().factoryInsert.id,
        stage: 'sew'
    }

    const prodToFactInsert = {
        ...prodToFactPost,
        product_id: makeProduct().productInsert.id,
        approved_by_admin: true,
        created_at: "2023-03-08T00:14:18.263Z",
        updated_at: "2023-03-08T00:14:18.263Z"
    }    

    const prodToMalFactPost = {
        product_id: 1,
        factory_id: 666,
        stage: 'sew'
    }

    const prodFactGet = [
        {
            id: makeFactory().factoryGet[0].id,
            english_name: makeFactory().factoryGet[0].english_name,
            country: makeFactory().factoryGet[0].country,
            website: makeFactory().factoryGet[0].website,
            notes: makeFactory().factoryGet[0].notes,
            stage: prodToFactPost.stage,
            fact_approved_by_admin: makeFactory().factoryGet[0].approved_by_admin,
            pair_approved_by_admin: prodToFactInsert.approved_by_admin,
            pair_created_at: prodToFactInsert.created_at,
            pair_updated_at: prodToFactInsert.updated_at
        }
    ]

    const prodMalFactGet = [
        {
            ...makeMalFactory().malFactInsert,
            english_name: '&lt;a href=\"www.evil.com\"&gt;Evil&lt;/a&gt;',
            notes: '&lt;a href=\"www.evil.com\"&gt;Evil&lt;/a&gt;',
            website: '&lt;a href=\"www.evil.com\"&gt;www.evil.com&lt;/a&gt;',
            stage: prodToMalFactPost.stage
        }
    ]

    return { prodToFactPost, prodToMalFactPost, prodFactGet, prodMalFactGet }
}

const makeProdToCert = () => {
    const prodCertPost = {
        product_id: makeProduct().productInsert.id,
        certification_id: makeCertArray().certArrayInsert[0].id
    }

    const prodCertInsert = {
        ...prodCertPost,
        approved_by_admin: true,
        created_at: "2023-03-08T00:14:18.263Z",
        updated_at: "2023-03-08T00:14:18.263Z"
    }

    const prodCertGet = [
        {
            certification_id: prodCertPost.certification_id,
            english_name: makeCertArray().certArrayGet[0].english_name,
            website: makeCertArray().certArrayGet[0].website,
            cert_approved_by_admin: makeCertArray().certArrayGet[0].approved_by_admin,
            pair_approved_by_admin: prodCertInsert.approved_by_admin,
            pair_created_at: prodCertInsert.created_at,
            pair_updated_at: prodCertInsert.updated_at
        }
    ]

    const prodMalCertInsert = {
        product_id: makeProduct().productInsert.id,
        certification_id: makeMalCert().malCertInsert.id,
        approved_by_admin: true,
        created_at: "2023-03-08T00:14:18.263Z",
        updated_at: "2023-03-08T00:14:18.263Z"
    }

    const prodMalCertGet = [
        {
            certification_id: makeMalCert().malCertInsert.id,
            english_name: makeMalCert().malCertGet.english_name,
            website: makeMalCert().malCertGet.website,
            cert_approved_by_admin: makeMalCert().malCertGet.approved_by_admin,
            pair_approved_by_admin: prodMalCertInsert.approved_by_admin,
            pair_created_at: prodMalCertInsert.created_at,
            pair_updated_at: prodMalCertInsert.updated_at
        }
    ]

    return { prodCertPost, prodCertInsert, prodCertGet, prodMalCertInsert, prodMalCertGet }
}

const makeProdFib = () => {
    const prodFibPost = {
        fiber_or_material_id: makeFiber().fiberInsert.id
    }

    const prodFibInsert = {
        ...prodFibPost,
        product_id: makeProduct().productInsert.id,
        approved_by_admin: true,
        created_at: "2023-03-08T00:14:18.263Z",
        updated_at: "2023-03-08T00:14:18.263Z"
    }

    const prodFibGet = [
        {
            id: prodFibPost.fiber_or_material_id,
            fiber_or_material_type_id: makeFiber().fiberGet[0].fiber_or_material_type_id,
            fiber_type: makeFiber().fiberGet[0].fiber_type,
            class: makeFiber().fiberGet[0].class,
            brand_id: makeFiber().fiberGet[0].brand_id,
            producer_country: makeFiber().fiberGet[0].producer_country,
            producer_id: makeFiber().fiberGet[0].producer_id,
            production_notes: makeFiber().fiberGet[0].production_notes,
            producer: makeFiber().fiberGet[0].producer,
            producer_website: makeFiber().fiberGet[0].producer_website,
            fib_approved_by_admin: makeFiber().fiberGet[0].approved_by_admin,
            pair_approved_by_admin: prodFibInsert.approved_by_admin,
            pair_created_at: prodFibInsert.created_at,
            pair_updated_at: prodFibInsert.updated_at
        }
    ]

    const prodMalFibPost = {
        fiber_or_material_id: makeMalFiber().malFiberInsert.id
    }

    const prodMalFibInsert = {
        ...prodFibInsert,
        ...prodMalFibPost
    }

    const prodMalFibGet = {
        id: prodMalFibPost.fiber_or_material_id,
        fiber_or_material_type_id: makeMalFiber().malFiberGet[0].fiber_or_material_type_id,
        fiber_type: makeMalFiber().malFiberGet[0].fiber_type,
        class: makeMalFiber().malFiberGet[0].class,
        brand_id: makeMalFiber().malFiberGet[0].brand_id,
        producer_country: makeMalFiber().malFiberGet[0].producer_country,
        producer_id: makeMalFiber().malFiberGet[0].producer_id,
        production_notes: makeMalFiber().malFiberGet[0].production_notes,
        producer: makeMalFiber().malFiberGet[0].producer,
        producer_website: makeMalFiber().malFiberGet[0].producer_website,
        fib_approved_by_admin: makeMalFiber().malFiberGet[0].approved_by_admin,
        pair_approved_by_admin: prodMalFibInsert.approved_by_admin,
        pair_created_at: prodMalFibInsert.created_at,
        pair_updated_at: prodMalFibInsert.updated_at
    }

    return { prodFibPost, prodFibInsert, prodFibGet, prodMalFibPost, prodMalFibInsert, prodMalFibGet }
}

const makeProdNot = () => {
    const prodNotPost = {
        notion_id: makeNotion().notionInsert.id
    }

    const prodNotInsert = {
        ...prodNotPost,
        product_id: makeProduct().productInsert.id,
        approved_by_admin: true,
        created_at: "2023-03-08T00:14:18.263Z",
        updated_at: "2023-03-08T00:14:18.263Z"
    }

    const prodNotGet = () => {
        const notion = {
            ...makeNotion().notionGet[0],
            certifications: [
                ...makeCertArray().certArrayGet
            ],
            notion_approved_by_admin: makeNotion().notionGet[0].approved_by_admin,
            pair_approved_by_admin: prodNotInsert.approved_by_admin,
            pair_created_at: prodNotInsert.created_at,
            pair_updated_at: prodNotInsert.updated_at
        }

        delete notion.approved_by_admin
        delete notion.created_at
        delete notion.updated_at

        return [
            notion
        ]
    }

    const prodToMalNot = {
        product_id: makeProduct().productInsert.id,
        notion_id: makeMalNotion().malNotionInsert.id
    }

    const prodMalNotArray = [
        {
            ...makeMalNotion().malNotionGet[0],
            certifications: [
                makeMalCert().malCertGet
            ]
        }
    ]


    return { prodNotPost, prodNotInsert, prodNotGet, prodToMalNot, prodMalNotArray }
}

const makeProdSize = () => {
    const sizeInsert = {
        id: 1,
        country_system: 'International',
        size_text: 'M', 
        size_category: 'alpha', 
        size_class: 'standard', 
        us_size:'M'
    }

    const prodSizePost = {
        size_id: sizeInsert.id
    }

    const prodSizeInsert = {
        ...prodSizePost,
        product_id: makeProduct().productInsert.id,
        approved_by_admin: true,
        created_at: "2023-03-08T00:14:18.263Z",
        updated_at: "2023-03-08T00:14:18.263Z"
    }

    const prodSizeGet = [
        {
            ...sizeInsert,
            pair_approved_by_admin: prodSizeInsert.approved_by_admin,
            pair_created_at: prodSizeInsert.created_at,
            pair_updated_at: prodSizeInsert.updated_at
        }
    ]

    return { sizeInsert, prodSizePost, prodSizeInsert, prodSizeGet }
}

const makeWash = () => (
    { 
      id: 1,
      english_name: "Handwash Cold"
    }
)

const makeProduct = () => {
    const productPost = {
        english_name: 'Silvania Dress',
        brand_id: makeBrand().brandInsert.id,
        category_id: makeCategoryArray().categoriesInsert[0].id,
        product_url: 'https://silvaniaperu.com/silvania-dress',
        feature_image_url: 'https://silvaniaperu.com/silvania-dress',
        multiple_color_options: false,
        cost_in_home_currency: 148.00,
        wash_id: makeWash().id,
        dry_id: makeDry().id,
        cmt_cut_country: 1,
        cmt_sew_country: 1,
        cmt_notes: '100 employees'
    }

    const prodFormPost = {
        ...productPost,
        featured: true,
        color_fieldsets: [ makeColor().colorPost ],
        sew_fact: {
            countryId: 1,
            factoryId: 1
        },
        cut_fact: {
            countryId: 1,
            factoryId: 1
        },
        man_cert_checks: [1],

        selected_sizes: [1],
        fabrics: [
            {
                certs: [1],
                fabric_details: {
                    dyeFinCountryId: 1,
                    dyeFinId: 1,
                    dyeFinNotes: 'Notes',
                    wovKnitCountryId: 1,
                    wovKnitId: 1,
                    wovKnitNotes: 'Notes'
                },
                fiber_array: [
                    {
                        id: 3,
                        fiberTypeId: 1,
                        percentage: 100,
                        originId: 1,
                        producerId: 1,
                        producerNotes: 'Notes',
                        certIds: [1]
                    }
                ],
                relationship: 'primary'
            }
        ],
        notions: [
            {
                typeId: 1,
                countryId: 1,
                factoryId: 1,
                notes: null,
                materialTypeId: 1,
                materialOriginId: 1,
                materialProducerId: 1,
                certIds: [1]
            }
        ],
        approved_by_admin: true
    }

    const productInsert = {
        id: 1,
        ...productPost,
        featured: true,
        approved_by_admin: true,
        created_at: "2020-09-13T07:30:51.564Z",
        updated_at: "2023-03-08T00:14:18.263Z"
    }

    const unfeaturedProdInsert = {
        ...productInsert,
        featured: false
    }

    const prodSubsetUpdate = {
        english_name: 'Updated Product Name'
    }

    const prodFullUpdate = {
        ...productPost,
        ...prodSubsetUpdate,
        brand_id: makeBrand().brandInsert.id,
        category_id: makeCategoryArray().categoriesInsert[0].id,
        product_url: 'https://new-url.com',
        feature_image_url: 'https://new-url.com',
        multiple_color_options: true,
        cost_in_home_currency: 149.00,
        wash_id: makeWash().id,
        dry_id: makeDry().id,
        cmt_cut_country: 1,
        cmt_sew_country: 1,
        cmt_notes: 'Updated Notes',
        featured: true,
        approved_by_admin: false
    }

    const prodOnlyGet = [
        {
            ...productInsert,
            brand_currency: 3,
            brand_name: 'Sezane'
        }
    ]

    const prodExtGet = [
        {
            productObject: prodOnlyGet[0],
            cmtFactArray: [],
            notCertArray: [],
            prodCertArray: [],
            prodColorArray: [],
            prodNotArray: []
        }
    ]

    return { productPost, prodFormPost, productInsert, unfeaturedProdInsert, prodSubsetUpdate, prodFullUpdate, prodOnlyGet, prodExtGet }
}

module.exports = {
    makeColor,
    makeDry,
    makeImage,
    makeMalColor,
    makeMalImage,
    makeMalProduct,
    makeProdFab,
    makeProdFact,
    makeProdToCert,
    makeProdFib,
    makeProdNot,
    makeProdSize,
    makeWash,
    makeProduct
}