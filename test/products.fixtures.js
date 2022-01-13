const makeColor = () => (
    {
        id: 1,
        product_id: 1,
        color_description_id: 1,
        color_english_name: 'Lemon',
        swatch_image_url: 'www.lemon-swatch.com',
        approved_by_admin: true,
        date_published: "2020-09-13T07:30:51.564Z"
    }
)

const makeDry = () => (
    { 
      id: 1,
      english_name: "Hang to dry"
    }
)

const makeImage = () => (
    {
        id: 1,
        product_id: 1,
        product_image_url: 'www.brand.com/product/image',
        color_id: 1,
        primary_image_for_color: true,
        approved_by_admin: true,
        date_published: "2020-09-13T07:30:51.564Z"
    }
)

const makeMalImage = () => {
    const malImage = {
        id: 1,
        product_id: 1,
        color_id: 1,
        product_image_url: '<a href="www.brand.com/product/image">Evil</a>',
        primary_image_for_color: true,
        approved_by_admin: true,
        date_published: "2020-09-13T07:30:51.564Z"
    }
    
    const expectedImage = {
        ...malImage,
        product_image_url: '&lt;a href="www.brand.com/product/image"&gt;Evil&lt;/a&gt;',
    }

    return {
        malImage,
        expectedImage
    }    
}

const makeMalProduct = () => {
    const malProduct = {
        id: 666,
        english_name: 'mal product <script>alert("xss");</script>',
        brand_id: 1,
        category_id: 1,
        product_url: '<a href="https://google.com">google</a>',
        feature_image_url: 'https://silvaniaperu.com/silvania-dress',
        multiple_color_options: true,
        cost_in_home_currency: 666,
        wash_id: 1,
        dry_id: 1,
        cmt_sew_country: 1,
        cmt_cut_country: 1,
        cmt_notes: 'This is a bad image for testing purposes <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">.',
        approved_by_admin: true,
        date_published: "2020-09-13T07:30:51.564Z"
    }

    const expectedProduct = {
        id: 666,
        brand_id: 1,
        brand_currency: 3,
        brand_name: 'Sezane',
        category_id: 1,
        feature_image_url: 'https://silvaniaperu.com/silvania-dress',
        featured: false,
        multiple_color_options: true,
        cost_in_home_currency: 666,
        wash_id: 1,
        dry_id: 1,
        cmt_sew_country: 1,
        cmt_cut_country: 1,
        approved_by_admin: true,
        date_published: "2020-09-13T07:30:51.564Z",
        english_name: 'mal product &lt;script&gt;alert("xss");&lt;/script&gt;',
        product_url: '&lt;a href="https://google.com"&gt;google&lt;/a&gt;',
        cmt_notes: 'This is a bad image for testing purposes &lt;img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);"&gt;.',
    }

    return {
        malProduct,
        expectedProduct
    }
}

const makeNotionsToMaterials = () => (
    {
        fiber_or_material_id: 1,
        notion_id: 1
    }    
)

const makeProductArray = () => {
    const productsPost = [
        {
            id: 1,
            english_name: 'Silvania Dress',
            brand_id: 1,
            category_id: 1,
            product_url: 'https://silvaniaperu.com/silvania-dress',
            feature_image_url: 'https://silvaniaperu.com/silvania-dress',
            multiple_color_options: true,
            cost_in_home_currency: 148.00,
            wash_id: 1,
            dry_id: 1,
            cmt_cut_country: 1,
            cmt_sew_country: 1,
            cmt_notes: null,
            approved_by_admin: true,
            date_published: "2020-09-13T07:30:51.564Z"
        },
        {
            id: 2,
            english_name: 'Blouse',
            brand_id: 1,
            category_id: 1,
            product_url: 'https://silvaniaperu.com/silvania-dress',
            feature_image_url: 'https://silvaniaperu.com/silvania-dress',
            multiple_color_options: true,
            cost_in_home_currency: 148.00,
            wash_id: 1,
            dry_id: 1,
            cmt_cut_country: 1,
            cmt_sew_country: 1,
            cmt_notes: null,
            approved_by_admin: true,
            date_published: "2020-09-13T07:30:51.564Z"
        },
        {
            id: 3,
            english_name: 't-shirt',
            brand_id: 1,
            category_id: 1,
            product_url: 'https://silvaniaperu.com/silvania-dress',
            feature_image_url: 'https://silvaniaperu.com/silvania-dress',
            multiple_color_options: true,
            cost_in_home_currency: 148.00,
            wash_id: 1,
            dry_id: 1,
            cmt_cut_country: 1,
            cmt_sew_country: 1,
            cmt_notes: null,
            approved_by_admin: true,
            date_published: "2020-09-13T07:30:51.564Z"
        },
        {
            id: 4,
            english_name: 'Skirt',
            brand_id: 1,
            category_id: 1,
            product_url: 'https://silvaniaperu.com/silvania-dress',
            feature_image_url: 'https://silvaniaperu.com/silvania-dress',
            multiple_color_options: true,
            cost_in_home_currency: 148.00,
            wash_id: 1,
            dry_id: 1,
            cmt_cut_country: 1,
            cmt_sew_country: 1,
            cmt_notes: null,
            approved_by_admin: true,
            date_published: "2020-09-13T07:30:51.564Z"
        }
    ]

    const productsOnlyGet = [
        {
            ...productsPost[0],
            brand_currency: 3,
            brand_name: 'Sezane',
            featured: false
        },
        {
            ...productsPost[1],
            brand_currency: 3,
            brand_name: 'Sezane',
            featured: false
        },
        {
            ...productsPost[2],                                                                                                                                                                                                                                                                                                                                                                                      
            brand_currency: 3,
            brand_name: 'Sezane',
            featured: false
        },
        {
            ...productsPost[3],
            brand_currency: 3,
            brand_name: 'Sezane',
            featured: false
        }
    ]

    const productsExtendedGet = [
        {
            productObject: productsOnlyGet[0],
            cmtFactArray: [],
            notCertArray: [],
            prodCertArray: [],
            prodColorArray: [],
            prodNotArray: []
        },
        {
            productObject: productsOnlyGet[1],
            cmtFactArray: [],
            notCertArray: [],
            prodCertArray: [],
            prodColorArray: [],
            prodNotArray: []
        },
        {
            productObject: productsOnlyGet[2],
            cmtFactArray: [],
            notCertArray: [],
            prodCertArray: [],
            prodColorArray: [],
            prodNotArray: []
        },
        {
            productObject: productsOnlyGet[3],
            cmtFactArray: [],
            notCertArray: [],
            prodCertArray: [],
            prodColorArray: [],
            prodNotArray: []
        }
    ]

    return { productsPost, productsOnlyGet, productsExtendedGet }
}

const makeProductToCertificationArray = () => (
    [
        {
            product_id: 1,
            certification_id: 1
        },
        {
            product_id: 1,
            certification_id: 2
        },
        {
            product_id: 1,
            certification_id: 3
        }
    ]
)

const makeProductToFactoriesArray = () => (
    [
        {
            product_id: 1,
            factory_id: 1,
            stage: 'sew'
        },
        {
            product_id: 1,
            factory_id: 2,
            stage: 'cut'
        }
    ]
)

const makeProductToFiberArray = () => (
    [
        {
            product_id: 1,
            fiber_or_material_id: 1
        },
        {
            product_id: 1,
            fiber_or_material_id: 2
        }
    ]
)

const makeProductToNotions = () => (
    [
        {
            product_id: 1,
            notion_id: 1
        },
        {
            product_id: 1,
            notion_id: 2
        }
    ]    
)

const makeWash = () => (
    { 
      id: 1,
      english_name: "Handwash Cold"
    }
)

const makeSize = () => (
    {
        id: 1,
        country_system: 'US',
        size_text: '6',
        size_category: 'dress',
        size_class: 'standard',
        us_size: '6'
    }
)

const makeSizeToProduct = () => (
    {
        size_id: 1,
        product_id: 1
    }
)

module.exports = {
    makeColor,
    makeDry,
    makeImage,
    makeNotionsToMaterials,
    makeProductArray,
    makeProductToCertificationArray,
    makeProductToFactoriesArray,
    makeProductToFiberArray,
    makeProductToNotions,
    makeSize,
    makeSizeToProduct,
    makeWash,
    makeMalImage,
    makeMalProduct
}