function makeCertArray() {
    const certArrayPost = [
        {
            english_name: 'Organic',
            website: 'www.organic.com'
        },
        {
            english_name: 'Fair Trade',
            website: 'www.fairtrade.com'
        },
        {
            english_name: 'Green',
            website: 'www.green.com'
        }
    ]

    const certPost = certArrayPost[0]
    
    const certArrayGet = [
        {
            id: 1,
            english_name: 'Organic',
            website: 'www.organic.com',
            approved_by_admin: true,
            created_at: '2020-09-13T07:30:51.564Z',
            updated_at: '2023-03-07T23:04:54.568Z'
        },
        {
            id: 2,
            english_name: 'Fair Trade',
            website: 'www.fairtrade.com',
            approved_by_admin: true,
            created_at: '2020-09-13T07:30:51.564Z',
            updated_at: '2023-03-07T23:04:54.568Z'
        },
        {
            id: 3,
            english_name: 'Green',
            website: 'www.green.com',
            approved_by_admin: true,
            created_at: '2020-09-13T07:30:51.564Z',
            updated_at: '2023-03-07T23:04:54.568Z'
        }
    ]

    const certArrayInsert = [
        ...certArrayGet
    ]

    return { certArrayPost, certPost, certArrayGet, certArrayInsert}
}

function makeMalCert() {
    // const malCertification = {
    //     id: 666,
    //     english_name: '<a href="www.bad.com">Organic</a>',
    //     website: '<a href="www.bad.com">www.organic.com</a>',
    //     approved_by_admin: true,
    //     created_at: '2020-09-13T07:30:51.564Z',
    //     updated_at: '2023-03-07T23:04:54.568Z'
    // }

    // const malCertGet = {
    //     ...malCertification,
    //     english_name: '&lt;a href="www.bad.com"&gt;Organic&lt;/a&gt;',
    //     website: '&lt;a href="www.bad.com"&gt;www.organic.com&lt;/a&gt;'
    // }

    const malCertPost = {
        english_name: '<a href="www.bad.com">Organic</a>',
        website: '<a href="www.bad.com">www.organic.com</a>'
    }

    const malCertInsert = {
        id: 666,
        ...malCertPost,
        approved_by_admin: true,
        created_at: '2020-09-13T07:30:51.564Z',
        updated_at: '2023-03-07T23:04:54.568Z'
    }

    const malCertGet = {
        ...malCertInsert,
        english_name: '&lt;a href="www.bad.com"&gt;Organic&lt;/a&gt;',
        website: '&lt;a href="www.bad.com"&gt;www.organic.com&lt;/a&gt;'
    }

    return { malCertPost, malCertGet, malCertInsert }
}

module.exports = { 
    makeCertArray, 
    makeMalCert: makeMalCert 
}