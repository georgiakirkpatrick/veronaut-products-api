CREATE TABLE fabrics_to_factories (
    fabric_id INTEGER REFERENCES fabrics(id) NOT NULL,
    factory_id INTEGER REFERENCES factories(id) NOT NULL
);