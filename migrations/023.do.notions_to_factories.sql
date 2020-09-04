CREATE TABLE notions_to_factories (
    notion_id INTEGER REFERENCES notions(id) NOT NULL,
    factory_id INTEGER REFERENCES factories(id) NOT NULL
);