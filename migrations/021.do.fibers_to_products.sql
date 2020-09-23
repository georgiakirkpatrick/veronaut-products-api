CREATE TABLE fibers_to_products (
    fiber_or_material_id INTEGER REFERENCES fibers_and_materials(id) ON DELETE CASCADE NOT NULL,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE NOT NULL
);