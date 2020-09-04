CREATE TABLE product_cmts_to_factories (
    product_id INTEGER REFERENCES products(id) NOT NULL,
    factory_id INTEGER REFERENCES factories(id) NOT NULL
);