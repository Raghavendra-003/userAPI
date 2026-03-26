const express = require('express');
const db = require('./db');

const app = express();
app.use(express.json());

const PORT = 3000;

app.get('/users', (req, res) => {
  const { search = '', sort = 'id', order = 'asc' } = req.query;

  const query = `
    SELECT * FROM users
    WHERE name LIKE ? OR email LIKE ?
    ORDER BY ${sort} ${order.toUpperCase()}
  `;

  db.all(query, [`%${search}%`, `%${search}%`], (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows);
  });
});

app.get('/users/:id', (req, res) => {
  db.get(`SELECT * FROM users WHERE id = ?`, [req.params.id], (err, row) => {
    if (err) return res.status(500).json(err);
    if (!row) return res.status(404).json({ message: 'User not found' });
    res.json(row);
  });
});

app.get('/', (req, res) => {
  res.send('BuyerForeSight User API is running 🚀');
});

app.post('/users', (req, res) => {
  const { name, email, age } = req.body;

  const query = `INSERT INTO users (name, email, age) VALUES (?, ?, ?)`;

  db.run(query, [name, email, age], function (err) {
    if (err) return res.status(400).json({ error: err.message });

    res.status(201).json({
      id: this.lastID,
      name,
      email,
      age,
    });
  });
});


app.put('/users/:id', (req, res) => {
  const { name, email, age } = req.body;

  const query = `
    UPDATE users
    SET name = ?, email = ?, age = ?
    WHERE id = ?
  `;

  db.run(query, [name, email, age, req.params.id], function (err) {
    if (err) return res.status(400).json(err);
    if (this.changes === 0)
      return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'User updated successfully' });
  });
});


app.delete('/users/:id', (req, res) => {
  db.run(`DELETE FROM users WHERE id = ?`, [req.params.id], function (err) {
    if (err) return res.status(500).json(err);
    if (this.changes === 0)
      return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'User deleted successfully' });
  });
});


app.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});

