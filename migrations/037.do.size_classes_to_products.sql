CREATE TABLE size_classes_to_products (
    size_class_id INTEGER REFERENCES size_classes(id) ON DELETE CASCADE NOT NULL,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE NOT NULL
);