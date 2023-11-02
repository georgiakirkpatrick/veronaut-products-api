const makeBrand = () => {
    const brandPost = {
        english_name: 'Sezane',
        website: 'www.sezane.com',
        home_currency: 3,
        size_system: 2
    }

    const brandInsert = {
        id: 1,
        ...brandPost,
        approved_by_admin: true,
        created_at: '2020-09-13T07:30:51.564Z',
        updated_at: '2023-03-03T00:25:56.981Z'
    }

    const brandGet = [
        brandInsert
    ]

    const brandFullUpdate = {
        id: 2,
        english_name: 'Updated brand',
        website: 'www.update.com',
        home_currency: 4,
        size_system: 3,
        approved_by_admin: true,
        created_at: '2020-09-13T07:30:51.564Z',
        updated_at: '2023-03-03T00:25:56.981Z'
    }

    return { brandPost, brandInsert, brandGet, brandFullUpdate }
}

const makeMalBrand = () => {
    const malBrandPost = {
        english_name: '<a src="www.sezane.com">Sezane</a>',
        website: '<a src="www.sezane.com">www.sezane.com</a>',
        home_currency: 1,
        size_system: 1
    }

    const malBrandInsert = {
        id: 666,
        ...malBrandPost,
        approved_by_admin: true,
        created_at: '2020-09-13T07:30:51.564Z',
        updated_at: '2020-09-13T07:30:51.564Z'
    }

    const malBrandGet = [
        {
            ...malBrandInsert,
            english_name: '&lt;a src="www.sezane.com"&gt;Sezane&lt;/a&gt;',
            website: '&lt;a src="www.sezane.com"&gt;www.sezane.com&lt;/a&gt;',
        }
    ]

    return {
        malBrandPost,
        malBrandInsert,
        malBrandGet
    }
}

module.exports = {
    makeBrand,
    makeMalBrand,
}