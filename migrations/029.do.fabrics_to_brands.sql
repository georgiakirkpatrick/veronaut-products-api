CREATE TABLE fabrics_to_brands (
    fabric_id INTEGER REFERENCES fabrics(id) NOT NULL,
    brand_id INTEGER REFERENCES brands(id) NOT NULL
);