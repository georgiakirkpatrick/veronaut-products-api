const bcrypt = require('bcryptjs')

const makeAdminArray = () => (
    [
        {
            id: 3,
            email: 'admin-georgia@veronaut.com',
            password: 'L6i5n5n3L7a0n8e',
            handle: 'veronaut-georgia',
            first_name: 'Veronaut',
            last_name: 'Veronaut',
            website: 'veronaut.com',
            profile_pic: 'https://www.talk-business.co.uk/wp-content/uploads/2016/05/shutterstock_128709044.jpg',
            bio: 'Georgia is a computer programmer from Portland, Oregon.',
            public: false,
            admin: true,
            editor: true,
            can_submit: true,
            org_affiliation: null,
            account_created: "2020-09-13T07:30:51.564Z"
        },
        {
            id: 4,
            email: 'admin-charlotte@veronaut.com',
            password: 'G9l3i7s1a1n',
            handle: 'veronaut-charlotte',
            first_name: 'Veronaut',
            last_name: 'Veronaut',
            website: 'veronaut.com',
            profile_pic: 'https://www.talk-business.co.uk/wp-content/uploads/2016/05/shutterstock_128709044.jpg',
            bio: 'Charlotte is a computer programmer from Portland, Oregon.',
            public: false,
            admin: true,
            editor: true,
            can_submit: true,
            org_affiliation: null,
            account_created: "2020-09-13T07:30:51.564Z"
        }
    ]
)

const hashedAdminArray = () => {
    const adminArray = makeAdminArray()
    const georgia = adminArray.find(user => user.id === 3)
    const charlotte = adminArray.find(user => user.id === 4)

    return [
            {
                ...georgia,
                password: bcrypt.hashSync(georgia.password, 1),
            },
            {
                ...charlotte,
                password: bcrypt.hashSync(charlotte.password, 1),
            }
        ]
}

const makeUserArray = () => (
    [
        {
            id: 1,
            email: 'georgia.kirkpatrick@gmail.com',
            password: 'testpassword',
            handle: 'Georgiakirkpatrick',
            first_name: 'Georgia',
            last_name: 'Kirkpatrick',
            website: 'georgiakirkpatrick.com',
            profile_pic: 'https://www.talk-business.co.uk/wp-content/uploads/2016/05/shutterstock_128709044.jpg',
            bio: 'Georgia is a computer programmer from Portland, Oregon.',
            public: false,
            admin: false,
            editor: false,
            can_submit: true,
            org_affiliation: 'None',
            account_created: "2020-09-13T07:30:51.564Z"
        },
        {
            id: 2,
            admin: false,
            email: 'jonathan.pak@gmail.com',
            password: 'testpassword',
            handle: 'jonnypak',
            first_name: 'Jon',
            last_name: 'Pak',
            website: 'jonathanpak.com',
            profile_pic: 'https://www.talk-business.co.uk/wp-content/uploads/2016/05/shutterstock_128709044.jpg',
            bio: 'Jonathan is a computer programmer from Portland, Oregon.',
            public: false,
            editor: false,
            can_submit: true,
            org_affiliation: 'None',
            account_created: "2020-09-13T07:30:51.564Z"
        }
    ]
)

const hashedUserArray = () => {
    const userArray = makeUserArray()
    const georgia = userArray.find(user => user.id === 1)
    const jonathan = userArray.find(user => user.id === 2)

    return [
        {
            ...georgia,
            password: bcrypt.hashSync(georgia.password, 10),
        },
        {
            ...jonathan,
            password: bcrypt.hashSync(jonathan.password, 10),
        }
    ]
}

const makeMalUser = () => {
    const malUser = {
        id: 666,
        admin: false,
        email: '<a href="mailto:badEmail@bad.bad">bad</a>',
        password: '<a href="bad.com">badpassword</a>',
        handle: '<a href="bad.com">badhandle</a>',
        first_name: '<a href="bad.com">Bad First Name</a>',
        last_name: '<a href="bad.com">Bad Last Name</a>',
        website: '<a href="bad.com">badwebsite.com</a>',
        profile_pic: '<a href="bad.com">bad.jpg</a>',
        bio: '<a href="bad.com">Bad bio.</a>',
        public: false,
        editor: false,
        can_submit: true,
        org_affiliation: '<a href="bad.com">Bad Organization</a>',
        account_created: "2020-09-13T07:30:51.564Z"
    }

    const hashedMal = {
        ...malUser,
        password: bcrypt.hashSync('<a href="bad.com">badpassword</a>')
    }

    const expectedUser = {
        id: 666,
        admin: false,
        email: '&lt;a href="mailto:badEmail@bad.bad"&gt;bad&lt;/a&gt;',
        password: '&lt;a href="bad.com"&gt;badpassword&lt;/a&gt;',
        handle: '&lt;a href="bad.com"&gt;badhandle&lt;/a&gt;',
        first_name: '&lt;a href="bad.com"&gt;Bad First Name&lt;/a&gt;',
        last_name: '&lt;a href="bad.com"&gt;Bad Last Name&lt;/a&gt;',
        website: '&lt;a href="bad.com"&gt;badwebsite.com&lt;/a&gt;',
        profile_pic: '&lt;a href="bad.com"&gt;bad.jpg&lt;/a&gt;',
        bio: '&lt;a href="bad.com"&gt;Bad bio.&lt;/a&gt;',
        public: false,
        editor: false,
        can_submit: true,
        org_affiliation: '&lt;a href="bad.com"&gt;Bad Organization&lt;/a&gt;',
        account_created: '2020-09-13T07:30:51.564Z'
    }

    return { malUser, expectedUser, hashedMal }
}

module.exports = { hashedAdminArray, hashedUserArray, makeAdminArray, makeUserArray, makeMalUser }