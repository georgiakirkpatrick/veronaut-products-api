CREATE TABLE notions_to_products (
    notion_id INTEGER REFERENCES notions(id) ON DELETE CASCADE NOT NULL,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE NOT NULL
);