CREATE TABLE product_cmts_to_certifications (
    product_id INTEGER REFERENCES products(id) NOT NULL,
    certification_id INTEGER REFERENCES certifications(id) NOT NULL
);