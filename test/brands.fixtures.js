const makeBrandArray = () => (
    [
        {
            id: 1,
            english_name: 'Sezane',
            website: 'www.sezane.com',
            home_currency: 3,
            size_system: 2,
            approved_by_admin: true,
            date_published: '2020-09-13T07:30:51.564Z'
        },
        {
            id: 2,
            english_name: 'Amour Vert',
            website: 'www.amourvert.com',
            home_currency: 1,
            size_system: 1,
            approved_by_admin: true,
            date_published: '2020-09-13T07:30:51.564Z'
        },
        {
            id: 3,
            english_name: 'Stella McCartney',
            website: 'www.stellamccartney.com',
            home_currency: 38,
            size_system: 3,
            approved_by_admin: true,
            date_published: '2020-09-13T07:30:51.564Z'
        }
    ]
)

const makeMalBrand = () => {
    const malBrand = {
        id: 666,
        english_name: '<a src="www.sezane.com">Sezane</a>',
        website: '<a src="www.sezane.com">www.sezane.com</a>',
        home_currency: 1,
        size_system: 1,
        approved_by_admin: true,
        date_published: '2020-09-13T07:30:51.564Z'
    }

    const expectedBrand = {
        ...malBrand,
        english_name: '&lt;a src="www.sezane.com"&gt;Sezane&lt;/a&gt;',
        website: '&lt;a src="www.sezane.com"&gt;www.sezane.com&lt;/a&gt;',
    }

    return {
        malBrand,
        expectedBrand
    }
}

const seedBrandTable = (db, brands) => (
    db.transaction(async trx => {
        await trx.into('brands').insert(brands)
        await Promise.all([
            trx.raw(
                `SELECT setval('brands_id_seq', ?)`,
                [brands[brands.length - 1].id],
            )
        ])
    })
)

module.exports = {
    makeBrandArray,
    makeMalBrand,
    seedBrandTable
}