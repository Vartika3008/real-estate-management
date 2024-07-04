// server.js
const express = require('express');
const bodyParser = require('body-parser');
const pool = require('./db');

const app = express();
app.use(bodyParser.json());

const PORT = 3000;

// API to add new property
app.post('/add_new_property', async (req, res) => {
  const { property_name, locality, owner_name } = req.body;
  try {
    // Ensure the locality exists or create it
    const localityResult = await pool.query('INSERT INTO Localities (name) VALUES ($1) ON CONFLICT (name) DO NOTHING RETURNING id', [locality]);
    let localityId = localityResult.rows[0]?.id;

    if (!localityId) {
      const localityFetchResult = await pool.query('SELECT id FROM Localities WHERE name = $1', [locality]);
      localityId = localityFetchResult.rows[0].id;
    }

    // Insert the property
    const propertyResult = await pool.query(
      'INSERT INTO Properties (property_name, locality_id, owner_name) VALUES ($1, $2, $3) RETURNING id',
      [property_name, localityId, owner_name]
    );

    res.json({ message: 'Property added', property_id: propertyResult.rows[0].id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while adding the property' });
  }
});

// API to fetch all properties by locality
app.get('/fetch_all_properties', async (req, res) => {
  const { locality_name, locality_id } = req.query;
  try {
    let localityId = locality_id;

    if (locality_name && !locality_id) {
      const localityResult = await pool.query('SELECT id FROM Localities WHERE name = $1', [locality_name]);
      localityId = localityResult.rows[0]?.id;
      if (!localityId) {
        return res.status(404).json({ error: 'Locality not found' });
      }
    }

    const propertiesResult = await pool.query('SELECT id, property_name, owner_name FROM Properties WHERE locality_id = $1', [localityId]);

    res.json(propertiesResult.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while fetching the properties' });
  }
});

// API to update property details
app.put('/update_property_details', async (req, res) => {
  const { property_id, locality_id, owner_name } = req.body;
  try {
    const result = await pool.query(
      'UPDATE Properties SET locality_id = $1, owner_name = $2 WHERE id = $3 RETURNING *',
      [locality_id, owner_name, property_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Property not found' });
    }

    res.json({ message: 'Property updated', property: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while updating the property' });
  }
});

// API to delete property record
app.delete('/delete_property_record', async (req, res) => {
  const { property_id } = req.body;
  try {
    const result = await pool.query('DELETE FROM Properties WHERE id = $1 RETURNING *', [property_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Property not found' });
    }

    res.json({ message: 'Property deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while deleting the property' });
  }
});

// Additional API: Fetch all localities
app.get('/fetch_all_localities', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name FROM Localities');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while fetching the localities' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
