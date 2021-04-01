CREATE TABLE fabrics_to_fibers_and_materials (
    fabric_id INTEGER REFERENCES fabrics(id) ON DELETE CASCADE NOT NULL,
    fiber_or_material_id INTEGER REFERENCES fibers_and_materials(id) ON DELETE CASCADE NOT NULL,
    percent_of_fabric INTEGER

);