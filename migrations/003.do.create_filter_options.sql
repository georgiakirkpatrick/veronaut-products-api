CREATE TABLE filter_options (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    english_name TEXT NOT NULL,
    filter_group_id INTEGER REFERENCES filter_groups(id) NOT NULL
);