const { Router } = require('express');
const db = require('../db');
const { broadcastRefresh } = require('../ws');

const router = Router();

// List all masses (with optional search by date or name)
router.get('/', (req, res) => {
  const { search } = req.query;
  let masses;
  if (search) {
    masses = db.prepare(
      `SELECT id, date, name, active, created_at FROM masses
       WHERE date LIKE ? OR name LIKE ?
       ORDER BY date DESC`
    ).all(`%${search}%`, `%${search}%`);
  } else {
    masses = db.prepare('SELECT id, date, name, active, created_at FROM masses ORDER BY date DESC').all();
  }

  // Attach song count to each mass
  const countStmt = db.prepare('SELECT COUNT(*) as c FROM mass_songs WHERE mass_id = ?');
  for (const m of masses) {
    m.songCount = countStmt.get(m.id).c;
  }

  res.json(masses);
});

// Get active mass (for karaoke home)
router.get('/active', (req, res) => {
  const mass = db.prepare('SELECT * FROM masses WHERE active = 1').get();
  if (!mass) return res.status(404).json({ error: 'No active mass' });

  const songs = db.prepare(
    `SELECT s.id, s.title, s.author, s.key, s.section, s.verses
     FROM mass_songs ms
     JOIN songs s ON s.id = ms.song_id
     WHERE ms.mass_id = ?
     ORDER BY ms.position`
  ).all(mass.id);

  songs.forEach(s => { s.verses = JSON.parse(s.verses); });
  res.json({ mass: { id: mass.id, date: mass.date, name: mass.name }, songs });
});

// Set a mass as active (deactivates all others)
router.post('/:id/activate', (req, res) => {
  const mass = db.prepare('SELECT id FROM masses WHERE id = ?').get(req.params.id);
  if (!mass) return res.status(404).json({ error: 'Mass not found' });

  db.prepare('UPDATE masses SET active = 0').run();
  db.prepare('UPDATE masses SET active = 1 WHERE id = ?').run(req.params.id);
  broadcastRefresh();
  res.json({ success: true });
});

// Get single mass with its songs
router.get('/:id', (req, res) => {
  const mass = db.prepare('SELECT * FROM masses WHERE id = ?').get(req.params.id);
  if (!mass) return res.status(404).json({ error: 'Mass not found' });

  const songs = db.prepare(
    `SELECT s.id, s.title, s.author, s.key, s.section, ms.position
     FROM mass_songs ms
     JOIN songs s ON s.id = ms.song_id
     WHERE ms.mass_id = ?
     ORDER BY ms.position`
  ).all(req.params.id);

  mass.songs = songs;
  res.json(mass);
});

// Get mass songs in karaoke format (full verses)
router.get('/:id/karaoke', (req, res) => {
  const mass = db.prepare('SELECT * FROM masses WHERE id = ?').get(req.params.id);
  if (!mass) return res.status(404).json({ error: 'Mass not found' });

  const songs = db.prepare(
    `SELECT s.id, s.title, s.author, s.key, s.section, s.verses
     FROM mass_songs ms
     JOIN songs s ON s.id = ms.song_id
     WHERE ms.mass_id = ?
     ORDER BY ms.position`
  ).all(req.params.id);

  songs.forEach(s => { s.verses = JSON.parse(s.verses); });
  res.json({ mass: { id: mass.id, date: mass.date, name: mass.name }, songs });
});

// Create mass
router.post('/', (req, res) => {
  const { date, name, songIds } = req.body;
  if (!date) return res.status(400).json({ error: 'date is required' });

  const existing = db.prepare('SELECT id FROM masses WHERE date = ?').get(date);
  if (existing) return res.status(409).json({ error: 'A mass already exists for this date' });

  const result = db.prepare('INSERT INTO masses (date, name) VALUES (?, ?)').run(date, name || '');
  const massId = result.lastInsertRowid;

  if (songIds && songIds.length > 0) {
    const insertSong = db.prepare(
      'INSERT INTO mass_songs (mass_id, song_id, position) VALUES (?, ?, ?)'
    );
    const insertAll = db.transaction((ids) => {
      ids.forEach((songId, i) => insertSong.run(massId, songId, i));
    });
    insertAll(songIds);
  }

  broadcastRefresh();
  res.status(201).json({ id: massId });
});

// Update mass
router.put('/:id', (req, res) => {
  const { date, name, songIds } = req.body;
  const mass = db.prepare('SELECT id FROM masses WHERE id = ?').get(req.params.id);
  if (!mass) return res.status(404).json({ error: 'Mass not found' });

  // Check date uniqueness (excluding current)
  if (date) {
    const dup = db.prepare('SELECT id FROM masses WHERE date = ? AND id != ?').get(date, req.params.id);
    if (dup) return res.status(409).json({ error: 'A mass already exists for this date' });
  }

  db.prepare('UPDATE masses SET date = ?, name = ? WHERE id = ?').run(
    date, name || '', req.params.id
  );

  // Replace songs if provided
  if (songIds) {
    db.prepare('DELETE FROM mass_songs WHERE mass_id = ?').run(req.params.id);
    const insertSong = db.prepare(
      'INSERT INTO mass_songs (mass_id, song_id, position) VALUES (?, ?, ?)'
    );
    const insertAll = db.transaction((ids) => {
      ids.forEach((songId, i) => insertSong.run(req.params.id, songId, i));
    });
    insertAll(songIds);
  }

  broadcastRefresh();
  res.json({ success: true });
});

// Delete mass
router.delete('/:id', (req, res) => {
  const mass = db.prepare('SELECT id FROM masses WHERE id = ?').get(req.params.id);
  if (!mass) return res.status(404).json({ error: 'Mass not found' });

  db.prepare('DELETE FROM masses WHERE id = ?').run(req.params.id);
  broadcastRefresh();
  res.json({ success: true });
});

module.exports = router;
