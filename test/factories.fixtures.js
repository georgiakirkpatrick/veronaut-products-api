const makeFactoryArray = () => (
    [
        {
            id: 1,
            english_name: 'The Orange Concept',
            country: 1,
            website: 'www.orange.com',
            notes: 'family-owned',
            approved_by_admin: true,
            date_published: "2020-10-13T21:54:18.074Z"
        },
        {
            id: 2,
            english_name: 'Blue Factory',
            country: 1,
            website: 'www.blue.com',
            notes: 'it is blue',
            approved_by_admin: true,
            date_published: "2020-10-13T21:54:18.074Z"
        }
    ]
)

const makeMalFactory = () => {
    const malFactory = {
        id: 666,
        english_name: '<a href="www.evil.com">Evil</a>',
        country: 1,
        website: '<a href="www.evil.com">www.evil.com</a>',
        notes: '<a href="www.evil.com">Evil</a>',
        approved_by_admin: true,
        date_published: "2020-10-13T21:54:18.074Z"
    }

    const expectedFactory = {
        ...malFactory,
        english_name: '&lt;a href="www.evil.com"&gt;Evil&lt;/a&gt;',
        website: '&lt;a href="www.evil.com"&gt;www.evil.com&lt;/a&gt;',
        notes: '&lt;a href="www.evil.com"&gt;Evil&lt;/a&gt;'
    }

    return {
        malFactory,
        expectedFactory
    }
}

module.exports = {
    makeFactoryArray,
    makeMalFactory
}