import express from 'express';
import pkg from 'pg';
const { Pool } = pkg;
import cors from 'cors';

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // Update this to match your Vue app's URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// PostgreSQL connection setup
const pool = new Pool({
  user: 'staffing-user',
  host: 'localhost',
  database: 'staffing',
  password: 'changeMe',
  port: 5432,
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Database connected successfully');
  }
});

// Routes
// GET all locations
app.get('/api/locations', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM locations ORDER BY name');
    console.log('Sending locations:', result.rows);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching locations:', err);
    res.status(500).json({ error: 'Failed to fetch locations' });
  }
});

// GET location by ID
app.get('/api/locations/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  
  try {
    const result = await pool.query('SELECT * FROM locations WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Location not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching location:', err);
    res.status(500).json({ error: 'Failed to fetch location' });
  }
});

// POST create new location
app.post('/api/locations', async (req, res) => {
  const { name } = req.body;
  console.log('Received POST request with body:', req.body);
  
  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Location name is required' });
  }
  
  try {
    const result = await pool.query(
      'INSERT INTO locations (name) VALUES ($1) RETURNING *',
      [name.trim()]
    );
    
    console.log('Created new location:', result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating location:', err);
    res.status(500).json({ error: 'Failed to create location' });
  }
});

// PUT update location
app.put('/api/locations/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const { name } = req.body;
  console.log(`Updating location ${id} with name: ${name}`);
  
  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Location name is required' });
  }
  
  try {
    const result = await pool.query(
      'UPDATE locations SET name = $1 WHERE id = $2 RETURNING *',
      [name.trim(), id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Location not found' });
    }
    
    console.log('Updated location:', result.rows[0]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating location:', err);
    res.status(500).json({ error: 'Failed to update location' });
  }
});

// DELETE location
app.delete('/api/locations/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  console.log(`Deleting location with ID: ${id}`);
  
  try {
    const result = await pool.query('DELETE FROM locations WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Location not found' });
    }
    
    console.log('Deleted location:', result.rows[0]);
    res.status(200).json({ message: 'Location deleted successfully' });
  } catch (err) {
    console.error('Error deleting location:', err);
    res.status(500).json({ error: 'Failed to delete location' });
  }
});

// *** PERSONNEL API ENDPOINTS ***
// GET all personnel with location information
app.get('/api/personnel', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.id, p.first_name, p.last_name, p.email_address, p.location_id, p.notes, l.name as location_name
      FROM personnel p
      JOIN locations l ON p.location_id = l.id
      ORDER BY p.last_name, p.first_name
    `);
    console.log('Sending personnel:', result.rows);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching personnel:', err);
    res.status(500).json({ error: 'Failed to fetch personnel' });
  }
});

// GET personnel by ID
app.get('/api/personnel/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  
  try {
    const result = await pool.query(`
      SELECT p.id, p.first_name, p.last_name, p.email_address, p.location_id, p.notes, l.name as location_name
      FROM personnel p
      JOIN locations l ON p.location_id = l.id
      WHERE p.id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Personnel not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching personnel:', err);
    res.status(500).json({ error: 'Failed to fetch personnel' });
  }
});

// POST create new personnel
app.post('/api/personnel', async (req, res) => {
  const { first_name, last_name, email_address, location_id, notes } = req.body;
  console.log('Received POST request with body:', req.body);
  
  // Validate required fields
  if (!first_name || !last_name || !location_id) {
    return res.status(400).json({ error: 'First name, last name, and location are required' });
  }
  
  try {
    // Check if email already exists (only if an email was provided)
    if (email_address && email_address.trim() !== '') {
    const emailCheck = await pool.query(
      'SELECT id FROM personnel WHERE email_address = $1',
      [email_address]
    );
    
    if (emailCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Email address already exists' });
      }
    }
    
    const result = await pool.query(
      `INSERT INTO personnel (first_name, last_name, email_address, location_id, notes) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, first_name, last_name, email_address, location_id, notes`,
      [first_name.trim(), last_name.trim(), email_address ? email_address.trim() : null, location_id, notes || null]
    );
    
    // Get location name for the response
    const locationResult = await pool.query(
      'SELECT name FROM locations WHERE id = $1',
      [location_id]
    );
    
    const personnel = {
      ...result.rows[0],
      location_name: locationResult.rows[0]?.name
    };
    
    console.log('Created new personnel:', personnel);
    res.status(201).json(personnel);
  } catch (err) {
    console.error('Error creating personnel:', err);
    res.status(500).json({ error: 'Failed to create personnel' });
  }
});

// PUT update personnel
app.put('/api/personnel/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const { first_name, last_name, email_address, location_id, notes } = req.body;
  console.log(`Updating personnel ${id} with:`, req.body);
  
  // Validate required fields
  if (!first_name || !last_name || !location_id) {
    return res.status(400).json({ error: 'First name, last name, and location are required' });
  }
  
  try {
    // Check if email already exists for another person (only if an email was provided)
    if (email_address && email_address.trim() !== '') {
    const emailCheck = await pool.query(
      'SELECT id FROM personnel WHERE email_address = $1 AND id != $2',
      [email_address, id]
    );
    
    if (emailCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Email address already exists' });
      }
    }
    
    const result = await pool.query(
      `UPDATE personnel 
       SET first_name = $1, last_name = $2, email_address = $3, location_id = $4, notes = $5, updated_at = NOW() 
       WHERE id = $6 
       RETURNING id, first_name, last_name, email_address, location_id, notes`,
      [first_name.trim(), last_name.trim(), email_address ? email_address.trim() : null, location_id, notes || null, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Personnel not found' });
    }
    
    // Get location name for the response
    const locationResult = await pool.query(
      'SELECT name FROM locations WHERE id = $1',
      [location_id]
    );
    
    const personnel = {
      ...result.rows[0],
      location_name: locationResult.rows[0]?.name
    };
    
    console.log('Updated personnel:', personnel);
    res.json(personnel);
  } catch (err) {
    console.error('Error updating personnel:', err);
    res.status(500).json({ error: 'Failed to update personnel' });
  }
});

// DELETE personnel
app.delete('/api/personnel/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  console.log(`Deleting personnel with ID: ${id}`);
  
  try {
    const result = await pool.query('DELETE FROM personnel WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Personnel not found' });
    }
    
    console.log('Deleted personnel:', result.rows[0]);
    res.status(200).json({ message: 'Personnel deleted successfully' });
  } catch (err) {
    console.error('Error deleting personnel:', err);
    res.status(500).json({ error: 'Failed to delete personnel' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});