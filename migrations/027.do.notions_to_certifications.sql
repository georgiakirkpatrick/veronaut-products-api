CREATE TABLE notions_to_certifications (
    notion_id INTEGER REFERENCES notions(id) NOT NULL,
    certification_id INTEGER REFERENCES certifications(id) NOT NULL
);