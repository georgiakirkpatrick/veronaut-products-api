const makeMalNotion = () => {
    const malNotion = {
        id: 666,
        notion_type_id: 666,
        brand_id: 666,
        manufacturer_country: 1,
        manufacturer_id: 666,
        manufacturer_notes: 'These are the <a href="www.notes.com">notes</a>',
        material_type_id: 666,
        material_origin_id: 1,
        material_producer_id: 666,
        material_notes: 'These are the <a href="www.notes.com">notes</a>',
        approved_by_admin: true,
        date_published: '2020-09-13T07:30:51.564Z'
    }
    
    const expectedNotion = {
        ...malNotion,
        notion_type: '&lt;a&gt;button&lt;/a&gt;',
        manufacturer_notes: 'These are the &lt;a href="www.notes.com"&gt;notes&lt;/a&gt;',
        material_notes: 'These are the &lt;a href="www.notes.com"&gt;notes&lt;/a&gt;'
    }

    return {
        malNotion,
        expectedNotion
    }
}

const makeMalNotionType = () => {
    const malNotionType = {
        id: 666,
        english_name: '<a>button</a>',
        approved_by_admin: true,
        date_published: '2020-10-01T23:47:20.381Z'
    }

    const expectedNotionType = {
        ...malNotionType,
        english_name: '&lt;a&gt;button&lt;/a&gt;'
    }

    return {
        malNotionType,
        expectedNotionType
    }
}

const makeNotionArray = () => {
    const notionsPost = {
        id: 1,
        notion_type_id: 1,
        brand_id: 1,
        manufacturer_country: 1,
        manufacturer_id: 1,
        manufacturer_notes: 'These are the notes',
        material_type_id: 1,
        material_origin_id: 1,
        material_producer_id: 1,
        material_notes: null,
        approved_by_admin: true,
        date_published: '2020-10-01T23:47:20.387Z'
    }

    const notionsCertsGet = {
        ...notionsPost,
        notion_type: 'button',
        certification_ids: [
            {
                approved_by_admin: true,
                date_published: '2020-09-13T07:30:51.564Z',
                english_name: 'Organic',
                id: 1,
                website: 'www.organic.com'
            }
        ]
      
    }

    const notionsGet = {
        ...notionsPost,
        notion_type: 'button'
    }

    return { notionsPost, notionsCertsGet, notionsGet }
}

const makeNotionType = () => (
    [
        {
            id: 1,
            english_name: 'button',
            approved_by_admin: true,
            date_published: '2020-10-01T23:47:20.381Z'
        }
    ]
)   

const makeNotsToCerts = () => ([
    {
        certification_id: 1,
        notion_id: 1
    },
    {
        certification_id: 2,
        notion_id: 1
    },
    {
        certification_id: 3,
        notion_id: 1
    }
])

module.exports = {
    makeMalNotionType,
    makeMalNotion,
    makeNotionArray,
    makeNotionType,
    makeNotsToCerts
}