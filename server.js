const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize database
const db = new sqlite3.Database('./notes.db', (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    // Create tables if they don't exist
    db.run(`CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text TEXT NOT NULL,
      parent_id INTEGER NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (parent_id) REFERENCES notes (id) ON DELETE CASCADE
    )`);
  }
});

// API Routes
// Get all main notes (no parent)
app.get('/api/notes', (req, res) => {
  db.all(`SELECT * FROM notes WHERE parent_id IS NULL ORDER BY created_at DESC`, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Get replies for a specific note
app.get('/api/notes/:id/replies', (req, res) => {
  db.all(`SELECT * FROM notes WHERE parent_id = ? ORDER BY created_at ASC`, [req.params.id], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Create a new note
app.post('/api/notes', (req, res) => {
  const { text, parent_id } = req.body;
  
  if (!text) {
    return res.status(400).json({ error: 'Text is required' });
  }
  
  const sql = `INSERT INTO notes (text, parent_id) VALUES (?, ?)`;
  db.run(sql, [text, parent_id || null], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    // Return the created note with its ID
    db.get(`SELECT * FROM notes WHERE id = ?`, [this.lastID], (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json(row);
    });
  });
});

// Delete a note and its replies
app.delete('/api/notes/:id', (req, res) => {
  // First delete any replies
  db.run(`DELETE FROM notes WHERE parent_id = ?`, [req.params.id], (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    // Then delete the main note
    db.run(`DELETE FROM notes WHERE id = ?`, [req.params.id], function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: 'Note deleted', changes: this.changes });
    });
  });
});

// Serve the main HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});