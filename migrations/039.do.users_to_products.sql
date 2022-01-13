CREATE TABLE users_to_products (
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    relationship_id INTEGER NOT NULL
);