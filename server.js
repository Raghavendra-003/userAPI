const express = require('express');
const db = require('./db');

const app = express();
app.use(express.json());


app.get('/users', (req, res) => {
  const { search = '', sort = 'id', order = 'asc' } = req.query;

  const stmt = db.prepare(`
    SELECT * FROM users
    WHERE name LIKE ? OR email LIKE ?
    ORDER BY ${sort} ${order.toUpperCase()}
  `);

  const rows = stmt.all(`%${search}%`, `%${search}%`);
  res.json(rows);
});


app.get('/users/:id', (req, res) => {
  const stmt = db.prepare(`SELECT * FROM users WHERE id = ?`);
  const user = stmt.get(req.params.id);

  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
});



app.get('/', (req, res) => {
  res.send('BuyerForeSight User API is running 🚀');
});



app.post('/users', (req, res) => {
  const { name, email, age } = req.body;

  const stmt = db.prepare(
    `INSERT INTO users (name, email, age) VALUES (?, ?, ?)`
  );

  const info = stmt.run(name, email, age);

  res.status(201).json({ id: info.lastInsertRowid, name, email, age });
});


app.put('/users/:id', (req, res) => {
  const { name, email, age } = req.body;

  const stmt = db.prepare(
    `UPDATE users SET name=?, email=?, age=? WHERE id=?`
  );

  const info = stmt.run(name, email, age, req.params.id);

  if (info.changes === 0)
    return res.status(404).json({ message: 'User not found' });

  res.json({ message: 'User updated' });
});


app.delete('/users/:id', (req, res) => {
  const stmt = db.prepare(`DELETE FROM users WHERE id=?`);
  const info = stmt.run(req.params.id);

  if (info.changes === 0)
    return res.status(404).json({ message: 'User not found' });

  res.json({ message: 'User deleted' });
});



const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

