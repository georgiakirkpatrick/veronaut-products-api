CREATE TABLE fabrics_to_certifications (
    fabric_id INTEGER REFERENCES fabrics(id) ON DELETE CASCADE NOT NULL,
    certification_id INTEGER REFERENCES certifications(id) ON DELETE CASCADE NOT NULL
);