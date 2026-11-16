const express = require('express');
const path = require('path');
const { Pool } = require('pg');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const SERVER_B_URL = process.env.SERVER_B_URL || 'http://localhost:4000';

// Palauttaa kaikki eläimet
app.get('/animals', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM animals ORDER BY id ASC');
    res.json(result.rows);
  } catch (error) {
    console.error('Virhe eläimiä haettaessa:', error);
    res.status(500).json({ error: 'Tietokantavirhe' });
  }
});

// Palauttaa yhden eläimen tiedot
app.get('/animals/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM animals WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Eläintä ei löytynyt' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Virhe eläintä haettaessa:', error);
    res.status(500).json({ error: 'Tietokantavirhe' });
  }
});

//  Vastaanottaa hakemuksen frontendiltä ja välittää Server B:lle
app.post('/animals/:id/adopt', async (req, res) => {
  const animalId = parseInt(req.params.id, 10);
  const { applicant_name, applicant_email, applicant_phone, message } = req.body;

  try {
    // Välitetään pyyntö Server B:lle Docker-verkon kautta
    const response = await fetch(`${SERVER_B_URL}/adoptions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        animal_id: animalId,
        applicant_name,
        applicant_email,
        applicant_phone,
        message
      })
    });

    const data = await response.json();
    // Palautetaan Server B:n vastaus ja statuskoodi frontendille
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Virhe kommunikoitaessa Server B:n kanssa:', error);
    res.status(502).json({ error: 'Yhteys adoptiopalvelimeen (Server B) epäonnistui.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server A (Pääpalvelin) käynnissä: http://localhost:${PORT}`);
});