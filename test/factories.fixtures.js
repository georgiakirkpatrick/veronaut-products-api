const makeFactory = () => {
    const factoryPost = {
        english_name: 'Pink Factory',
        country: 1,
        website: 'www.pink.com',
        notes: 'Pink factory'
    }

    const factoryInsert = {
        id: 1,
        ...factoryPost,
        approved_by_admin: true,
        created_at: "2020-10-13T21:54:18.074Z",
        updated_at: "2020-10-13T21:54:18.074Z"
    }

    const factoryGet = [
        {
            ...factoryInsert
        }
    ]

    const factFullUpdate = {
        english_name: 'Updated Factory',
        country: 2,
        website: 'www.update.com',
        notes: 'updated notes',
        approved_by_admin: true,
        updated_at: "2020-10-13T21:54:18.074Z"
    }

    return { factoryPost, factoryInsert, factoryGet, factFullUpdate }
}

const makeMalFactory = () => {
    const malFactPost = {
        english_name: '<a href="www.evil.com">Evil</a>',
        country: 1,
        website: '<a href="www.evil.com">www.evil.com</a>',
        notes: '<a href="www.evil.com">Evil</a>'
    }

    const malFactInsert = {
        id: 666,
        ...malFactPost,
        approved_by_admin: true,
        created_at: "2020-10-13T21:54:18.074Z",
        updated_at: "2020-10-13T21:54:18.074Z"
    }

    const malFactGet = [
        {
            ...malFactInsert,
            english_name: '&lt;a href="www.evil.com"&gt;Evil&lt;/a&gt;',
            website: '&lt;a href="www.evil.com"&gt;www.evil.com&lt;/a&gt;',
            notes: '&lt;a href="www.evil.com"&gt;Evil&lt;/a&gt;',
            approved_by_admin: true
        }
    ]

    return { malFactPost, malFactInsert, malFactGet }
}

module.exports = {
    makeFactory,
    makeMalFactory
}