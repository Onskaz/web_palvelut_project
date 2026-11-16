CREATE TABLE animals (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    age INTEGER NOT NULL,
    breed VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT,
    status VARCHAR(20) DEFAULT 'available'
);

CREATE TABLE adoptions (
    id SERIAL PRIMARY KEY,
    animal_id INTEGER REFERENCES animals(id) ON DELETE CASCADE,
    applicant_name VARCHAR(100) NOT NULL,
    applicant_email VARCHAR(100) NOT NULL,
    applicant_phone VARCHAR(50) NOT NULL,
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO animals (name, type, age, breed, description, image_url) 
VALUES
('Jorgos', 'Kissa', 3, 'Maatiaiskissa', 'Leikkisä ja sisäsiisti kolmikkovärinen kissa.', 'https://placekitten.com/300/200'),
('Manu', 'Koira', 5, 'Kultainennoutaja', 'Rauhallinen perhekoira, joka tykkää ihmistä ja lenkeistä.', 'https://placedog.net/300/200?id=1'),
('Sasu', 'Kissa', 1, 'Maatiaiskissa', 'Energinen nuori kissa, vaatii paljon aktiviteetteja.', 'https://placekitten.com/300/201');
