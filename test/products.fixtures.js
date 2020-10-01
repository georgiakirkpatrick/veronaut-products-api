function makeProductsArray() {
    return [
        {
            id: 1,
            english_name: 'Silvania Dress',
            brand_id: 1,
            category_id: 4,
            product_url: 'https://silvaniaperu.com/silvania-dress',
            feature_image_url: 'https://silvaniaperu.com/silvania-dress',
            multiple_color_options: true,
            home_currency: 'USD',
            cost_in_home_currency: '$148.00',
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
            category_id: 4,
            product_url: 'https://silvaniaperu.com/silvania-dress',
            feature_image_url: 'https://silvaniaperu.com/silvania-dress',
            multiple_color_options: true,
            home_currency: 'USD',
            cost_in_home_currency: '$148.00',
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
            category_id: 14,
            product_url: 'https://silvaniaperu.com/silvania-dress',
            feature_image_url: 'https://silvaniaperu.com/silvania-dress',
            multiple_color_options: true,
            home_currency: 'USD',
            cost_in_home_currency: '$148.00',
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
            category_id: 4,
            product_url: 'https://silvaniaperu.com/silvania-dress',
            feature_image_url: 'https://silvaniaperu.com/silvania-dress',
            multiple_color_options: true,
            home_currency: 'USD',
            cost_in_home_currency: '$148.00',
            wash_id: 1,
            dry_id: 1,
            cmt_country: 'PE',
            cmt_factory_notes: '',
            approved_by_admin: true,
            date_published: "2020-09-13T07:30:51.564Z"
        }
    ]
}

function makeBrandsArray() {
    return {
        id: 1,
        english_name: 'Sezane',
        website: 'https://silvaniaprints.com',
        approved_by_admin: true,
        date_published: "2020-09-13T07:30:51.564Z"
    }
}

function makeProductsArrayWithBrand() {
    return [
        {
            id: 1,
            english_name: 'Silvania Dress',
            brand_id: 1,
            brand_name: 'Sezane',
            category_id: 4,
            product_url: 'https://silvaniaperu.com/silvania-dress',
            feature_image_url: 'https://silvaniaperu.com/silvania-dress',
            multiple_color_options: true,
            home_currency: 'USD',
            cost_in_home_currency: '$148.00',
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
            brand_name: 'Sezane',
            category_id: 4,
            product_url: 'https://silvaniaperu.com/silvania-dress',
            feature_image_url: 'https://silvaniaperu.com/silvania-dress',
            multiple_color_options: true,
            home_currency: 'USD',
            cost_in_home_currency: '$148.00',
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
            brand_name: 'Sezane',
            category_id: 14,
            product_url: 'https://silvaniaperu.com/silvania-dress',
            feature_image_url: 'https://silvaniaperu.com/silvania-dress',
            multiple_color_options: true,
            home_currency: 'USD',
            cost_in_home_currency: '$148.00',
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
            brand_name: 'Sezane',
            category_id: 4,
            product_url: 'https://silvaniaperu.com/silvania-dress',
            feature_image_url: 'https://silvaniaperu.com/silvania-dress',
            multiple_color_options: true,
            home_currency: 'USD',
            cost_in_home_currency: '$148.00',
            wash_id: 1,
            dry_id: 1,
            cmt_country: 'PE',
            cmt_factory_notes: '',
            approved_by_admin: true,
            date_published: "2020-09-13T07:30:51.564Z"
        }
    ]
}

function makeMaliciousProduct() {
    const maliciousProduct = {
        id: 666,
        english_name: 'Malicious product <script>alert("xss");</script>',
        brand_id: 1,
        category_id: 10,
        product_url: '<a href="https://google.com">google</a>',
        feature_image_url: 'https://silvaniaperu.com/silvania-dress',
        multiple_color_options: true,
        home_currency: 'USD',
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
        cmt_factory_notes: 'This is a bad image for testing purposes &lt;img src="https://url.to.file.which/does-not.exist"&gt;.',
    }

    return {
        maliciousProduct,
        expectedProduct
    }

}

module.exports = {
    makeProductsArray, 
    makeBrandsArray,
    makeProductsArrayWithBrand,
    makeMaliciousProduct
}