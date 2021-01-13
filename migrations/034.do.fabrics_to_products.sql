CREATE TYPE relationship_option AS ENUM (
    'primary',
    'secondary',
    'lining'                            
);

CREATE TABLE fabrics_to_products (
    fabric_id INTEGER REFERENCES fabrics(id) ON DELETE CASCADE NOT NULL,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    relationship relationship_option NOT NULL DEFAULT 'primary'
);