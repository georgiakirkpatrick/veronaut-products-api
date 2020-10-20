function makeCertificationsArray() {
    return [
        {
            id: 1,
            english_name: 'Organic',
            website: 'www.organic.com',
            approved_by_admin: true,
            date_published: '2020-09-13T07:30:51.564Z'
        },
        {
            id: 2,
            english_name: 'Fair Trade',
            website: 'www.fairtrade.com',
            approved_by_admin: true,
            date_published: '2020-09-13T07:30:51.564Z'
        },
        {
            id: 3,
            english_name: 'Green',
            website: 'www.green.com',
            approved_by_admin: true,
            date_published: '2020-09-13T07:30:51.564Z'
        }
    ]
}

function makeMaliciousCertification() {
    const maliciousCertification = {
        id: 666,
        english_name: '<a href="www.bad.com">Organic</a>',
        website: '<a href="www.bad.com">www.organic.com</a>',
        approved_by_admin: true,
        date_published: '2020-09-13T07:30:51.564Z'
    }

    const expectedCertification = {
        ...maliciousCertification,
        english_name: '&lt;a href="www.bad.com"&gt;Organic&lt;/a&gt;',
        website: '&lt;a href="www.bad.com"&gt;www.organic.com&lt;/a&gt;'
    }

    return {
        maliciousCertification,
        expectedCertification
    }
}

module.exports = { 
    makeCertificationsArray, 
    makeMaliciousCertification 
}