CREATE TYPE fiber_or_material_class AS ENUM (
    'protein fiber',
    'naturally occuring cellulosic fiber',
    'manufactured cellulosic fiber',
    'synthetic fiber',
    'undetermined'
);

CREATE TABLE fiber_and_material_types (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    english_name TEXT NOT NULL,
    fiber_type_class fiber_or_material_class DEFAULT 'undetermined',
    date_published TIMESTAMPTZ DEFAULT now() NOT NULL,
    approved_by_admin BOOLEAN DEFAULT false
);