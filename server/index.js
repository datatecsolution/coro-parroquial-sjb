const http = require('http');
const express = require('express');
const path = require('path');
const fs = require('fs');
const { initWebSocket } = require('./ws');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json({ limit: '5mb' }));

// Uploads directory
const uploadsDir = path.join(__dirname, '..', 'data', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// Serve uploaded files
app.use('/uploads', express.static(uploadsDir));

// Upload image endpoint
app.post('/api/uploads', (req, res) => {
  // Read raw body as base64
  const { filename, data } = req.body;
  if (!filename || !data) return res.status(400).json({ error: 'filename and data required' });

  // Sanitize filename
  const safeName = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9._-]/g, '')}`;
  const filePath = path.join(uploadsDir, safeName);

  // Write base64 data
  const buffer = Buffer.from(data, 'base64');
  fs.writeFileSync(filePath, buffer);

  res.json({ url: `/uploads/${safeName}` });
});

// List uploaded images
app.get('/api/uploads', (req, res) => {
  const files = fs.readdirSync(uploadsDir)
    .filter(f => /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(f))
    .map(f => ({ name: f, url: `/uploads/${f}` }));
  res.json(files);
});

// Delete uploaded image
app.delete('/api/uploads/:filename', (req, res) => {
  const safeName = req.params.filename.replace(/[^a-zA-Z0-9._-]/g, '');
  const filePath = path.join(uploadsDir, safeName);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'File not found' });
  }
});

// API routes
app.use('/api/songs', require('./routes/songs'));
app.use('/api/masses', require('./routes/masses'));

// Serve static files from Vite build
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

// SPA fallback
app.get('/{*splat}', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// Create HTTP server and mount WebSocket
const server = http.createServer(app);
initWebSocket(server);

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Karaoke server running on http://0.0.0.0:${PORT}`);
});
