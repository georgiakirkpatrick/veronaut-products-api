CREATE TABLE fibers_to_certifications (
    fiber_or_material_id INTEGER REFERENCES fibers_and_materials(id) ON DELETE CASCADE NOT NULL,
    certification_id INTEGER REFERENCES certifications(id) ON DELETE CASCADE NOT NULL
);