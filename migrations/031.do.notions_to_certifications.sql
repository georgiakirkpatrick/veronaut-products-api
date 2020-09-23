CREATE TABLE notions_to_certifications (
    notion_id INTEGER REFERENCES notions(id) ON DELETE CASCADE NOT NULL,
    certification_id INTEGER REFERENCES certifications(id) ON DELETE CASCADE NOT NULL
);