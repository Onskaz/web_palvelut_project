const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Vastaanottaa adoptiohakemuksen Server A:lta
app.post('/adoptions', async (req, res) => {
  const { animal_id, applicant_name, applicant_email, applicant_phone, message } = req.body;

  if (!animal_id || !applicant_name || !applicant_email || !applicant_phone) {
    return res.status(400).json({ error: 'Pakollisia tietoja puuttuu.' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN'); // Aloitetaan transaktio

    // 1. Tarkistetaan eläimen olemassaolo ja status 
    const animalRes = await client.query(
      'SELECT status, name FROM animals WHERE id = $1 FOR UPDATE',
      [animal_id]
    );

    if (animalRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Eläintä ei löytynyt.' });
    }

    if (animalRes.rows[0].status === 'adopted') {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Tämä eläin on jo ehditty adoptoida!' });
    }

    // 2. Tallennetaan adoptiohakemus
    const adoptionRes = await client.query(
      `INSERT INTO adoptions (animal_id, applicant_name, applicant_email, applicant_phone, message)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [animal_id, applicant_name, applicant_email, applicant_phone, message || '']
    );

    // 3. Päivitetään eläimen status 
    await client.query(
      "UPDATE animals SET status = 'adopted' WHERE id = $1",
      [animal_id]
    );

    await client.query('COMMIT'); // Hyväksytään muutokset

    res.status(201).json({
      message: 'Adoptiohakemus vahvistettu!',
      adoption: adoptionRes.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Virhe Server B:ssä:', error);
    res.status(500).json({ error: 'Palvelinvirhe adoptiota käsiteltäessä.' });
  } finally {
    client.release();
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server B (Adoptiopalvelin) käynnissä portissa ${PORT}`);
});