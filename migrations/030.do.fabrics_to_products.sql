CREATE TABLE fabrics_to_products (
    fabric_id INTEGER REFERENCES fabrics(id) NOT NULL,
    product_id INTEGER REFERENCES products(id) NOT NULL
);