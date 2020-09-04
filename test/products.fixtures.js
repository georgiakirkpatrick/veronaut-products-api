function makeProductsArray() {
    return [
        {
            id: 1,
            english_name: 'Silvania Dress',
            brand_id: 56,
            category_id: 4,
            product_url: 'https://silvaniaperu.com/silvania-dress',
            home_currency: 'USD',
            cost_in_home_currency: 148.00,
            cmt_country: 'PE',
            cmt_factory_notes: '',
            approved_by_admin: true
        },
        {
            id: 2,
            english_name: 'Bettina Belt',
            brand_id: 9,
            category_id: 4,
            product_url: 'https://gab.com/bettina-belt',
            home_currency: 'GBP',
            cost_in_home_currency: 29.62,
            cmt_country: 'GB',
            cmt_factory_notes: '',
            approved_by_admin: true
        },
        {
            id: 3,
            english_name: 'Sophia Blouse',
            brand_id: 2,
            category_id: 12,
            product_url: 'https://amourvert.com/sophia-blouse',
            home_currency: 'USD',
            cost_in_home_currency: 50,
            cmt_country: 'US',
            cmt_factory_notes: 'Fair Trade certified',
            approved_by_admin: true
        },
        {
            id: 4,
            english_name: 'Michaela Pants',
            brand_id: 32,
            category_id: 5,
            product_url: 'https://silvaniaperu.com/michaela-pants',
            home_currency: 'PEN',
            cost_in_home_currency: 79,
            cmt_country: 'PE',
            cmt_factory_notes: '100 employees',
            approved_by_admin: true
        },
    ]
}

module.exports = {
    makeProductsArray
}