CREATE TABLE sizes_to_products (
    size_id INTEGER REFERENCES sizes(id),
    product_id INTEGER REFERENCES products(id)
);