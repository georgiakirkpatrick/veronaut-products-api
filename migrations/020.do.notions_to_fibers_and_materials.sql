CREATE TABLE notions_to_fibers_and_materials (
    notion_id INTEGER REFERENCES notions(id) NOT NULL,
    fiber_or_material_id INTEGER REFERENCES fibers_and_materials(id) NOT NULL
); 