CREATE TABLE notions (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    notion_type_id INTEGER REFERENCES notion_types(id) NOT NULL,
    notion_factory_country TEXT,
    notion_factory_notes TEXT
);