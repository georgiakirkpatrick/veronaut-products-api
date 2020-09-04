CREATE TABLE fabrics_to_certifications (
    fabric_id INTEGER REFERENCES fabrics(id) NOT NULL,
    certification_id INTEGER REFERENCES certifications(id) NOT NULL
);