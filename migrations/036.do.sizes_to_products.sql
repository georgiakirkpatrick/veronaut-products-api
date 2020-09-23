CREATE TABLE sizes_to_products (
    size_id INTEGER REFERENCES sizes(id) ON DELETE CASCADE NOT NULL,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE NOT NULL
);