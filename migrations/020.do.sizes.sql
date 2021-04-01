CREATE TYPE country_systems AS ENUM (
    'International',
    'US',
    'UK',
    'France',
    'Italy',
    'Japan'                          
);

CREATE TYPE size_categories AS ENUM (
    'dress',
    'alpha',
    'denim',
    'bra',
    'belt',
    'hat'
);

CREATE TYPE size_classes AS ENUM (
    'standard',
    'petite',
    'tall',
    'maternity'
);

CREATE TYPE us_sizes AS ENUM (
    'XXS',
    'XS',
    'S',
    'M',
    'L',
    'XL',
    '2X',
    '3X',
    '4X',
    '00',
    '0',
    '2',
    '4',
    '6',
    '8',
    '10',
    '12',
    '14',
    '16',
    '18',
    '20',
    '22',
    '24',
    '26',
    '28'                         
);

CREATE TABLE sizes (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    country_system country_systems NOT NULL,
    size_text TEXT NOT NULL,
    size_category size_categories NOT NULL,
    size_class size_classes NOT NULL,
    us_size us_sizes NOT NULL
);