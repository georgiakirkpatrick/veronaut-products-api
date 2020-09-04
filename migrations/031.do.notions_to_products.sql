CREATE TABLE notions_to_products (
    notion_id INTEGER REFERENCES notions(id) NOT NULL,
    product_id INTEGER REFERENCES products(id) NOT NULL
);