CREATE TABLE fabrics_to_products (
    fabric_id INTEGER REFERENCES fabrics(id) ON DELETE CASCADE NOT NULL,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE NOT NULL
);