CREATE TABLE fabrics_to_factories (
    fabric_id INTEGER REFERENCES fabrics(id) ON DELETE CASCADE NOT NULL,
    factory_id INTEGER REFERENCES factories(id) ON DELETE CASCADE NOT NULL
);