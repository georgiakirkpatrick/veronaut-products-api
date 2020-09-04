CREATE TABLE fabrics (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    fabric_type_id INTEGER REFERENCES fabric_types(id),
    fabric_mill_country TEXT,
    fabric_mill_notes TEXT,
    dye_print_finish_country TEXT,
    dye_print_finish_notes TEXT
);