function makeProductsArray() {
    return [
        {
            id: 1,
            english_name: 'Silvania Dress',
            brand_id: 1,
            brand_name: 'Silvania',
            category_id: 1,
            product_url: 'https://silvaniaperu.com/silvania-dress',
            feature_image_url: 'https://silvaniaperu.com/silvania-dress',
            multiple_color_options: true,
            cost_in_home_currency: 148.00,
            wash_id: 1,
            dry_id: 1,
            cmt_country: 'PE',
            cmt_factory_notes: '',
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
            cmt_country: 'PE',
            cmt_factory_notes: '',
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
            cmt_country: 'PE',
            cmt_factory_notes: '',
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
            cmt_country: 'PE',
            cmt_factory_notes: '',
            approved_by_admin: true,
            date_published: "2020-09-13T07:30:51.564Z"
        }
    ]
}

function makeCategory() {
    return {
      id: 1,
      english_name: 'Activewear', 
      category_class: 'clothing'
    }
}

function makeWash() {
    return { 
      id: 1,
      english_name: "Handwash Cold"
    }
}

function makeDry() {
    return { 
      id: 1,
      english_name: "Hang to dry"
    }
}

function makeImage() {
    return {
        id: 1,
        product_id: 1,
        product_image_url: 'www.brand.com/product/image',
        swatch_image_url: 'www.brand.com/product/swatch',
        color_english_name: 'ocher',
        color_description_id: 1,
        primary_image_for_color: true
    }
}

function makeBrand() {
    return {
        id: 1,
        english_name: 'Sezane',
        website: 'https://silvaniaprints.com',
        home_currency: 'USD',
        size_system: 'US',
        approved_by_admin: true,
        date_published: "2020-09-13T07:30:51.564Z"
    }
}

function makeMaterialTypes() {
    return {
        id: 1,
        english_name: 'polyester',
        fiber_type_class: 'synthetic fiber',
        approved_by_admin: true,
        date_published: "2020-09-13T07:30:51.564Z"
    }
}

function makeMaterials() {
    return {
        id: 1,
        fiber_or_material_type_id: 1,
        brand_id: 1,
        producer_country: 'US',
        producer_id: 1,
        producer_notes: 'Notes',
        approved_by_admin: true,
        date_published: "2020-09-13T07:30:51.564Z"
    }
}

function makeNotionsToMaterials() {
    return {
        fiber_or_material_id: 1,
        notion_id: 1
    }    
}

function makeProductToNotions() {
    return [
        {
            product_id: 1,
            notion_id: 1
        },
        {
            product_id: 1,
            notion_id: 2
        }
    ]    
}

function makeProductToCertificationArray() {
    return [
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
}

function makeProductToFactoriesArray() {
    return [
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
}

function makeProductToFiberArray() {
    return [
        {
            product_id: 1,
            fiber_or_material_id: 1
        },
        {
            product_id: 1,
            fiber_or_material_id: 2
        }
    ]
}

function makeProductsArrayWithBrand() {
    const products = makeProductsArray();
    const brand = makeBrand();
    return products.map((p) => ({
      ...p,
      brand_name: brand.english_name,
    //   brand_id: brand.id,
      home_currency: brand.home_currency
    }))
}

function makeMaliciousImage() {
    const maliciousImage = {
        id: 1,
        product_id: 1,
        product_image_url: '<a href="www.brand.com/product/image">Evil</a>',
        swatch_image_url: '<a href="www.brand.com/product/swatch">Evil</a>',
        color_english_name: '<a href="www.brand.com">Ocher</a>',
        color_description_id: 1,
        primary_image_for_color: true
    }
    
    const expectedImage = {
        ...maliciousImage,
        product_image_url: '&lt;a href="www.brand.com/product/image"&gt;Evil&lt;/a&gt;',
        swatch_image_url: '&lt;a href="www.brand.com/product/swatch"&gt;Evil&lt;/a&gt;',
        color_english_name: '&lt;a href="www.brand.com"&gt;Ocher&lt;/a&gt;',
    }

    return {
        maliciousImage,
        expectedImage
    }    
}

function makeMaliciousProduct() {
    const maliciousProduct = {
        id: 666,
        english_name: 'Malicious product <script>alert("xss");</script>',
        brand_id: 1,
        category_id: 1,
        product_url: '<a href="https://google.com">google</a>',
        feature_image_url: 'https://silvaniaperu.com/silvania-dress',
        multiple_color_options: true,
        cost_in_home_currency: 666,
        wash_id: 1,
        dry_id: 1,
        cmt_country: 'US',
        cmt_factory_notes: 'This is a bad image for testing purposes <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">.',
        approved_by_admin: true,
        date_published: "2020-09-13T07:30:51.564Z"
    }

    const expectedProduct = {
        ...maliciousProduct,
        english_name: 'Malicious product &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
        product_url: '&lt;a href="https://google.com"&gt;google&lt;/a&gt;',
        cmt_factory_notes: 'This is a bad image for testing purposes &lt;img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);"&gt;.',
    }

    return {
        maliciousProduct,
        expectedProduct
    }
}

function makeSize() {
    return {
        id: 1,
        size_type_id: 1,
        size_class_id: 1,
        us_size: '6'
    }
}

function makeMaliciousSize() {
    const maliciousSize = {
        id: 1,
        size_type_id: 1,
        size_class_id: 1,
        us_size: '<a href="www.naughty.com">6</a>'
    }

    const expectedSize = {
        ...maliciousSize,
        us_size: '&lt;a href="www.naughty.com"&gt;6&lt;/a&gt;'
    }

    return {
        maliciousSize,
        expectedSize
    }
}

function makeSizeClass() {
    return {
        id: 1,
        english_name: 'standard'
    }
}

function makeMaliciousSizeClass() {
    const maliciousSizeClass = {
        english_name: '<a href="www.naughty.com">standard</a>'
    }

    const expectedSizeClass = {
        ...maliciousSizeClass,
        english_name: '&lt;a href="www.naughty.com"&gt;standard&lt;/a&gt;'
    }

    return {
        maliciousSizeClass,
        expectedSizeClass
    }
}

function makeSizeType() {
    return {
        id: 1,
        english_name: 'dress size'
    }
}

function makeMaliciousSizeType() {
    const maliciousSizeType = {
        id: 1,
        english_name: '<a href="www.naughty.com">dress size</a>'
    }

    const expectedSizeType = {
        ...maliciousSizeType,
        english_name: '&lt;a href="www.naughty.com"&gt;dress size&lt;/a&gt;'
    }

    return {
        maliciousSizeType,
        expectedSizeType
    }
}

function makeSizeToProduct() {
    return {
        size_id: 1,
        product_id: 1
    }
}

module.exports = {
    makeBrand,
    makeCategory,
    makeDry,
    makeImage,
    makeNotionsToMaterials,
    makeMaterials,
    makeMaterialTypes,
    makeProductsArray,
    makeProductsArrayWithBrand,
    makeProductToCertificationArray,
    makeProductToFactoriesArray,
    makeProductToFiberArray,
    makeProductToNotions,
    makeSize,
    makeSizeClass,
    makeSizeType,
    makeSizeToProduct,
    makeWash,

    makeMaliciousImage,
    makeMaliciousProduct,
    makeMaliciousSize,
    makeMaliciousSizeClass,
    makeMaliciousSizeType
}