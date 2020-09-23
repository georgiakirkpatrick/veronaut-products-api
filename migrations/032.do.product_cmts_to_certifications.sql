CREATE TABLE product_cmts_to_certifications (
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    certification_id INTEGER REFERENCES certifications(id) ON DELETE CASCADE NOT NULL
);