CREATE TYPE production_stages AS enum (
    'cut',
    'sew',
    'trim'
);

CREATE TABLE product_cmts_to_factories (
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    factory_id INTEGER REFERENCES factories(id) ON DELETE CASCADE NOT NULL,
    stage production_stages NOT NULL
);