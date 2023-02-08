CREATE TABLE users (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    email TEXT NOT NULL,
    password TEXT NOT NULL,
    handle TEXT,
    first_name TEXT,
    last_name TEXT,
    website TEXT,
    profile_pic TEXT,
    bio TEXT,
    public BOOLEAN DEFAULT false,
    admin BOOLEAN DEFAULT false,
    editor BOOLEAN DEFAULT false,
    can_submit BOOLEAN DEFAULT false,
    org_affiliation TEXT,
    account_created TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- test password is 'testpassword', hashed with a salt of 10

insert into users 
(email, password, handle, first_name, last_name, website, profile_pic, bio, admin)
values
    (
        'georgia.kirkpatrick@gmail.com', 
        '$2a$10$HaX4Krt1RZpCFKd7QLdai.xr1cIa5L7aUy4LcBsP39OlWU6jx/npe', 
        'georgiakirkpatrick', 
        'Georgia',
        'Kirkpatrick', 
        'georgiakirkpatrick.com', 
        'https://www.talk-business.co.uk/wp-content/uploads/2016/05/shutterstock_128709044.jpg', 
        'Georgia is a computer programmer from Portland, Oregon.',
        true
    );
