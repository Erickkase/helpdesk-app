const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 4000;
const databaseUrl = process.env.DATABASE_URL || 'postgres://helpdesk:helpdesk123@localhost:5432/helpdeskdb';

const pool = new Pool({ connectionString: databaseUrl });

app.use(cors());
app.use(express.json());

async function initializeDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tickets (
      id SERIAL PRIMARY KEY,
      title VARCHAR(120) NOT NULL,
      description TEXT NOT NULL,
      status VARCHAR(30) NOT NULL DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const result = await pool.query('SELECT COUNT(*) FROM tickets');
  if (Number(result.rows[0].count) === 0) {
    await pool.query(
      `INSERT INTO tickets (title, description, status) VALUES
      ($1, $2, $3),
      ($4, $5, $6)`,
      [
        'Cannot access system',
        'The user reports login issues.',
        'pending',
        'Printer not working',
        'The printer does not respond in the administration office.',
        'in_progress'
      ]
    );
  }
}

app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', service: 'helpdesk-backend', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'error', service: 'helpdesk-backend', database: 'disconnected' });
  }
});

app.get('/tickets', async (req, res) => {
  const result = await pool.query('SELECT * FROM tickets ORDER BY id ASC');
  res.json(result.rows);
});

app.post('/tickets', async (req, res) => {
  const { title, description } = req.body;

  if (!title || !description) {
    return res.status(400).json({ message: 'title and description are required' });
  }

  const result = await pool.query(
    'INSERT INTO tickets (title, description) VALUES ($1, $2) RETURNING *',
    [title, description]
  );

  res.status(201).json(result.rows[0]);
});

app.put('/tickets/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const allowedStatuses = ['pending', 'in_progress', 'resolved'];

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  const result = await pool.query(
    'UPDATE tickets SET status = $1 WHERE id = $2 RETURNING *',
    [status, id]
  );

  if (result.rowCount === 0) {
    return res.status(404).json({ message: 'Ticket not found' });
  }

  res.json(result.rows[0]);
});

initializeDatabase()
  .then(() => {
    app.listen(port, '0.0.0.0', () => {
      console.log(`HelpDesk backend running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error('Database initialization failed:', error);
    process.exit(1);
  });
