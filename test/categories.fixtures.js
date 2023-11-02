const makeCategoryArray = () => {
    const categoryPost = {
        english_name: 'Activewear',
        category_class: 'clothing',
        feature_image: '' 
    }

    const categoriesInsert = [
        {
            id: 1,
            ...categoryPost
        },
        {
            id: 2,
            english_name: 'Blazers',
            category_class: 'clothing',
            feature_image: ''
        },
        {
            id: 3,
            english_name: 'Coats and Jackets',
            category_class: 'clothing',
            feature_image: ''
        },
        {
            id: 4,
            english_name: 'Facemasks',
            category_class: 'accessories',
            feature_image: ''
        }
    ]

    const categoriesGet = [
        ...categoriesInsert
    ]

    return {
        categoryPost,
        categoriesInsert,
        categoriesGet
    }
}

const makeMalCategory = () => {
    const malCategory = {
        id: 1,
        english_name: '<a href="bad">Activewear</a>',
        category_class: 'clothing',
        feature_image: '<a href="bad">www.image.com</a>'
    }

    const expectedCategory = {
        id: 1,
        english_name: '&lt;a href="bad"&gt;Activewear&lt;/a&gt;',
        category_class: 'clothing',
        feature_image: '&lt;a href="bad"&gt;www.image.com&lt;/a&gt;'
    }

    const malCatPost = {
        english_name: '<a href="bad">Activewear</a>',
        category_class: 'clothing',
        feature_image: '<a href="bad">www.image.com</a>'
    }

    const malCatInsert = {
        id: 1,
        ...malCatPost
    }

    const malCatGet = [
        {
            ...malCatInsert,
            english_name: '&lt;a href="bad"&gt;Activewear&lt;/a&gt;',
            feature_image: '&lt;a href="bad"&gt;www.image.com&lt;/a&gt;'
        }
    ]

    return {
        malCategory,
        expectedCategory,
        malCatPost,
        malCatInsert,
        malCatGet
    }
}

module.exports = {
    makeCategoryArray,
    makeMalCategory
}