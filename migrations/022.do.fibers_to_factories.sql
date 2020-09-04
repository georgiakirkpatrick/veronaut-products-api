CREATE TABLE fibers_to_factories (
    fiber_id INTEGER REFERENCES fibers_and_materials(id) NOT NULL,
    factory_id INTEGER REFERENCES factories(id) NOT NULL
);