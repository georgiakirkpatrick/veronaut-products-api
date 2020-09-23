CREATE TABLE fibers_to_factories (
    fiber_or_material_id INTEGER REFERENCES fibers_and_materials(id) ON DELETE CASCADE NOT NULL,
    factory_id INTEGER REFERENCES factories(id) ON DELETE CASCADE NOT NULL
);