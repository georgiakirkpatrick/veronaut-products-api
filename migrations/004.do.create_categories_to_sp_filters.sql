CREATE TABLE categories_to_sp_filters (
    category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE NOT NULL,
    filter_id INTEGER REFERENCES filter_groups(id) ON DELETE CASCADE NOT NULL
);