function makeCategoriesArray() {
    return [
        {
            english_name: 'Activewear',
            category_class: 'clothing',
            id: 1
        },
        {
            english_name: 'Blazers',
            category_class: 'clothing',
            id: 2
        },
        {
            english_name: 'Coats and Jackets',
            category_class: 'clothing',
            id: 3
        },
        {
            english_name: 'Facemasks',
            category_class: 'accessories',
            id: 4
        }
    ]
}

function makeProductsArray() {
    const products = [
        {
            id: 1,
            english_name: 'Dress',
            brand_id: 1,
            category_id: 1,
            product_url: 'www.hi.com',
            feature_image_url: 'www.bye.com',
            multiple_color_options: true,
            cost_in_home_currency: 44,
            wash_id: 1,
            dry_id: 1,
            cmt_country: 'US',
            cmt_factory_notes: 'These are notes',
            approved_by_admin: true,
            date_published: '2020-09-13T07:30:51.564Z'
        },
        {
            id: 2,
            english_name: 'Shirt',
            brand_id: 1,
            category_id: 1,
            product_url: 'www.hi.com',
            feature_image_url: 'www.bye.com',
            multiple_color_options: true,
            cost_in_home_currency: 44,
            wash_id: 1,
            dry_id: 1,
            cmt_country: 'US',
            cmt_factory_notes: 'These are notes',
            approved_by_admin: true,
            date_published: '2020-09-13T07:30:51.564Z'
        }
    ]

    const productsWithBrands = [
        {
            ...products[0],
            brand_name: 'Sezane'
        },
        {
            ...products[1],
            brand_name: 'Sezane'
        }
    ]

    return {products, productsWithBrands}
}



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

module.exports = {
    makeCategoriesArray,
    makeBrandsArray,
    makeWash,
    makeDry,
    makeProductsArray,
    makeMaliciousProduct
}