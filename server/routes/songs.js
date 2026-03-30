const { Router } = require('express');
const db = require('../db');
const { broadcastRefresh } = require('../ws');

const router = Router();

// List all songs
router.get('/', (req, res) => {
  const { search } = req.query;
  let songs;
  if (search) {
    songs = db.prepare(
      `SELECT id, title, author, key, section, created_at FROM songs
       WHERE title LIKE ? OR author LIKE ? OR section LIKE ?
       ORDER BY title`
    ).all(`%${search}%`, `%${search}%`, `%${search}%`);
  } else {
    songs = db.prepare(
      'SELECT id, title, author, key, section, created_at FROM songs ORDER BY title'
    ).all();
  }
  res.json(songs);
});

// Get single song (with verses)
router.get('/:id', (req, res) => {
  const song = db.prepare('SELECT * FROM songs WHERE id = ?').get(req.params.id);
  if (!song) return res.status(404).json({ error: 'Song not found' });
  song.verses = JSON.parse(song.verses);
  res.json(song);
});

// Create song
router.post('/', (req, res) => {
  const { title, author, key, section, verses } = req.body;
  if (!title || !verses) return res.status(400).json({ error: 'title and verses required' });

  const result = db.prepare(
    'INSERT INTO songs (title, author, key, section, verses) VALUES (?, ?, ?, ?, ?)'
  ).run(title, author || '', key || '', section || '', JSON.stringify(verses));

  broadcastRefresh();
  res.status(201).json({ id: result.lastInsertRowid });
});

// Update song
router.put('/:id', (req, res) => {
  const { title, author, key, section, verses } = req.body;
  const existing = db.prepare('SELECT id FROM songs WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Song not found' });

  db.prepare(
    'UPDATE songs SET title = ?, author = ?, key = ?, section = ?, verses = ? WHERE id = ?'
  ).run(title, author || '', key || '', section || '', JSON.stringify(verses), req.params.id);

  broadcastRefresh();
  res.json({ success: true });
});

// Delete song
router.delete('/:id', (req, res) => {
  const existing = db.prepare('SELECT id FROM songs WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Song not found' });

  db.prepare('DELETE FROM songs WHERE id = ?').run(req.params.id);
  broadcastRefresh();
  res.json({ success: true });
});

module.exports = router;
