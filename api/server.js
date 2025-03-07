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

// PostgreSQL connection setup (legacy standalone)
// const pool = new Pool({
//   user: 'staffing-user',
//   host: 'localhost',
//   database: 'staffing',
//   password: 'changeMe',
//   port: 5432,
// });

// PostgreSQL connection setup with environmental variables
const pool = new Pool({
  user: process.env.PGUSER || 'staffing-user',
  host: process.env.PGHOST || 'localhost',
  database: process.env.PGDATABASE || 'staffing',
  password: process.env.PGPASSWORD || 'changeMe',
  port: process.env.PGPORT || 5432,
});

// Helper function to ensure dates are in the correct format for PostgreSQL
const formatDateForDB = (dateString) => {
  if (!dateString) return null;
  
  // If it's an ISO string with time component, extract just the date part
  if (typeof dateString === 'string' && dateString.includes('T')) {
    return dateString.split('T')[0];
  }
  
  return dateString;
};

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
      SELECT p.id, p.first_name, p.last_name, p.email_address, p.location_id, p.notes, p.position, p.coverage_percentage, l.name as location_name
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
      SELECT p.id, p.first_name, p.last_name, p.email_address, p.location_id, p.notes, p.position, p.coverage_percentage, l.name as location_name
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
  const { first_name, last_name, email_address, location_id, notes, position, coverage_percentage } = req.body;
  console.log('Received POST request with body:', req.body);
  
  // Validate required fields
  if (!first_name || !last_name || !location_id) {
    return res.status(400).json({ error: 'First name, last name, and location are required' });
  }
  
  // Validate coverage percentage
  const percentageValue = parseInt(coverage_percentage);
  if (coverage_percentage !== undefined && (isNaN(percentageValue) || percentageValue < 0 || percentageValue > 100)) {
    return res.status(400).json({ error: 'Coverage percentage must be a number between 0 and 100' });
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
      `INSERT INTO personnel (first_name, last_name, email_address, location_id, notes, position, coverage_percentage) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING id, first_name, last_name, email_address, location_id, notes, position, coverage_percentage`,
      [
        first_name.trim(),
        last_name.trim(),
        email_address ? email_address.trim() : null,
        location_id,
        notes || null,
        position || 'N/A',
        percentageValue || 100 // Default to 100 if not provided
      ]
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
  const { first_name, last_name, email_address, location_id, notes, position, coverage_percentage } = req.body;
  console.log(`Updating personnel ${id} with:`, req.body);
  
  // Validate required fields
  if (!first_name || !last_name || !location_id) {
    return res.status(400).json({ error: 'First name, last name, and location are required' });
  }
  
  // Validate coverage percentage
  const percentageValue = parseInt(coverage_percentage);
  if (coverage_percentage !== undefined && (isNaN(percentageValue) || percentageValue < 0 || percentageValue > 100)) {
    return res.status(400).json({ error: 'Coverage percentage must be a number between 0 and 100' });
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
       SET first_name = $1, last_name = $2, email_address = $3, location_id = $4, notes = $5, position = $6, coverage_percentage = $7, updated_at = NOW() 
       WHERE id = $8 
       RETURNING id, first_name, last_name, email_address, location_id, notes, position, coverage_percentage`,
      [
        first_name.trim(),
        last_name.trim(),
        email_address ? email_address.trim() : null,
        location_id,
        notes || null,
        position || 'N/A',
        percentageValue || 100, // Default to 100 if not provided
        id
      ]
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

// *** WORKPACKAGE API ENDPOINTS ***
// GET all workpackages with personnel information
app.get('/api/workpackages', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        w.id, 
        w.contract_number, 
        w.program_name, 
        w.project_number,
        w.pm_id,
        w.fa_id,
        w.dpme_id,
        CONCAT(pm.first_name, ' ', pm.last_name) as pmName,
        CONCAT(fa.first_name, ' ', fa.last_name) as faName,
        CONCAT(dpme.first_name, ' ', dpme.last_name) as dpmeName
      FROM workpackages w
      JOIN personnel pm ON w.pm_id = pm.id
      JOIN personnel fa ON w.fa_id = fa.id
      JOIN personnel dpme ON w.dpme_id = dpme.id
      ORDER BY w.program_name
    `);
    console.log('Sending workpackages:', result.rows);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching workpackages:', err);
    res.status(500).json({ error: 'Failed to fetch workpackages' });
  }
});

// GET workpackage by ID
app.get('/api/workpackages/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  
  try {
    const result = await pool.query(`
      SELECT 
        w.id, 
        w.contract_number, 
        w.program_name, 
        w.project_number,
        w.pm_id,
        w.fa_id,
        w.dpme_id,
        CONCAT(pm.first_name, ' ', pm.last_name) as pmName,
        CONCAT(fa.first_name, ' ', fa.last_name) as faName,
        CONCAT(dpme.first_name, ' ', dpme.last_name) as dpmeName
      FROM workpackages w
      JOIN personnel pm ON w.pm_id = pm.id
      JOIN personnel fa ON w.fa_id = fa.id
      JOIN personnel dpme ON w.dpme_id = dpme.id
      WHERE w.id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Workpackage not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching workpackage:', err);
    res.status(500).json({ error: 'Failed to fetch workpackage' });
  }
});

// POST create new workpackage
app.post('/api/workpackages', async (req, res) => {
  const { contract_number, program_name, project_number, pm_id, fa_id, dpme_id } = req.body;
  console.log('Received POST request with body:', req.body);
  
  // Validate required fields
  if (!contract_number || !program_name || !project_number || !pm_id || !fa_id || !dpme_id) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  
  try {
    // Begin transaction
    await pool.query('BEGIN');

    // Insert the workpackage
    const workpackageResult = await pool.query(
      `INSERT INTO workpackages (contract_number, program_name, project_number, pm_id, fa_id, dpme_id) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING id, contract_number, program_name, project_number, pm_id, fa_id, dpme_id`,
      [
        contract_number.trim(),
        program_name.trim(),
        project_number.trim(),
        pm_id,
        fa_id,
        dpme_id
      ]
    );
    
    // Get the personnel names for the response
    const namesResult = await pool.query(`
      SELECT 
        CONCAT(pm.first_name, ' ', pm.last_name) as pmName,
        CONCAT(fa.first_name, ' ', fa.last_name) as faName,
        CONCAT(dpme.first_name, ' ', dpme.last_name) as dpmeName
      FROM personnel pm, personnel fa, personnel dpme
      WHERE pm.id = $1 AND fa.id = $2 AND dpme.id = $3
    `, [pm_id, fa_id, dpme_id]);
    
    // Commit transaction
    await pool.query('COMMIT');
    
    const workpackage = {
      ...workpackageResult.rows[0],
      ...namesResult.rows[0]
    };
    
    console.log('Created new workpackage:', workpackage);
    res.status(201).json(workpackage);
  } catch (err) {
    // Rollback transaction in case of error
    await pool.query('ROLLBACK');
    console.error('Error creating workpackage:', err);
    res.status(500).json({ error: 'Failed to create workpackage' });
  }
});

// PUT update workpackage
app.put('/api/workpackages/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const { contract_number, program_name, project_number, pm_id, fa_id, dpme_id } = req.body;
  console.log(`Updating workpackage ${id} with:`, req.body);
  
  // Validate required fields
  if (!contract_number || !program_name || !project_number || !pm_id || !fa_id || !dpme_id) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  
  try {
    // Begin transaction
    await pool.query('BEGIN');
    
    const workpackageResult = await pool.query(
      `UPDATE workpackages 
       SET contract_number = $1, program_name = $2, project_number = $3, pm_id = $4, fa_id = $5, dpme_id = $6, updated_at = NOW() 
       WHERE id = $7 
       RETURNING id, contract_number, program_name, project_number, pm_id, fa_id, dpme_id`,
      [
        contract_number.trim(),
        program_name.trim(),
        project_number.trim(),
        pm_id,
        fa_id,
        dpme_id,
        id
      ]
    );
    
    if (workpackageResult.rows.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ error: 'Workpackage not found' });
    }
    
    // Get the personnel names for the response
    const namesResult = await pool.query(`
      SELECT 
        CONCAT(pm.first_name, ' ', pm.last_name) as pmName,
        CONCAT(fa.first_name, ' ', fa.last_name) as faName,
        CONCAT(dpme.first_name, ' ', dpme.last_name) as dpmeName
      FROM personnel pm, personnel fa, personnel dpme
      WHERE pm.id = $1 AND fa.id = $2 AND dpme.id = $3
    `, [pm_id, fa_id, dpme_id]);
    
    // Commit transaction
    await pool.query('COMMIT');
    
    const workpackage = {
      ...workpackageResult.rows[0],
      ...namesResult.rows[0]
    };
    
    console.log('Updated workpackage:', workpackage);
    res.json(workpackage);
  } catch (err) {
    // Rollback transaction in case of error
    await pool.query('ROLLBACK');
    console.error('Error updating workpackage:', err);
    res.status(500).json({ error: 'Failed to update workpackage' });
  }
});

// DELETE workpackage
app.delete('/api/workpackages/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  console.log(`Deleting workpackage with ID: ${id}`);
  
  try {
    const result = await pool.query('DELETE FROM workpackages WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Workpackage not found' });
    }
    
    console.log('Deleted workpackage:', result.rows[0]);
    res.status(200).json({ message: 'Workpackage deleted successfully' });
  } catch (err) {
    console.error('Error deleting workpackage:', err);
    res.status(500).json({ error: 'Failed to delete workpackage' });
  }
});

// *** CONTRACT LINE ITEMS API ENDPOINTS ***
// Add these to your existing Express app (server.js file)

// GET all line items for a specific workpackage
app.get('/api/workpackages/:workpackageId/line-items', async (req, res) => {
  const workpackageId = parseInt(req.params.workpackageId);
  
  try {
    const result = await pool.query(`
      SELECT 
        cli.id, 
        cli.workpackage_id,
        cli.task_ti,
        cli.project_task,
        cli.project_name,
        cli.start_date,
        cli.end_date,
        w.contract_number,
        w.program_name,
        w.project_number
      FROM contract_line_items cli
      JOIN workpackages w ON cli.workpackage_id = w.id
      WHERE cli.workpackage_id = $1
      ORDER BY cli.task_ti
    `, [workpackageId]);
    
    console.log(`Sending line items for workpackage ${workpackageId}:`, result.rows);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching line items:', err);
    res.status(500).json({ error: 'Failed to fetch line items' });
  }
});

// GET line item by ID
app.get('/api/line-items/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  
  try {
    const result = await pool.query(`
      SELECT 
        cli.id, 
        cli.workpackage_id,
        cli.task_ti,
        cli.project_task,
        cli.project_name,
        cli.start_date,
        cli.end_date,
        w.contract_number,
        w.program_name,
        w.project_number
      FROM contract_line_items cli
      JOIN workpackages w ON cli.workpackage_id = w.id
      WHERE cli.id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Line item not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching line item:', err);
    res.status(500).json({ error: 'Failed to fetch line item' });
  }
});

// POST create new line item
app.post('/api/line-items', async (req, res) => {
  const { workpackage_id, task_ti, project_task, project_name, start_date, end_date } = req.body;
  console.log('Received POST request with body:', req.body);
  
  // Validate required fields
  if (!workpackage_id || !task_ti || !project_task || !project_name || !start_date || !end_date) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  
  try {
    // Begin transaction
    await pool.query('BEGIN');

    // Check if workpackage exists
    const workpackageCheck = await pool.query(
      'SELECT id FROM workpackages WHERE id = $1',
      [workpackage_id]
    );
    
    if (workpackageCheck.rows.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(400).json({ error: 'Workpackage does not exist' });
    }

    // Insert the line item
    const lineItemResult = await pool.query(
      `INSERT INTO contract_line_items (workpackage_id, task_ti, project_task, project_name, start_date, end_date) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING id, workpackage_id, task_ti, project_task, project_name, start_date, end_date`,
      [
        workpackage_id,
        task_ti.trim(),
        project_task.trim(),
        project_name.trim(),
        start_date,
        end_date
      ]
    );
    
    // Get the workpackage details for the response
    const workpackageResult = await pool.query(`
      SELECT contract_number, program_name, project_number
      FROM workpackages
      WHERE id = $1
    `, [workpackage_id]);
    
    // Commit transaction
    await pool.query('COMMIT');
    
    const lineItem = {
      ...lineItemResult.rows[0],
      ...workpackageResult.rows[0]
    };
    
    console.log('Created new line item:', lineItem);
    res.status(201).json(lineItem);
  } catch (err) {
    // Rollback transaction in case of error
    await pool.query('ROLLBACK');
    console.error('Error creating line item:', err);
    res.status(500).json({ error: 'Failed to create line item' });
  }
});

// PUT update line item
app.put('/api/line-items/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const { task_ti, project_task, project_name, start_date, end_date } = req.body;
  console.log(`Updating line item ${id} with:`, req.body);
  
  // Validate required fields
  if (!task_ti || !project_task || !project_name || !start_date || !end_date) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  
  try {
    // Begin transaction
    await pool.query('BEGIN');
    
    const lineItemResult = await pool.query(
      `UPDATE contract_line_items 
       SET task_ti = $1, project_task = $2, project_name = $3, start_date = $4, end_date = $5, updated_at = NOW() 
       WHERE id = $6 
       RETURNING id, workpackage_id, task_ti, project_task, project_name, start_date, end_date`,
      [
        task_ti.trim(),
        project_task.trim(),
        project_name.trim(),
        start_date,
        end_date,
        id
      ]
    );
    
    if (lineItemResult.rows.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ error: 'Line item not found' });
    }
    
    // Get the workpackage details for the response
    const workpackageResult = await pool.query(`
      SELECT contract_number, program_name, project_number
      FROM workpackages
      WHERE id = $1
    `, [lineItemResult.rows[0].workpackage_id]);
    
    // Commit transaction
    await pool.query('COMMIT');
    
    const lineItem = {
      ...lineItemResult.rows[0],
      ...workpackageResult.rows[0]
    };
    
    console.log('Updated line item:', lineItem);
    res.json(lineItem);
  } catch (err) {
    // Rollback transaction in case of error
    await pool.query('ROLLBACK');
    console.error('Error updating line item:', err);
    res.status(500).json({ error: 'Failed to update line item' });
  }
});

// DELETE line item
app.delete('/api/line-items/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  console.log(`Deleting line item with ID: ${id}`);
  
  try {
    const result = await pool.query('DELETE FROM contract_line_items WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Line item not found' });
    }
    
    console.log('Deleted line item:', result.rows[0]);
    res.status(200).json({ message: 'Line item deleted successfully' });
  } catch (err) {
    console.error('Error deleting line item:', err);
    res.status(500).json({ error: 'Failed to delete line item' });
  }
});

// IMPORTANT: Add the next endpoint BEFORE the /api/personnel/:personnelId routes
// to avoid routing conflicts
// GET count of personnel starting new charge codes in next 14 days
app.get('/api/upcoming-charge-codes', async (req, res) => {
  try {
    // Calculate the date 14 days from now
    const today = new Date();
    const fourteenDaysFromNow = new Date(today);
    fourteenDaysFromNow.setDate(today.getDate() + 14);
    
    // Format dates for PostgreSQL
    const formattedToday = today.toISOString().split('T')[0];
    const formattedFuture = fourteenDaysFromNow.toISOString().split('T')[0];
    
    console.log('Date range for upcoming charge codes:', formattedToday, 'to', formattedFuture);
    
    // Simplified query - just get raw count
    const result = await pool.query(`
      SELECT COUNT(DISTINCT personnel_id) as count
      FROM personnel_charge_codes
      WHERE start_date >= $1::date AND start_date <= $2::date
    `, [formattedToday, formattedFuture]);
    
    const count = parseInt(result.rows[0].count, 10) || 0;
    console.log('Personnel starting new charge codes in next 14 days:', count);
    
    res.json({ count });
  } catch (err) {
    console.error('Error fetching upcoming charge code count:', err);
    res.status(500).json({ error: 'Failed to fetch upcoming charge code count', details: err.message });
  }
});

// GET personnel count by program name
app.get('/api/personnel-by-contract', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        wp.program_name AS contractName,
        COUNT(DISTINCT pcc.personnel_id) AS count
      FROM 
        personnel_charge_codes pcc
      JOIN 
        contract_line_items cli ON pcc.line_item_id = cli.id
      JOIN 
        workpackages wp ON cli.workpackage_id = wp.id
      WHERE
        CURRENT_DATE BETWEEN pcc.start_date AND pcc.end_date
      GROUP BY 
        wp.program_name
      ORDER BY 
        count DESC
    `);
    
    console.log('Sending personnel count by contract:', result.rows);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching personnel count by contract:', err);
    res.status(500).json({ error: 'Failed to fetch personnel count by contract' });
  }
});

// GET charge codes for a specific personnel
app.get('/api/personnel/:personnelId/charge-codes', async (req, res) => {
  const personnelId = parseInt(req.params.personnelId);
  
  try {
    const result = await pool.query(`
      SELECT 
        pcc.id,
        pcc.personnel_id,
        pcc.line_item_id,
        pcc.percentage,
        pcc.start_date,
        pcc.end_date,
        cli.task_ti,
        cli.project_name,
        CONCAT(cli.task_ti, ' - ', cli.project_name) as charge_code_name,
        wp.contract_number
      FROM personnel_charge_codes pcc
      JOIN contract_line_items cli ON pcc.line_item_id = cli.id
      JOIN workpackages wp ON cli.workpackage_id = wp.id
      WHERE pcc.personnel_id = $1
      ORDER BY pcc.start_date DESC
    `, [personnelId]);
    
    console.log(`Sending charge codes for personnel ${personnelId}:`, result.rows);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching personnel charge codes:', err);
    res.status(500).json({ error: 'Failed to fetch personnel charge codes' });
  }
});

// POST create a new charge code assignment for personnel
app.post('/api/personnel/:personnelId/charge-codes', async (req, res) => {
  const personnelId = parseInt(req.params.personnelId);
  const { line_item_id, percentage, start_date, end_date } = req.body;
  
  console.log(`Creating charge code for personnel ${personnelId}:`, req.body);
  
  // Validate required fields
  if (!line_item_id || !percentage || !start_date || !end_date) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  
  // Validate percentage is between 1 and 100
  if (percentage < 1 || percentage > 100) {
    return res.status(400).json({ error: 'Percentage must be between 1 and 100' });
  }
  
  try {
    // Format dates
    const formattedStartDate = formatDateForDB(start_date);
    const formattedEndDate = formatDateForDB(end_date);
    
    // Validate date range
    if (new Date(formattedStartDate) > new Date(formattedEndDate)) {
      return res.status(400).json({ error: 'Start date must be before end date' });
    }
    
    // Begin transaction
    await pool.query('BEGIN');
    
    // Check if line item exists
    const lineItemCheck = await pool.query(
      'SELECT id FROM contract_line_items WHERE id = $1',
      [line_item_id]
    );
    
    if (lineItemCheck.rows.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(400).json({ error: 'Line item does not exist' });
    }
    
    // Check if personnel exists
    const personnelCheck = await pool.query(
      'SELECT id FROM personnel WHERE id = $1',
      [personnelId]
    );
    
    if (personnelCheck.rows.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(400).json({ error: 'Personnel does not exist' });
    }
    
    // Insert the charge code assignment
    const result = await pool.query(`
      INSERT INTO personnel_charge_codes 
        (personnel_id, line_item_id, percentage, start_date, end_date) 
      VALUES 
        ($1, $2, $3, $4, $5) 
      RETURNING 
        id, personnel_id, line_item_id, percentage, start_date, end_date
    `, [
      personnelId,
      line_item_id,
      percentage,
      formattedStartDate,
      formattedEndDate
    ]);
    
    // Get the line item details for the response
    const lineItemResult = await pool.query(`
      SELECT 
        cli.task_ti, 
        cli.project_name,
        wp.contract_number
      FROM contract_line_items cli
      JOIN workpackages wp ON cli.workpackage_id = wp.id
      WHERE cli.id = $1
    `, [line_item_id]);
    
    // Commit transaction
    await pool.query('COMMIT');
    
    const responseData = {
      ...result.rows[0],
      task_ti: lineItemResult.rows[0].task_ti,
      project_name: lineItemResult.rows[0].project_name,
      charge_code_name: `${lineItemResult.rows[0].task_ti} - ${lineItemResult.rows[0].project_name}`,
      contract_number: lineItemResult.rows[0].contract_number
    };
    
    console.log('Created new personnel charge code assignment:', responseData);
    res.status(201).json(responseData);
  } catch (err) {
    // Rollback transaction in case of error
    await pool.query('ROLLBACK');
    console.error('Error creating personnel charge code assignment:', err);
    res.status(500).json({ error: 'Failed to create personnel charge code assignment' });
  }
});

// PUT update a charge code assignment
app.put('/api/personnel/:personnelId/charge-codes/:id', async (req, res) => {
  const personnelId = parseInt(req.params.personnelId);
  const id = parseInt(req.params.id);
  const { percentage, start_date, end_date } = req.body;
  
  console.log(`Updating charge code ${id} for personnel ${personnelId}:`, req.body);
  
  // Validate required fields
  if (!percentage || !start_date || !end_date) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  
  // Validate percentage is between 1 and 100
  if (percentage < 1 || percentage > 100) {
    return res.status(400).json({ error: 'Percentage must be between 1 and 100' });
  }
  
  try {
    // Format dates
    const formattedStartDate = formatDateForDB(start_date);
    const formattedEndDate = formatDateForDB(end_date);
    
    // Validate date range
    if (new Date(formattedStartDate) > new Date(formattedEndDate)) {
      return res.status(400).json({ error: 'Start date must be before end date' });
    }
    
    // Begin transaction
    await pool.query('BEGIN');
    
    // Check if the assignment exists and belongs to the specified personnel
    const assignmentCheck = await pool.query(
      'SELECT id FROM personnel_charge_codes WHERE id = $1 AND personnel_id = $2',
      [id, personnelId]
    );
    
    if (assignmentCheck.rows.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ error: 'Charge code assignment not found' });
    }
    
    // Update the charge code assignment
    const result = await pool.query(`
      UPDATE personnel_charge_codes 
      SET 
        percentage = $1, 
        start_date = $2, 
        end_date = $3, 
        updated_at = NOW() 
      WHERE 
        id = $4 AND personnel_id = $5 
      RETURNING 
        id, personnel_id, line_item_id, percentage, start_date, end_date
    `, [
      percentage,
      formattedStartDate,
      formattedEndDate,
      id,
      personnelId
    ]);
    
    // Get the line item details for the response
    const lineItemResult = await pool.query(`
      SELECT 
        cli.task_ti, 
        cli.project_name,
        wp.contract_number
      FROM personnel_charge_codes pcc
      JOIN contract_line_items cli ON pcc.line_item_id = cli.id
      JOIN workpackages wp ON cli.workpackage_id = wp.id
      WHERE pcc.id = $1
    `, [id]);
    
    // Commit transaction
    await pool.query('COMMIT');
    
    const responseData = {
      ...result.rows[0],
      task_ti: lineItemResult.rows[0].task_ti,
      project_name: lineItemResult.rows[0].project_name,
      charge_code_name: `${lineItemResult.rows[0].task_ti} - ${lineItemResult.rows[0].project_name}`,
      contract_number: lineItemResult.rows[0].contract_number
    };
    
    console.log('Updated personnel charge code assignment:', responseData);
    res.json(responseData);
  } catch (err) {
    // Rollback transaction in case of error
    await pool.query('ROLLBACK');
    console.error('Error updating personnel charge code assignment:', err);
    res.status(500).json({ error: 'Failed to update personnel charge code assignment' });
  }
});

// DELETE a charge code assignment
app.delete('/api/personnel/:personnelId/charge-codes/:id', async (req, res) => {
  const personnelId = parseInt(req.params.personnelId);
  const id = parseInt(req.params.id);
  
  console.log(`Deleting charge code ${id} for personnel ${personnelId}`);
  
  try {
    // Check if the assignment exists and belongs to the specified personnel
    const result = await pool.query(
      'DELETE FROM personnel_charge_codes WHERE id = $1 AND personnel_id = $2 RETURNING *',
      [id, personnelId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Charge code assignment not found' });
    }
    
    console.log('Deleted personnel charge code assignment:', result.rows[0]);
    res.status(200).json({ message: 'Charge code assignment deleted successfully' });
  } catch (err) {
    console.error('Error deleting personnel charge code assignment:', err);
    res.status(500).json({ error: 'Failed to delete personnel charge code assignment' });
  }
});

// GET all charge codes (line items) available for assignment
app.get('/api/charge-codes', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        cli.id, 
        cli.task_ti,
        cli.project_name,
        CONCAT(cli.task_ti, ' - ', cli.project_name) as charge_code_name,
        cli.start_date,
        cli.end_date,
        wp.contract_number,
        wp.program_name
      FROM contract_line_items cli
      JOIN workpackages wp ON cli.workpackage_id = wp.id
      ORDER BY cli.task_ti
    `);
    
    console.log('Sending available charge codes:', result.rows);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching available charge codes:', err);
    res.status(500).json({ error: 'Failed to fetch available charge codes' });
  }
});

// REPLACEMENT FOR: Update charge codes in bulk for a personnel
// Add this new endpoint to your server.js file

// This endpoint handles bulk updates of charge codes for a person,
// including removing all charge codes if an empty array is provided
app.put('/api/personnel/:personnelId/charge-codes-bulk', async (req, res) => {
  const personnelId = parseInt(req.params.personnelId);
  const { chargeCodes } = req.body;
  
  console.log(`Bulk updating charge codes for personnel ${personnelId}:`, chargeCodes);
  
  try {
    // Begin transaction
    await pool.query('BEGIN');
    
    // First, check if the personnel exists
    const personnelCheck = await pool.query(
      'SELECT id FROM personnel WHERE id = $1',
      [personnelId]
    );
    
    if (personnelCheck.rows.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ error: 'Personnel not found' });
    }
    
    // Delete all existing charge codes for this personnel
    await pool.query(
      'DELETE FROM personnel_charge_codes WHERE personnel_id = $1',
      [personnelId]
    );
    
    // If there are new charge codes to add, insert them
    const insertedChargeCodes = [];
    
    if (Array.isArray(chargeCodes) && chargeCodes.length > 0) {
      for (const chargeCode of chargeCodes) {
        // Validate required fields
        if (!chargeCode.line_item_id || !chargeCode.percentage || 
            !chargeCode.startDate || !chargeCode.endDate) {
          await pool.query('ROLLBACK');
          return res.status(400).json({ 
            error: 'All charge code fields are required',
            details: 'Each charge code must have line_item_id, percentage, startDate, and endDate'
          });
        }
        
        // Format dates
        const formattedStartDate = formatDateForDB(chargeCode.startDate);
        const formattedEndDate = formatDateForDB(chargeCode.endDate);
        
        // Insert the new charge code
        const result = await pool.query(`
          INSERT INTO personnel_charge_codes 
            (personnel_id, line_item_id, percentage, start_date, end_date) 
          VALUES 
            ($1, $2, $3, $4, $5) 
          RETURNING 
            id, personnel_id, line_item_id, percentage, start_date, end_date
        `, [
          personnelId,
          chargeCode.line_item_id,
          chargeCode.percentage,
          formattedStartDate,
          formattedEndDate
        ]);
        
        insertedChargeCodes.push(result.rows[0]);
      }
    }
    
    // Commit transaction
    await pool.query('COMMIT');
    
    console.log(`Successfully updated charge codes for personnel ${personnelId}. Count: ${insertedChargeCodes.length}`);
    res.status(200).json({
      message: 'Charge codes updated successfully',
      chargeCodes: insertedChargeCodes
    });
  } catch (err) {
    // Rollback transaction in case of error
    await pool.query('ROLLBACK');
    console.error('Error updating personnel charge codes:', err);
    res.status(500).json({ 
      error: 'Failed to update personnel charge codes',
      details: err.message
    });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});