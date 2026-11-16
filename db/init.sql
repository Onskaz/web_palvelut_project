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

INSERT INTO animals (name, type, age, breed, description, image_url, status) VALUES
('Jorgos', 'Kissa', 3, 'Maatiaiskissa', 'Rauhallinen ja sylissä viihtyvä kissa, joka etsii loppuelämän kotia. Tulee toimeen muiden kissojen kanssa.', 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600', 'available'),
('Rauno', 'Koira', 2, 'Saksanpaimenkoira', 'Energinen ja leikkisä nuori koira. Vaatii aktiivisen perheen ja paljon ulkoilua.', 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600', 'available'),
('Mauno', 'Kissa', 5, 'Eurooppalainen', 'Energinen nuori kissa, vaatii paljon aktiviteetteja.', '', 'available'),
('Bella', 'Koira', 4, 'Kultainennoutaja', 'Erittäin ystävällinen ja lapsirakas koira. Rakastaa uimista ja pallon noutamista.', 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=600', 'available');