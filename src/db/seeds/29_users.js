exports.seed = async function(knex) {
    // Deletes ALL existing entries
    await knex('users').del()
    await knex('users').insert([
        {
            email: 'georgia.kirkpatrick@gmail.com',
            password: '$2a$10$HaX4Krt1RZpCFKd7QLdai.xr1cIa5L7aUy4LcBsP39OlWU6jx/npe',
            handle: 'georgiakirkpatrick',
            first_name: 'Georgia',
            last_name: 'Kirkpatrick',
            website: 'georgiakirkpatrick.com',
            profile_pic: 'https://www.talk-business.co.uk/wp-content/uploads/2016/05/shutterstock_128709044.jpg',
            bio: 'Georgia is a computer programmer from Portland, Oregon.',
            admin: true
        }
    ])
}